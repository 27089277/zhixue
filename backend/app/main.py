import json
import socket
from datetime import datetime
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from .database import Base, engine, get_db, settings
from .models import Assignment, Paper, Question, Submission, SubmissionStatus
from .schemas import (
    AnswerSave,
    AiAssemblePaperRequest,
    AiGenerateQuestionsRequest,
    AiImportPaperRequest,
    AiAnalyzeRequest,
    AiStructuredResponse,
    AiWebImportPaperRequest,
    AssignmentCreate,
    AssignmentOut,
    GradeSubmission,
    PaperOut,
    SubmissionCreate,
    SubmissionOut,
)

app = FastAPI(title="智学云教 API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[item.strip() for item in settings.cors_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def create_tables() -> None:
    Base.metadata.create_all(engine)


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}


def _extract_json(text: str) -> dict:
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        start = text.find("{")
        end = text.rfind("}")
        if start >= 0 and end > start:
            return json.loads(text[start : end + 1])
        raise HTTPException(502, "AI 返回内容不是有效 JSON")


def call_deepseek_json(system_prompt: str, user_payload: dict) -> dict:
    if not settings.deepseek_api_key:
        raise HTTPException(503, "未配置 DEEPSEEK_API_KEY")
    body = {
        "model": settings.deepseek_model,
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": json.dumps(user_payload, ensure_ascii=False)},
        ],
        "temperature": 0.2,
    }
    request = Request(
        f"{settings.deepseek_base_url.rstrip('/')}/chat/completions",
        data=json.dumps(body).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {settings.deepseek_api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urlopen(request, timeout=settings.deepseek_timeout_seconds) as response:
            data = json.loads(response.read().decode("utf-8"))
    except HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="ignore")[:500]
        raise HTTPException(exc.code, f"DeepSeek 调用失败：{detail}") from exc
    except URLError as exc:
        raise HTTPException(502, f"DeepSeek 网络连接失败：{exc.reason}") from exc
    except (socket.timeout, TimeoutError) as exc:
        raise HTTPException(504, "DeepSeek 响应超时，请稍后重试或缩小导入范围") from exc
    content = data["choices"][0]["message"]["content"]
    return _extract_json(content)


def fetch_source_text(source_url: str) -> str:
    if not source_url:
        return ""
    if not source_url.startswith(("http://", "https://")):
        raise HTTPException(400, "source_url 必须是 http/https 链接")
    request = Request(
        source_url,
        headers={
            "User-Agent": "Mozilla/5.0 ZhixueYunjiaoBot/0.1",
            "Accept": "text/html,application/pdf,text/plain,*/*",
        },
    )
    try:
        with urlopen(request, timeout=30) as response:
            content_type = response.headers.get("content-type", "")
            raw = response.read(120_000)
    except HTTPError as exc:
        raise HTTPException(exc.code, "真题网页抓取失败") from exc
    except URLError as exc:
        raise HTTPException(502, f"真题网页网络连接失败：{exc.reason}") from exc
    if "pdf" in content_type:
        return "已抓取 PDF 文件。当前原型未集成 PDF OCR/解析器，请接入 pdfplumber 或文档解析服务后提取正文。"
    return raw.decode("utf-8", errors="ignore")[:20000]


@app.post("/api/ai/import-paper", response_model=AiStructuredResponse)
def ai_import_paper(payload: AiImportPaperRequest) -> AiStructuredResponse:
    result = call_deepseek_json(
        "你是中学教研题库专家。根据输入的历史真题信息，输出严格 JSON：paper 字段包含 title、subject、exam_type、region、year、duration_minutes、total_score、sections、tags；questions 字段是题目数组，每题包含 number、type、stem、options、standard_answer、analysis、score、knowledge_points、difficulty。不要输出 Markdown。",
        payload.model_dump(),
    )
    return AiStructuredResponse(
        provider="deepseek",
        model=settings.deepseek_model,
        result=result,
    )


@app.post("/api/ai/web-import-paper", response_model=AiStructuredResponse)
def ai_web_import_paper(payload: AiWebImportPaperRequest) -> AiStructuredResponse:
    page_text = fetch_source_text(payload.source_url)
    user_payload = payload.model_dump()
    user_payload["fetched_text"] = page_text
    result = call_deepseek_json(
        "你是中学教研题库专家。用户可能提供搜索关键词、真题网页链接或网页正文。请输出严格 JSON：search_results 为候选来源数组，每项含 title、source、url、confidence；paper 字段包含 title、subject、exam_type、region、year、duration_minutes、total_score、sections、tags；questions 字段是题目数组，每题包含 number、type、stem、options、standard_answer、analysis、score、knowledge_points、difficulty。若没有真实网页正文，只能根据关键词生成导入草稿并在 paper.tags 中标注 AI草稿。不要输出 Markdown。",
        user_payload,
    )
    return AiStructuredResponse(provider="deepseek", model=settings.deepseek_model, result=result)


@app.post("/api/ai/generate-questions", response_model=AiStructuredResponse)
def ai_generate_questions(payload: AiGenerateQuestionsRequest) -> AiStructuredResponse:
    result = call_deepseek_json(
        "你是中学数学命题专家。按要求生成题目，输出严格 JSON：questions 数组，每题包含 type、stem、options、standard_answer、analysis、score、knowledge_points、difficulty、teaching_tip。不要输出 Markdown。",
        payload.model_dump(),
    )
    return AiStructuredResponse(provider="deepseek", model=settings.deepseek_model, result=result)


@app.post("/api/ai/assemble-paper", response_model=AiStructuredResponse)
def ai_assemble_paper(payload: AiAssemblePaperRequest) -> AiStructuredResponse:
    result = call_deepseek_json(
        "你是学校教研组长。根据知识点、题量、总分和难度比例设计一张可发布试卷，输出严格 JSON：paper 字段和 blueprint 字段。blueprint 每项包含 section、question_type、count、score_each、knowledge_points、difficulty、selection_rule。不要输出 Markdown。",
        payload.model_dump(),
    )
    return AiStructuredResponse(provider="deepseek", model=settings.deepseek_model, result=result)


@app.post("/api/ai/analyze", response_model=AiStructuredResponse)
def ai_analyze(payload: AiAnalyzeRequest) -> AiStructuredResponse:
    result = call_deepseek_json(
        "你是教育 SaaS 的 AI 教学助手。根据 scene、role、question、context 输出严格 JSON：summary 一句话总结；insights 数组，每项包含 title、detail、priority；actions 数组，每项包含 label、target_module、reason；risks 数组，每项包含 name、reason、suggestion。不要输出 Markdown。",
        payload.model_dump(),
    )
    return AiStructuredResponse(provider="deepseek", model=settings.deepseek_model, result=result)


@app.get("/api/papers", response_model=list[PaperOut])
def list_papers(db: Session = Depends(get_db)) -> list[Paper]:
    return list(
        db.scalars(
            select(Paper)
            .where(Paper.published.is_(True))
            .options(selectinload(Paper.questions))
            .order_by(Paper.year.desc(), Paper.id.desc())
        )
    )


@app.get("/api/papers/{paper_id}", response_model=PaperOut)
def get_paper(paper_id: int, db: Session = Depends(get_db)) -> Paper:
    paper = db.scalar(
        select(Paper).where(Paper.id == paper_id).options(selectinload(Paper.questions))
    )
    if not paper:
        raise HTTPException(404, "试卷不存在")
    return paper


@app.post("/api/assignments", response_model=AssignmentOut, status_code=201)
def create_assignment(payload: AssignmentCreate, db: Session = Depends(get_db)) -> Assignment:
    if not db.get(Paper, payload.paper_id):
        raise HTTPException(404, "试卷不存在")
    assignment = Assignment(**payload.model_dump())
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment


@app.get("/api/assignments", response_model=list[AssignmentOut])
def list_assignments(db: Session = Depends(get_db)) -> list[Assignment]:
    return list(db.scalars(select(Assignment).order_by(Assignment.deadline)))


@app.post("/api/submissions", response_model=SubmissionOut, status_code=201)
def create_submission(payload: SubmissionCreate, db: Session = Depends(get_db)) -> Submission:
    submission = db.scalar(
        select(Submission).where(
            Submission.assignment_id == payload.assignment_id,
            Submission.student_id == payload.student_id,
        )
    )
    if submission:
        return submission
    submission = Submission(**payload.model_dump(), answers={})
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return submission


@app.put("/api/submissions/{submission_id}/answers", response_model=SubmissionOut)
def save_answer(submission_id: int, payload: AnswerSave, db: Session = Depends(get_db)) -> Submission:
    submission = db.get(Submission, submission_id)
    if not submission or submission.status != SubmissionStatus.draft:
        raise HTTPException(409, "答卷不存在或已交卷")
    answers = dict(submission.answers)
    answers[str(payload.question_id)] = payload.model_dump(exclude_none=True)
    submission.answers = answers
    db.commit()
    db.refresh(submission)
    return submission


@app.post("/api/submissions/{submission_id}/submit", response_model=SubmissionOut)
def submit_paper(submission_id: int, db: Session = Depends(get_db)) -> Submission:
    submission = db.get(Submission, submission_id)
    if not submission or submission.status != SubmissionStatus.draft:
        raise HTTPException(409, "答卷不存在或已交卷")
    assignment = db.get(Assignment, submission.assignment_id)
    questions = list(db.scalars(select(Question).where(Question.paper_id == assignment.paper_id)))
    objective_score = 0
    for question in questions:
        if question.type not in {"单选题", "多选题", "填空题"}:
            continue
        answer = submission.answers.get(str(question.id), {}).get("value")
        if answer == question.standard_answer:
            objective_score += question.score
    submission.objective_score = objective_score
    submission.status = SubmissionStatus.grading
    submission.submitted_at = datetime.utcnow()
    db.commit()
    db.refresh(submission)
    return submission


@app.post("/api/submissions/{submission_id}/grade", response_model=SubmissionOut)
def grade_submission(
    submission_id: int, payload: GradeSubmission, db: Session = Depends(get_db)
) -> Submission:
    submission = db.get(Submission, submission_id)
    if not submission or submission.status not in {SubmissionStatus.submitted, SubmissionStatus.grading}:
        raise HTTPException(409, "答卷状态不允许批改")
    submission.manual_score = payload.manual_score
    submission.feedback = payload.feedback
    submission.status = SubmissionStatus.graded
    submission.graded_at = datetime.utcnow()
    db.commit()
    db.refresh(submission)
    return submission
