import { useEffect, useState } from "react";
import { useStore } from "../../store/useStore";
import {
  listStudentMessages,
  studentMarkReadAll,
  studentReply,
} from "../../api/teacherDirectory";
import { useNotify } from "../../hooks/useNotify";
import type { StudentMessage } from "../../types";

function fmt(t: number) {
  return new Date(t).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// 学生收件箱：与老师的双向会话，可回复；打开即把老师消息标记已读。
export default function StudentMessages() {
  const phone = useStore((s) => s.currentUserPhone);
  const notify = useNotify();
  const [messages, setMessages] = useState<StudentMessage[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  async function load() {
    if (!phone) return;
    try {
      const list = await listStudentMessages(phone);
      setMessages(list);
      if (list.some((m) => m.senderRole === "teacher" && !m.read)) {
        studentMarkReadAll(phone).catch(() => {});
      }
    } catch {
      setMessages([]);
    } finally {
      setLoaded(true);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone]);

  async function send() {
    if (!reply.trim()) return;
    setSending(true);
    try {
      await studentReply(phone, reply.trim());
      setReply("");
      await load();
      notify("success", "已回复老师");
    } catch (e) {
      notify("error", e instanceof Error ? e.message : "回复失败");
    } finally {
      setSending(false);
    }
  }

  if (loaded && messages.length === 0) return null;

  return (
    <div className="assignment-section">
      <div className="panel-head">
        <div>
          <p>老师消息</p>
          <h2>与老师的沟通</h2>
        </div>
      </div>
      <div className="msg-thread">
        {messages.map((m) => (
          <div key={m.id} className={`msg-bubble ${m.senderRole === "student" ? "mine" : "theirs"}`}>
            <div className="msg-bubble-meta">
              {m.senderRole === "teacher" ? m.teacherName : "我"} · {fmt(m.createdAt)}
            </div>
            {m.senderRole === "teacher" && m.title && m.title !== "老师消息" && (
              <div className="msg-bubble-title">{m.title}</div>
            )}
            <div className="msg-bubble-body">{m.body}</div>
          </div>
        ))}
      </div>
      <div className="msg-reply">
        <input
          value={reply}
          placeholder="回复老师…"
          onChange={(e) => setReply(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button className="primary small" disabled={sending || !reply.trim()} onClick={send}>
          {sending ? "发送中…" : "回复"}
        </button>
      </div>
    </div>
  );
}
