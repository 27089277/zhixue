import { useEffect, useState } from "react";
import { useStore } from "../../store/useStore";
import { ModalShell } from "./ModalHost";
import { useNotify } from "../../hooks/useNotify";
import {
  listTeacherConversations,
  teacherMarkRead,
  teacherReply,
  type Conversation,
} from "../../api/teacherDirectory";

function fmt(t: number) {
  return new Date(t).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// 老师消息中心：按学生分组的会话 + 时间线 + 回复；打开会话即把学生消息标记已读。
export default function MessageCenterModal() {
  const s = useStore();
  const notify = useNotify();
  const phone = s.currentUserPhone;
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [reply, setReply] = useState("");
  const [loaded, setLoaded] = useState(false);

  async function load(keepActive = true) {
    try {
      const list = await listTeacherConversations(phone);
      setConvs(list);
      if (!keepActive || activeId == null) setActiveId(list[0]?.studentId ?? null);
    } catch {
      setConvs([]);
    } finally {
      setLoaded(true);
    }
  }

  useEffect(() => {
    load(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const active = convs.find((c) => c.studentId === activeId);

  async function openConv(c: Conversation) {
    setActiveId(c.studentId);
    if (c.unread > 0) {
      await teacherMarkRead(phone, c.studentId).catch(() => {});
      load();
    }
  }

  async function send() {
    if (!active || !reply.trim()) return;
    try {
      await teacherReply(phone, active.studentId, reply.trim());
      setReply("");
      await load();
      notify("success", "已回复");
    } catch (e) {
      notify("error", e instanceof Error ? e.message : "回复失败");
    }
  }

  return (
    <ModalShell
      eyebrow="消息中心"
      title="与学生的会话"
      footer={<button className="primary" onClick={s.closeModal}>关闭</button>}
    >
      {loaded && convs.length === 0 ? (
        <div className="empty-state">还没有会话。可在「组织与班级」学生行点「发消息」发起。</div>
      ) : (
        <div className="msg-center">
          <aside className="msg-conv-list">
            {convs.map((c) => (
              <button
                key={c.studentId}
                className={`msg-conv ${activeId === c.studentId ? "active" : ""}`}
                onClick={() => openConv(c)}
              >
                <div className="msg-conv-top">
                  <strong>{c.studentName}</strong>
                  {c.unread > 0 && <i className="msg-conv-badge">{c.unread}</i>}
                </div>
                <span>{c.className}</span>
                <em>{c.lastBody}</em>
              </button>
            ))}
          </aside>
          <div className="msg-conv-detail">
            <div className="msg-thread">
              {active?.messages.map((m) => (
                <div
                  key={m.id}
                  className={`msg-bubble ${m.senderRole === "teacher" ? "mine" : "theirs"}`}
                >
                  <div className="msg-bubble-meta">
                    {m.senderRole === "teacher" ? "我" : m.studentName} · {fmt(m.createdAt)}
                  </div>
                  <div className="msg-bubble-body">{m.body}</div>
                </div>
              ))}
            </div>
            {active && (
              <div className="msg-reply">
                <input
                  value={reply}
                  placeholder={`回复 ${active.studentName}…`}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                />
                <button className="primary small" disabled={!reply.trim()} onClick={send}>
                  发送
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </ModalShell>
  );
}
