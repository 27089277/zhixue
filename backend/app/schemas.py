from __future__ import annotations

from datetime import datetime
from typing import Optional, Union

from pydantic import BaseModel, ConfigDict, Field


class QuestionOut(BaseModel):
    id: int
    number: int
    type: str
    stem: str
    options: Optional[list]
    score: int
    knowledge_points: list
    model_config = ConfigDict(from_attributes=True)


class PaperOut(BaseModel):
    id: int
    title: str
    subject: str
    exam_type: str
    region: str
    year: int
    duration_minutes: int
    total_score: int
    published: bool
    questions: list[QuestionOut] = []
    model_config = ConfigDict(from_attributes=True)


class AssignmentCreate(BaseModel):
    paper_id: int
    teacher_id: int
    title: str = Field(min_length=1, max_length=200)
    target_scope: dict
    deadline: datetime
    settings: dict = {}


class AssignmentOut(AssignmentCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)


class SubmissionCreate(BaseModel):
    assignment_id: int
    student_id: int


class AnswerSave(BaseModel):
    question_id: int
    value: Union[str, list, dict]
    handwriting_object_key: Optional[str] = None


class GradeSubmission(BaseModel):
    manual_score: int = Field(ge=0)
    feedback: str = Field(max_length=4000)


class SubmissionOut(BaseModel):
    id: int
    assignment_id: int
    student_id: int
    status: str
    answers: dict
    objective_score: Optional[int]
    manual_score: Optional[int]
    feedback: Optional[str]
    submitted_at: Optional[datetime]
    graded_at: Optional[datetime]
    model_config = ConfigDict(from_attributes=True)


class AiImportPaperRequest(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    subject: str = "数学"
    exam_type: str = "中考真题"
    region: str = ""
    year: int
    question_count: int = Field(default=24, ge=1, le=80)
    total_score: int = Field(default=120, ge=1, le=300)
    duration_minutes: int = Field(default=100, ge=1, le=240)
    raw_text: str = Field(default="", max_length=20000)


class AiWebImportPaperRequest(AiImportPaperRequest):
    query: str = Field(default="", max_length=500)
    source_url: str = Field(default="", max_length=2000)


class AiGenerateQuestionsRequest(BaseModel):
    subject: str = "数学"
    knowledge_point: str = "一元二次方程"
    question_type: str = "单选题"
    difficulty: str = "中等"
    count: int = Field(default=3, ge=1, le=20)
    source_scope: str = "教师题库"


class AiAssemblePaperRequest(BaseModel):
    title: str = Field(default="AI 智能组卷", max_length=200)
    subject: str = "数学"
    exam_type: str = "测验"
    knowledge_points: list[str] = []
    question_count: int = Field(default=12, ge=1, le=80)
    total_score: int = Field(default=100, ge=1, le=300)
    difficulty_ratio: str = "易30% / 中50% / 难20%"


class AiAnalyzeRequest(BaseModel):
    scene: str = Field(min_length=1, max_length=80)
    role: str = "teacher"
    question: str = Field(default="", max_length=1000)
    context: dict = {}


class AiStructuredResponse(BaseModel):
    provider: str
    model: str
    fallback: bool = False
    result: dict
