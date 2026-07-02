import { useStore } from "../../store/useStore";
import PaperDetailModal from "./PaperDetailModal";
import ExamFlowModals from "./ExamFlowModals";
import SubmissionModal from "./SubmissionModal";
import FormModals from "./FormModals";
import InfoModals from "./InfoModals";
import PaperComposeModal from "./PaperComposeModal";
import MessageCenterModal from "./MessageCenterModal";

// 弹窗宿主：根据 store.activeModal.type 分发到对应弹窗组件。
// 沿用 legacy modal-backdrop/modal 结构（样式已在 legacy.css 中），保持原视觉。
export interface ModalShellProps {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export function ModalShell({ eyebrow, title, children, footer }: ModalShellProps) {
  const closeModal = useStore((s) => s.closeModal);
  // 不再点遮罩就关闭，避免误触丢失内容；关闭请用右上角“关闭”或底部按钮。
  return (
    <div className="modal-backdrop">
      <section className="modal" role="dialog" aria-modal="true">
        <div className="modal-head">
          <div>
            <p>{eyebrow}</p>
            <h2>{title}</h2>
          </div>
          <button className="ghost small" onClick={closeModal}>
            关闭
          </button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-foot">{footer}</div>
      </section>
    </div>
  );
}

const PAPER_TYPES = ["paperDetail", "paperOverview"];
const EXAM_TYPES = ["paperStart", "paperResult", "submitConfirm"];
const FORM_TYPES = [
  "homework",
  "question",
  "class",
  "user",
  "permission",
  "bankAccess",
  "webImportPaper",
  "importPaper",
  "paper",
  "video",
  "report",
  "rubric",
];

export default function ModalHost() {
  const activeModal = useStore((s) => s.activeModal);
  if (!activeModal) return null;
  const { type } = activeModal;

  if (type === "messageCenter") return <MessageCenterModal />;
  if (type === "paperCreator") return <PaperComposeModal />;
  if (PAPER_TYPES.includes(type)) return <PaperDetailModal />;
  if (EXAM_TYPES.includes(type)) return <ExamFlowModals />;
  if (type === "submission") return <SubmissionModal />;
  if (FORM_TYPES.includes(type)) return <FormModals />;
  return <InfoModals />;
}
