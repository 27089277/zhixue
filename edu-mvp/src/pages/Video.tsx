import PageShell from "../components/common/PageShell";
import { useStore } from "../store/useStore";
import { useNotify } from "../hooks/useNotify";

// 讲题视频管理，移植自 legacy videoPage。
export default function VideoPage() {
  const s = useStore();
  const notify = useNotify();

  function videoAction(index: number) {
    const v = s.videos[index];
    if (v.status === "上传中") {
      s.updateVideo(index, { status: "已暂停" });
      notify("info", "已暂停上传");
    } else if (v.status === "已暂停") {
      s.updateVideo(index, { status: "上传中" });
      notify("info", "继续上传");
    } else {
      s.openModal("video", v);
    }
  }

  return (
    <PageShell
      eyebrow="视频 / 题目关联 / 观看数据"
      title="讲题视频管理"
      actions={
        <button className="primary small" onClick={() => s.openModal("video")}>
          上传视频
        </button>
      }
    >
      <div className="module-grid">
        <article className="panel wide">
          <table className="compact-table">
            <thead>
              <tr>
                <th>视频</th>
                <th>大小</th>
                <th>状态</th>
                <th>进度</th>
                <th>可见班级</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {s.videos.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.size}</td>
                  <td>{item.status}</td>
                  <td>{item.progress}%</td>
                  <td>初三(1)班</td>
                  <td>
                    <button className="ghost small" onClick={() => videoAction(index)}>
                      {item.status === "上传中" ? "暂停" : item.status === "已暂停" ? "继续" : "关联"}
                    </button>{" "}
                    <button
                      className="ghost small"
                      onClick={() => {
                        s.deleteVideo(index);
                        notify("success", "视频已删除");
                      }}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
        <article className="panel">
          <div className="panel-head">
            <div>
              <p>观看效果</p>
              <h2>关联题目提升</h2>
            </div>
          </div>
          <div className="metric-row">
            <div>
              <strong>78%</strong>
              <span>完播率</span>
            </div>
            <div>
              <strong>31%</strong>
              <span>二练提升</span>
            </div>
            <div>
              <strong>18</strong>
              <span>提问</span>
            </div>
            <div>
              <strong>9</strong>
              <span>未看</span>
            </div>
          </div>
        </article>
        <article className="panel">
          <div className="panel-head">
            <div>
              <p>答疑</p>
              <h2>视频下方问题</h2>
            </div>
          </div>
          <div className="info-list">
            <div className="info-row">
              <strong>王子涵</strong>
              <span>为什么判别式要大于 0？</span>
              <button className="ghost small" onClick={() => s.openModal("reply")}>
                回复
              </button>
            </div>
            <div className="info-row">
              <strong>李思远</strong>
              <span>第 3 分钟的步骤没看懂</span>
              <button className="ghost small" onClick={() => s.openModal("reply")}>
                回复
              </button>
            </div>
          </div>
        </article>
      </div>
    </PageShell>
  );
}
