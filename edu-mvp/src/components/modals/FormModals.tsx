import { useState } from "react";
import { Button, Input, Space, Table, Upload } from "antd";
import { useStore } from "../../store/useStore";
import { ModalShell } from "./ModalHost";
import { useNotify } from "../../hooks/useNotify";
import { RichTextEditor, isRichTextEmpty, richTextToPlain, sanitizeRichText } from "../common/RichText";
import {
  availableTeacherNames,
  currentProfile,
  sharedWithNames,
} from "../../store/permissions";
import { executeSmartAiRequest } from "../../api/ai";
import { sendStudentMessage } from "../../api/teacherDirectory";
import { aiPost, aiErrorMessage, uploadMedia } from "../../api/client";
import {
  aiQuestionToPaperItem,
  createBankQuestionFromPaperItem,
  normalizePaperSections,
} from "../../lib/papers";
import type { Paper, Role, Section } from "../../types";
import {
  SUBJECTS,
  STAGES,
  QUESTION_TYPES,
  gradesForStage,
  isChoiceType,
  isSingleChoice,
} from "../../lib/academics";

const SECTIONS: [Section, string][] = [
  ["workspace", "工作台"],
  ["org", "组织与班级"],
  ["bank", "题库管理"],
  ["homework", "作业与考试"],
  ["grading", "批改与评价"],
  ["video", "讲题视频"],
  ["analytics", "学情分析"],
  ["admin", "后台管理"],
];

export default function FormModals() {
  const s = useStore();
  const notify = useNotify();
  const modal = s.activeModal!;
  const close = s.closeModal;

  // —— 班级 ——
  if (modal.type === "class") {
    return <ClassModal />;
  }
  // —— 账号 ——
  if (modal.type === "user") {
    return <UserModal />;
  }
  // —— 权限 ——
  if (modal.type === "permission") {
    return <PermissionModal />;
  }
  // —— 可见范围 ——
  if (modal.type === "bankAccess") {
    return <BankAccessModal />;
  }
  // —— 给学生发消息 ——
  if (modal.type === "sendMessage") {
    return <SendMessageModal />;
  }
  // —— 题目 ——
  if (modal.type === "question") {
    return <QuestionModal />;
  }
  // —— 智能搜索 ——
  if (modal.type === "webImportPaper") {
    return <WebImportModal />;
  }
  // —— 导入真题卷 ——
  if (modal.type === "importPaper") {
    return <ImportPaperModal />;
  }
  // —— AI 组卷 ——
  if (modal.type === "paper") {
    return <AssembleModal />;
  }
  // —— 上传视频 ——
  if (modal.type === "video") {
    const v = modal.payload;
    return (
      <SimpleForm
        eyebrow="讲题视频"
        title="上传并关联视频"
        action="保存视频关联"
        onConfirm={() => {
          s.addVideo({
            name: `${v?.name || "二次函数压轴题讲解.mp4"}`,
            size: "待上传",
            progress: 0,
            status: "上传中",
            owner: currentProfile(s).name,
            source: "老师上传",
            paperTitle: s.papers[0]?.title,
            point: s.knowledge[0]?.name,
          });
          notify("success", "视频已加入上传队列");
          close();
        }}
      >
        <div className="form-grid">
          <label className="field">
            <span>视频标题</span>
            <input defaultValue={v?.name || "二次函数压轴题讲解"} />
          </label>
          <label className="field">
            <span>选择文件</span>
            <input type="file" accept="video/*" />
          </label>
          <label className="field">
            <span>可见班级</span>
            <select>
              <option>初三(1)班</option>
            </select>
          </label>
          <label className="field">
            <span>关联知识点</span>
            <select>
              {s.knowledge.map((k) => (
                <option key={k.name}>{k.name}</option>
              ))}
            </select>
          </label>
        </div>
      </SimpleForm>
    );
  }
  // —— 发布作业（顶栏快捷） ——
  if (modal.type === "homework") {
    return <HomeworkModal />;
  }
  // —— 报告 / 评分标准（信息型确认） ——
  if (modal.type === "report") {
    return (
      <SimpleForm
        eyebrow="学情报告"
        title="生成班级讲评报告"
        action="生成报告"
        onConfirm={() => {
          notify("success", "报告已生成");
          close();
        }}
      >
        <div className="form-grid">
          <label className="field">
            <span>报告对象</span>
            <select>
              <option>初三(1)班</option>
              <option>王子涵个人报告</option>
            </select>
          </label>
          <label className="field">
            <span>周期</span>
            <select>
              <option>最近一次作业</option>
              <option>本周</option>
              <option>本月</option>
            </select>
          </label>
          <div className="field full">
            <span>包含内容</span>
            <div className="check-grid">
              <label>
                <input type="checkbox" defaultChecked /> 完成率与分数分布
              </label>
              <label>
                <input type="checkbox" defaultChecked /> 高频错题
              </label>
              <label>
                <input type="checkbox" defaultChecked /> 薄弱知识点
              </label>
              <label>
                <input type="checkbox" defaultChecked /> 风险学生名单
              </label>
            </div>
          </div>
        </div>
      </SimpleForm>
    );
  }
  if (modal.type === "rubric") {
    return (
      <SimpleForm
        eyebrow="评分标准"
        title="配置主观题评分点"
        action="应用到批改"
        onConfirm={() => {
          notify("success", "评分标准已应用");
          close();
        }}
      >
        <div className="form-grid">
          <label className="field">
            <span>题目</span>
            <select>
              <option>第 3 题：解方程</option>
              <option>第 8 题：几何证明</option>
            </select>
          </label>
          <label className="field">
            <span>总分</span>
            <input type="number" defaultValue={10} />
          </label>
          <label className="field full">
            <span>评分点</span>
            <textarea defaultValue={"因式分解正确（4分）\n两根写出完整（3分）\n过程表达规范（3分）"} />
          </label>
        </div>
      </SimpleForm>
    );
  }
  return null;
}

// —— 通用简单表单壳 ——
function SimpleForm({
  eyebrow,
  title,
  action,
  onConfirm,
  children,
}: {
  eyebrow: string;
  title: string;
  action: string;
  onConfirm: () => void;
  children: React.ReactNode;
}) {
  const close = useStore((s) => s.closeModal);
  return (
    <ModalShell
      eyebrow={eyebrow}
      title={title}
      footer={
        <>
          <button className="ghost" onClick={close}>
            取消
          </button>
          <button className="primary" onClick={onConfirm}>
            {action}
          </button>
        </>
      }
    >
      {children}
    </ModalShell>
  );
}

function SendMessageModal() {
  const s = useStore();
  const notify = useNotify();
  const p = s.activeModal!.payload as { studentId: string; studentName: string; className?: string };
  const [title, setTitle] = useState("老师消息");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  return (
    <SimpleForm
      eyebrow="给学生发消息"
      title={`发送给 ${p.studentName}${p.className ? ` · ${p.className}` : ""}`}
      action={sending ? "发送中…" : "发送消息"}
      onConfirm={async () => {
        if (!body.trim()) return notify("error", "请输入消息内容");
        setSending(true);
        try {
          await sendStudentMessage(s.currentUserPhone, p.studentId, {
            title: title.trim() || "老师消息",
            body: body.trim(),
          });
          notify("success", `已发送给 ${p.studentName}`);
          s.closeModal();
        } catch (e) {
          notify("error", e instanceof Error ? e.message : "发送失败");
        } finally {
          setSending(false);
        }
      }}
    >
      <div className="form-grid">
        <label className="field full">
          <span>标题</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="如：作业提醒 / 学情反馈" />
        </label>
        <label className="field full">
          <span>内容</span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="给学生的通知、鼓励或提醒…"
            rows={5}
          />
        </label>
      </div>
    </SimpleForm>
  );
}

function ClassModal() {
  const s = useStore();
  const notify = useNotify();
  const original = s.activeModal!.payload?.name as string | undefined;
  const [name, setName] = useState(original || "初三(5)班");
  const [owner, setOwner] = useState(currentProfile(s).name);
  return (
    <SimpleForm
      eyebrow="班级管理"
      title={original ? `${original} 班级画像` : "新建班级"}
      action="保存班级"
      onConfirm={() => {
        if (!name.trim()) return notify("error", "请输入班级名称");
        s.upsertClass(name.trim(), owner, original);
        notify("success", "班级已保存");
        s.closeModal();
      }}
    >
      <div className="form-grid">
        <label className="field">
          <span>班级名称</span>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="field">
          <span>班主任</span>
          <select value={owner} onChange={(e) => setOwner(e.target.value)}>
            <option>张老师</option>
          </select>
        </label>
        <label className="field">
          <span>年级</span>
          <select>
            <option>初三</option>
            <option>初二</option>
          </select>
        </label>
        <label className="field">
          <span>学生导入</span>
          <select>
            <option>手动添加</option>
            <option>Excel 批量导入</option>
            <option>邀请码加入</option>
          </select>
        </label>
      </div>
    </SimpleForm>
  );
}

function UserModal() {
  const s = useStore();
  const notify = useNotify();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("教师");
  const [org, setOrg] = useState("光明中学");
  return (
    <SimpleForm
      eyebrow="人员管理"
      title="新增账号"
      action="创建账号"
      onConfirm={() => {
        if (!name.trim()) return notify("error", "请输入姓名");
        if (!/^1\d{10}$/.test(phone)) return notify("error", "请输入正确的手机号");
        s.addUser({ name: name.trim(), role, org, status: "启用", phone });
        notify("success", "账号已创建");
        s.closeModal();
      }}
    >
      <div className="form-grid">
        <label className="field">
          <span>姓名</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="请输入姓名" />
        </label>
        <label className="field">
          <span>手机号</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="请输入手机号" />
        </label>
        <label className="field">
          <span>角色</span>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option>教师</option>
            <option>学生</option>
            <option>管理员</option>
          </select>
        </label>
        <label className="field">
          <span>组织范围</span>
          <select value={org} onChange={(e) => setOrg(e.target.value)}>
            <option>光明中学</option>
            <option>初三(1)班</option>
          </select>
        </label>
      </div>
    </SimpleForm>
  );
}

function PermissionModal() {
  const s = useStore();
  const notify = useNotify();
  const [role, setRole] = useState<Role>("teacher");
  const [allowed, setAllowed] = useState<Set<Section>>(
    new Set(s.roleProfiles[role].allowed)
  );

  function switchRole(r: Role) {
    setRole(r);
    setAllowed(new Set(s.roleProfiles[r].allowed));
  }
  function toggle(sec: Section) {
    setAllowed((prev) => {
      const next = new Set(prev);
      if (next.has(sec)) next.delete(sec);
      else next.add(sec);
      return next;
    });
  }
  return (
    <SimpleForm
      eyebrow="权限配置"
      title="角色权限与数据范围"
      action="保存权限"
      onConfirm={() => {
        s.setRoleAllowed(role, Array.from(allowed));
        notify("success", "权限已保存，立即生效");
        s.closeModal();
        if (s.role === role && !allowed.has(s.section)) s.switchSection("workspace");
      }}
    >
      <div className="form-grid">
        <label className="field">
          <span>角色</span>
          <select value={role} onChange={(e) => switchRole(e.target.value as any)}>
            <option value="teacher">教师</option>
            <option value="admin">管理员</option>
            <option value="student">学生</option>
          </select>
        </label>
        <label className="field">
          <span>数据范围</span>
          <select>
            <option>本人班级</option>
            <option>本校区</option>
            <option>全机构</option>
          </select>
        </label>
        <div className="field full">
          <span>可访问模块</span>
          <div className="check-grid">
            {SECTIONS.map(([id, label]) => (
              <label key={id}>
                <input
                  type="checkbox"
                  checked={allowed.has(id)}
                  onChange={() => toggle(id)}
                />{" "}
                {label}
              </label>
            ))}
          </div>
        </div>
        <p className="field full muted">权限保存后立即生效；当前角色若失去模块权限，会自动返回工作台。</p>
      </div>
    </SimpleForm>
  );
}

function BankAccessModal() {
  const s = useStore();
  const notify = useNotify();
  const { assetType, index, asset } = s.activeModal!.payload;
  const owner = asset.owner || currentProfile(s).name;

  // 候选老师列表（可增删），初始为可用老师 ∪ 已共享对象。
  const [teachers, setTeachers] = useState<string[]>(() =>
    Array.from(
      new Set([
        ...availableTeacherNames(s, owner).filter((n) => n !== owner),
        ...sharedWithNames(asset),
      ])
    )
  );
  const [shared, setShared] = useState<string[]>(sharedWithNames(asset));
  const [keyword, setKeyword] = useState("");
  const [adding, setAdding] = useState("");

  const rows = teachers
    .filter((n) => n.includes(keyword.trim()))
    .map((name) => ({ key: name, name }));

  function addTeacher() {
    const name = adding.trim();
    if (!name) return;
    if (teachers.includes(name)) return notify("info", "该老师已在列表中");
    setTeachers((p) => [name, ...p]);
    setShared((p) => Array.from(new Set([...p, name])));
    setAdding("");
  }
  function removeTeacher(name: string) {
    setTeachers((p) => p.filter((n) => n !== name));
    setShared((p) => p.filter((n) => n !== name));
  }

  return (
    <SimpleForm
      eyebrow="私人库可见范围"
      title={asset.title || "资产权限"}
      action="保存可见范围"
      onConfirm={() => {
        s.shareAsset(assetType, index, shared);
        notify("success", "可见范围已更新");
        s.closeModal();
      }}
    >
      <div className="form-grid">
        <div className="field full ai-assist-card">
          <span>权限规则</span>
          <strong>
            私人库资产默认只有创建老师可见。勾选的老师可查看，不能编辑、删除或再次转发。
          </strong>
        </div>
        <label className="field">
          <span>所属老师</span>
          <input value={owner} disabled />
        </label>
        <label className="field">
          <span>库类型</span>
          <input value="教师私人库" disabled />
        </label>
        <div className="field full">
          <span>允许查看的老师（勾选即可见）</span>
          <Space.Compact style={{ width: "100%", margin: "6px 0 10px" }}>
            <Input
              placeholder="搜索老师姓名"
              allowClear
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <Input
              placeholder="添加老师姓名"
              value={adding}
              onChange={(e) => setAdding(e.target.value)}
              onPressEnter={addTeacher}
              style={{ maxWidth: 180 }}
            />
            <Button type="primary" onClick={addTeacher}>
              添加
            </Button>
          </Space.Compact>
          <Table
            size="small"
            rowKey="key"
            dataSource={rows}
            pagination={{ pageSize: 5, hideOnSinglePage: true }}
            rowSelection={{
              selectedRowKeys: shared,
              onChange: (keys) => setShared(keys as string[]),
            }}
            columns={[
              { title: "老师", dataIndex: "name", key: "name" },
              {
                title: "操作",
                key: "op",
                width: 90,
                render: (_, r) => (
                  <Button
                    type="text"
                    size="small"
                    danger
                    onClick={() => removeTeacher(r.name)}
                  >
                    删除
                  </Button>
                ),
              },
            ]}
          />
        </div>
      </div>
    </SimpleForm>
  );
}

const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

function lettersToIndices(answer = ""): number[] {
  return (answer.match(/[A-H]/gi) || []).map((c) => c.toUpperCase().charCodeAt(0) - 65);
}

// 手工编辑题目：纯手动（不走 AI），覆盖单选/多选/填空/解答全部题型。
function QuestionModal() {
  const s = useStore();
  const notify = useNotify();
  const payload = s.activeModal!.payload || {};
  const isEdit = payload.index !== undefined;
  const readonly = isEdit && !canOperateBankAssetByPayload(s, payload);

  const [title, setTitle] = useState<string>(payload.title || "");
  const [subject, setSubject] = useState<string>(payload.subject || "数学");
  const [stage, setStage] = useState<string>(payload.stage || "初中");
  const [grade, setGrade] = useState<string>(payload.grade || "初三");
  const [type, setType] = useState<string>(payload.type || "单选题");
  const [visibility, setVisibility] = useState<string>(payload.visibility || "teacher");
  const source = payload.source || "老师手动编写";
  const [point, setPoint] = useState<string>(payload.point || "");
  const [difficulty, setDifficulty] = useState<string>(payload.difficulty || "中等");
  const [choices, setChoices] = useState<string[]>(
    payload.type === "判断题"
      ? ["正确", "错误"]
      : payload.choices?.length
      ? payload.choices
      : ["", "", "", ""]
  );
  const [correct, setCorrect] = useState<Set<number>>(
    new Set(lettersToIndices(payload.answer))
  );
  const [answerText, setAnswerText] = useState<string>(
    payload.type && !isChoiceType(payload.type) ? payload.answer || "" : ""
  );
  const [analysis, setAnalysis] = useState<string>(payload.analysis || "");
  const [images, setImages] = useState<string[]>(payload.images || []);
  const [videoName, setVideoName] = useState<string>(payload.videoName || "");
  const [videoUrl, setVideoUrl] = useState<string>(payload.videoUrl || "");
  const [videoUploading, setVideoUploading] = useState(false);

  const isChoice = isChoiceType(type);
  const single = isSingleChoice(type);
  const fixedOptions = type === "判断题";

  function onChangeType(next: string) {
    setType(next);
    setCorrect(new Set());
    if (next === "判断题") setChoices(["正确", "错误"]);
    else if (isChoiceType(next) && !choices.some((c) => c.trim())) setChoices(["", "", "", ""]);
  }
  function onChangeStage(next: string) {
    setStage(next);
    setGrade(gradesForStage(next)[0] || "");
  }

  function setChoice(i: number, v: string) {
    setChoices((prev) => prev.map((c, idx) => (idx === i ? v : c)));
  }
  function addChoice() {
    if (choices.length < 8) setChoices((p) => [...p, ""]);
  }
  function removeChoice(i: number) {
    setChoices((p) => p.filter((_, idx) => idx !== i));
    setCorrect((prev) => {
      const next = new Set<number>();
      prev.forEach((idx) => {
        if (idx < i) next.add(idx);
        else if (idx > i) next.add(idx - 1);
      });
      return next;
    });
  }
  function toggleCorrect(i: number) {
    setCorrect((prev) => {
      if (single) return new Set([i]);
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  function buildAnswer(): string {
    if (isChoice) {
      if (fixedOptions) {
        const idx = Array.from(correct)[0];
        return idx === undefined ? "" : choices[idx];
      }
      return Array.from(correct)
        .sort((a, b) => a - b)
        .map((i) => LETTERS[i])
        .join("");
    }
    return type === "填空题" ? answerText.trim() : sanitizeRichText(answerText);
  }

  async function uploadEditorImage(file: File) {
    try {
      const result = await uploadMedia(file);
      notify("success", "图片已上传并插入");
      return result.url;
    } catch (error) {
      notify("error", "图片上传失败，请检查后端媒体服务");
      throw error;
    }
  }

  function confirm() {
    if (readonly) {
      s.closeModal();
      return;
    }
    if (isRichTextEmpty(title)) return notify("error", "请输入题干");
    if (isChoice) {
      const filled = choices.filter((c) => !isRichTextEmpty(c)).length;
      if (filled < 2) return notify("error", "选择题至少需要 2 个选项");
      if (correct.size === 0) return notify("error", "请设置正确答案");
    } else if (type === "填空题" ? !answerText.trim() : isRichTextEmpty(answerText)) {
      return notify("error", "请填写参考答案");
    }
    const data = {
      title: sanitizeRichText(title),
      type,
      subject,
      stage,
      grade,
      point: point.trim() || subject,
      source,
      difficulty,
      visibility: visibility as any,
      owner: currentProfile(s).name,
      origin: "老师手动编写",
      choices: isChoice ? choices.filter((c) => !isRichTextEmpty(c)).map(sanitizeRichText) : undefined,
      answer: buildAnswer(),
      analysis: isRichTextEmpty(analysis) ? undefined : sanitizeRichText(analysis),
      images: images.length ? images : undefined,
      videoName: videoName || undefined,
      videoUrl: videoUrl || undefined,
      sharedWith: payload.sharedWith || [],
    };
    if (isEdit) {
      s.updateQuestion(payload.index, data);
      notify("success", "题目已保存");
    } else {
      s.addQuestions([data]);
      notify("success", "题目已保存到题库");
    }
    s.closeModal();
  }

  return (
    <SimpleForm
      eyebrow="题库编辑"
      title={isEdit ? (readonly ? "查看题目" : "编辑题目") : "自己编写题目"}
      action={readonly ? "关闭" : "保存并入库"}
      onConfirm={confirm}
    >
      <div className="form-grid">
        <label className="field">
          <span>学科</span>
          <select value={subject} onChange={(e) => setSubject(e.target.value)} disabled={readonly}>
            {SUBJECTS.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>学段</span>
          <select value={stage} onChange={(e) => onChangeStage(e.target.value)} disabled={readonly}>
            {STAGES.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>年级</span>
          <select value={grade} onChange={(e) => setGrade(e.target.value)} disabled={readonly}>
            {gradesForStage(stage).map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>题型</span>
          <select value={type} onChange={(e) => onChangeType(e.target.value)} disabled={readonly}>
            {QUESTION_TYPES.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>难度</span>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} disabled={readonly}>
            <option>容易</option>
            <option>中等</option>
            <option>较难</option>
          </select>
        </label>
        <label className="field">
          <span>题库归属</span>
          <select value={visibility} onChange={(e) => setVisibility(e.target.value)} disabled={readonly}>
            <option value="teacher">教师题库（所有老师可见）</option>
            <option value="private">教师私人库（仅自己，可共享）</option>
            <option value="public">公共库（含学生）</option>
            <option value="student">学生练习库</option>
          </select>
        </label>
        <label className="field">
          <span>知识点</span>
          <input
            value={point}
            placeholder="如：欧姆定律 / 文言文阅读"
            onChange={(e) => setPoint(e.target.value)}
            disabled={readonly}
          />
        </label>

        <div className="field full">
          <span>题干</span>
          <RichTextEditor
            value={title}
            onChange={setTitle}
            disabled={readonly}
            placeholder="输入题干，可插入实验图、电路图、几何图，也可粘贴图片"
            minHeight={120}
            onImageUpload={uploadEditorImage}
          />
        </div>

        {isChoice && (
          <div className="field full">
            <span>
              选项与正确答案（{single ? "单选" : "多选"}
              {fixedOptions ? " · 判断" : ""}）
            </span>
            <div className="option-editor">
              {choices.map((c, i) => (
                <div className="option-editor-row" key={i}>
                  <input
                    type={single ? "radio" : "checkbox"}
                    name="qCorrect"
                    checked={correct.has(i)}
                    onChange={() => toggleCorrect(i)}
                    disabled={readonly}
                    title="设为正确答案"
                  />
                  <b>{LETTERS[i]}</b>
                  {fixedOptions ? (
                    <input value={richTextToPlain(c)} disabled />
                  ) : (
                    <RichTextEditor
                      value={c}
                      placeholder={`选项 ${LETTERS[i]}，可插入图片或公式占位`}
                      onChange={(value) => setChoice(i, value)}
                      disabled={readonly}
                      compact
                      minHeight={46}
                      onImageUpload={uploadEditorImage}
                    />
                  )}
                  {!readonly && !fixedOptions && choices.length > 2 && (
                    <button type="button" className="ghost small" onClick={() => removeChoice(i)}>
                      删除
                    </button>
                  )}
                </div>
              ))}
              {!readonly && !fixedOptions && choices.length < 8 && (
                <button type="button" className="ghost small" onClick={addChoice}>
                  + 添加选项
                </button>
              )}
            </div>
          </div>
        )}

        {!isChoice && (
          <label className="field full">
            <span>{type === "填空题" ? "标准答案（多个空用；分隔）" : "参考答案 / 评分要点"}</span>
            {type === "填空题" ? (
              <input
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                disabled={readonly}
              />
            ) : (
              <RichTextEditor
                value={answerText}
                onChange={setAnswerText}
                disabled={readonly}
                placeholder="输入参考答案或评分要点，可插入步骤图"
                minHeight={130}
                onImageUpload={uploadEditorImage}
              />
            )}
          </label>
        )}

        <div className="field full">
          <span>解析（可选）</span>
          <RichTextEditor
            value={analysis}
            onChange={setAnalysis}
            disabled={readonly}
            placeholder="输入解析过程，可插入图片、列表、上下标"
            minHeight={150}
            onImageUpload={uploadEditorImage}
          />
        </div>

        <div className="field full">
          <span>历史配图（兼容旧题目）</span>
          {images.length ? (
            <div className="legacy-image-list">
              {images.map((url, i) => (
                <figure key={`${url}-${i}`}>
                  <img src={url} alt={`历史配图 ${i + 1}`} />
                  {!readonly && (
                    <button
                      type="button"
                      className="ghost small"
                      onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                    >
                      移除
                    </button>
                  )}
                </figure>
              ))}
            </div>
          ) : (
            <small className="muted">新图片请在题干、选项或解析编辑器内点击“插入图片”，图片会上传到媒体接口并插入当前位置。</small>
          )}
        </div>

        <div className="field full">
          <span>讲解视频（可选，每题一个）</span>
          <div className="q-video">
            <Input
              value={videoUrl}
              disabled={readonly}
              placeholder="粘贴视频链接（可直接播放），或点右侧上传小视频文件"
              onChange={(e) => setVideoUrl(e.target.value)}
            />
            {!readonly && (
              <Upload
                accept="video/*"
                showUploadList={false}
                beforeUpload={(file) => {
                  const f = file as File;
                  setVideoName(f.name);
                  setVideoUploading(true);
                  // 上传到对象存储（磁盘），DB 只存返回的引用 URL —— 大视频不进关系库
                  uploadMedia(f)
                    .then((r) => {
                      setVideoUrl(r.url);
                      notify("success", "视频已上传");
                    })
                    .catch(() => notify("error", "视频上传失败，可改用视频链接"))
                    .finally(() => setVideoUploading(false));
                  return false;
                }}
              >
                <Button loading={videoUploading}>上传视频</Button>
              </Upload>
            )}
          </div>
          {videoName && <small className="q-video-name">已选：{videoName}</small>}
          {videoUrl && (
            <video className="q-video-preview" src={videoUrl} controls preload="metadata" />
          )}
          {(videoUrl || videoName) && !readonly && (
            <Button
              size="small"
              type="text"
              danger
              onClick={() => {
                setVideoUrl("");
                setVideoName("");
              }}
            >
              移除讲解视频
            </Button>
          )}
        </div>
      </div>
    </SimpleForm>
  );
}

// 判断当前 payload 题目是否可被当前用户编辑（查看/编辑切换用）。
function canOperateBankAssetByPayload(s: any, payload: any): boolean {
  if (s.role !== "teacher") return true;
  // 与 permissions.canOperateBankAsset 一致：仅创建者本人可编辑
  return payload.owner === s.roleProfiles[s.role].name;
}

function WebImportModal() {
  const s = useStore();
  const notify = useNotify();
  const [text, setText] = useState(
    "找 2025 大连中考物理真题，导入公共真题库，自动拆题并生成答案解析"
  );
  const [url, setUrl] = useState("");
  const examples = [
    "找 2025 大连中考物理真题，导入公共真题库，自动拆题并生成答案解析",
    "生成 8 道初三数学二次函数中档题，含答案和解析，放入教师题库",
    "用一元二次方程、相似三角形、勾股定理组一张 45 分钟测验，难度中等",
  ];
  return (
    <SimpleForm
      eyebrow="智能搜索"
      title="告诉 AI 你想做什么"
      action="执行智能搜索"
      onConfirm={async () => {
        await executeSmartAiRequest(text.trim(), { mode: "auto", sourceUrl: url, notify });
      }}
    >
      <div className="smart-search-form">
        <div className="ai-assist-card">
          <span>智能搜索可以理解自然语言</span>
          <strong>
            例如：找 2025 大连中考物理真题并导入题库；生成 10 道二次函数中档题；用相似三角形和勾股定理组一张 45 分钟测验。
          </strong>
        </div>
        <label className="field full">
          <span>搜索/生成/组卷需求</span>
          <textarea
            className="smart-search-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </label>
        <label className="field full">
          <span>网页或 PDF 链接（可选）</span>
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
        </label>
        <div className="smart-search-examples">
          {examples.map((ex, i) => (
            <button type="button" key={i} onClick={() => setText(ex)}>
              {["搜真题", "生成题目", "自动组卷"][i]}
            </button>
          ))}
        </div>
      </div>
    </SimpleForm>
  );
}

function ImportPaperModal() {
  const s = useStore();
  const notify = useNotify();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: "2025 杭州中考数学真题卷",
    exam: "中考真题",
    region: "杭州",
    year: 2025,
    subject: "数学",
    stage: "初中",
    grade: "初三",
    duration: 100,
    score: 120,
    questions: 24,
    scope: "teacher",
    raw: "",
  });
  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function confirm() {
    if (!form.title.trim() || !form.region.trim())
      return notify("error", "请输入试卷名称和地区");
    setBusy(true);
    try {
      const ai = await aiPost("/ai/import-paper", {
        title: form.title,
        subject: form.subject,
        exam_type: form.exam,
        region: form.region,
        year: form.year,
        question_count: form.questions,
        total_score: form.score,
        duration_minutes: form.duration,
        raw_text: form.raw,
      });
      const aiQuestions = ai.result.questions || [];
      if (!aiQuestions.length)
        throw new Error("DeepSeek 没有返回题目结构，请粘贴真题原文");
      const paperItems = (aiQuestions as any[]).map(aiQuestionToPaperItem);
      const visibility = form.scope === "teacher" ? "teacher" : "public";
      const owner = visibility === "teacher" ? currentProfile(s).name : "题库中心";
      const paper: Paper = {
        id: `paper-${Date.now()}`,
        title: form.title,
        exam: form.exam,
        subject: form.subject,
        stage: form.stage,
        grade: form.grade,
        region: form.region,
        year: form.year,
        duration: form.duration,
        score: form.score,
        questions: paperItems.length || form.questions,
        progress: 0,
        difficulty: "中等",
        sections: normalizePaperSections([], paperItems),
        tags: ["真题", "新导入", form.scope === "public" ? "可发布" : "待审核"],
        visibility,
        owner,
        source: "AI 解析导入",
        sharedWith: [],
        items: paperItems,
      };
      const bankQuestions = paperItems.map((item, i) =>
        createBankQuestionFromPaperItem(item, paper, i, owner)
      );
      s.addPaper(paper);
      s.addQuestions(bankQuestions);
      notify("success", `已导入整卷“${form.title}”，共 ${paper.questions} 题`);
      s.closeModal();
    } catch (e) {
      notify("error", `导入失败：${aiErrorMessage(e)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <SimpleForm
      eyebrow="导入真题卷"
      title="导入一整套历史真题"
      action={busy ? "正在解析..." : "导入并生成试卷"}
      onConfirm={busy ? () => {} : confirm}
    >
      <div className="form-grid">
        <label className="field">
          <span>试卷名称</span>
          <input value={form.title} onChange={(e) => set("title", e.target.value)} />
        </label>
        <label className="field">
          <span>考试类型</span>
          <select value={form.exam} onChange={(e) => set("exam", e.target.value)}>
            <option>中考真题</option>
            <option>高考真题</option>
            <option>期末真题</option>
            <option>模拟卷</option>
          </select>
        </label>
        <label className="field">
          <span>地区</span>
          <input value={form.region} onChange={(e) => set("region", e.target.value)} />
        </label>
        <label className="field">
          <span>年份</span>
          <input
            type="number"
            value={form.year}
            onChange={(e) => set("year", Number(e.target.value))}
          />
        </label>
        <label className="field">
          <span>科目</span>
          <select value={form.subject} onChange={(e) => set("subject", e.target.value)}>
            {SUBJECTS.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>学段</span>
          <select
            value={form.stage}
            onChange={(e) => {
              const stage = e.target.value;
              setForm((p) => ({ ...p, stage, grade: gradesForStage(stage)[0] || "" }));
            }}
          >
            {STAGES.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>年级</span>
          <select value={form.grade} onChange={(e) => set("grade", e.target.value)}>
            {gradesForStage(form.stage).map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>使用范围</span>
          <select value={form.scope} onChange={(e) => set("scope", e.target.value)}>
            <option value="teacher">仅本次发布使用</option>
            <option value="public">保存为可复用试卷</option>
          </select>
        </label>
        <label className="field full">
          <span>真题原文/答案解析</span>
          <textarea
            value={form.raw}
            onChange={(e) => set("raw", e.target.value)}
            placeholder="可粘贴 PDF/Word 识别出的真题文本，或先只填试卷信息让 AI 生成结构化草稿。"
          />
        </label>
      </div>
    </SimpleForm>
  );
}

function AssembleModal() {
  const s = useStore();
  const notify = useNotify();
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState("AI 二次函数周测卷");
  const [subject, setSubject] = useState("数学");
  const [score, setScore] = useState(100);
  const [count, setCount] = useState(12);
  const [points, setPoints] = useState<Set<string>>(
    new Set(s.knowledge.map((k) => k.name))
  );
  function toggle(name: string) {
    setPoints((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }
  async function confirm() {
    setBusy(true);
    try {
      const ai = await aiPost("/ai/assemble-paper", {
        title,
        subject,
        exam_type: "测验",
        knowledge_points: Array.from(points),
        question_count: count,
        total_score: score,
        difficulty_ratio: "易30% / 中50% / 难20%",
      });
      const blueprint = ai.result.blueprint || [];
      const info = ai.result.paper || {};
      const paper: Paper = {
        id: `ai-paper-${Date.now()}`,
        title: info.title || title,
        exam: info.exam_type || "AI测验",
        subject,
        region: "校本",
        year: 2026,
        duration: info.duration_minutes || 45,
        score,
        questions: count,
        progress: 0,
        difficulty: "AI分层",
        sections: blueprint.length
          ? blueprint.map((b: any) => `${b.section || "题组"} ${b.count || 3}`)
          : ["选择题 6", "填空题 4", "解答题 2"],
        tags: ["AI组卷", "老师私人库", "可发布"],
        visibility: "teacher",
        owner: currentProfile(s).name,
        source: "AI 自动组卷",
        sharedWith: [],
        items: [],
      };
      s.addPaper(paper);
      notify("success", `已生成组卷“${paper.title}”`);
      s.closeModal();
    } catch (e) {
      notify("error", `组卷失败：${aiErrorMessage(e)}`);
    } finally {
      setBusy(false);
    }
  }
  return (
    <SimpleForm
      eyebrow="AI 自动组卷"
      title="DeepSeek 按知识点生成组卷蓝图"
      action={busy ? "正在生成..." : "AI 生成组卷"}
      onConfirm={busy ? () => {} : confirm}
    >
      <div className="form-grid">
        <div className="field full ai-assist-card">
          <span>DeepSeek AI 组卷</span>
          <strong>根据知识点、题量、总分和难度比例生成试卷蓝图，再从题库抽题或补题。</strong>
        </div>
        <label className="field">
          <span>试卷名称</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className="field">
          <span>科目</span>
          <select value={subject} onChange={(e) => setSubject(e.target.value)}>
            <option>数学</option>
            <option>物理</option>
          </select>
        </label>
        <label className="field">
          <span>总分</span>
          <input type="number" value={score} onChange={(e) => setScore(Number(e.target.value))} />
        </label>
        <label className="field">
          <span>题量</span>
          <input type="number" value={count} onChange={(e) => setCount(Number(e.target.value))} />
        </label>
        <div className="field full">
          <span>知识点范围</span>
          <div className="check-grid">
            {s.knowledge.map((k) => (
              <label key={k.name}>
                <input
                  type="checkbox"
                  checked={points.has(k.name)}
                  onChange={() => toggle(k.name)}
                />{" "}
                {k.name}
              </label>
            ))}
          </div>
        </div>
      </div>
    </SimpleForm>
  );
}

function HomeworkModal() {
  const s = useStore();
  const notify = useNotify();
  const [title, setTitle] = useState("二次函数综合练习");
  const [kind, setKind] = useState("作业");
  const [paperId, setPaperId] = useState(s.papers[0]?.id);
  const [className] = useState(s.classes[0]?.name || "初三(1)班");
  return (
    <SimpleForm
      eyebrow="发布作业"
      title="设置作业/考试要求"
      action="确认发布"
      onConfirm={() => {
        if (!title.trim()) return notify("error", "请输入作业名称");
        s.addAssignment({
          id: `hw-${Date.now()}`,
          title,
          kind,
          mode: "paper",
          paperId,
          className,
          deadline: "2026-07-01T22:00",
          status: "进行中",
          createdAt: Date.now(),
        });
        notify("success", `${kind}“${title}”已发布`);
        s.closeModal();
      }}
    >
      <div className="form-grid">
        <label className="field">
          <span>类型</span>
          <select value={kind} onChange={(e) => setKind(e.target.value)}>
            <option>作业</option>
            <option>测验</option>
            <option>考试</option>
          </select>
        </label>
        <label className="field">
          <span>班级</span>
          <select defaultValue={className}>
            {s.classes.map((c) => (
              <option key={c.name}>{c.name}</option>
            ))}
          </select>
        </label>
        <label className="field full">
          <span>标题</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className="field full">
          <span>试卷来源</span>
          <select value={paperId} onChange={(e) => setPaperId(e.target.value)}>
            {s.papers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </label>
      </div>
    </SimpleForm>
  );
}
