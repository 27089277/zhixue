import { Popconfirm } from "antd";
import PageShell from "../components/common/PageShell";
import { useStore } from "../store/useStore";
import { useNotify } from "../hooks/useNotify";

// 后台管理，移植自 legacy adminPage（人员账号 + 角色模板 + 系统配置）。
export default function Admin() {
  const s = useStore();
  const notify = useNotify();

  return (
    <PageShell
      eyebrow="账号 / 角色 / 权限 / 数据隔离"
      title="后台管理"
      actions={
        <button className="primary small" onClick={() => s.openModal("user")}>
          新增账号
        </button>
      }
    >
      <div className="module-grid">
        <article className="panel wide">
          <div className="subnav">
            <button className="active">人员账号</button>
            <button>角色权限</button>
            <button>组织数据隔离</button>
            <button>操作日志</button>
          </div>
          <table className="compact-table">
            <thead>
              <tr>
                <th>姓名</th>
                <th>角色</th>
                <th>组织范围</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {s.users.map((user, index) => (
                <tr key={index}>
                  <td>{user.name}</td>
                  <td>{user.role}</td>
                  <td>{user.org}</td>
                  <td>{user.status}</td>
                  <td>
                    <button className="ghost small" onClick={() => s.openModal("permission")}>
                      权限
                    </button>{" "}
                    <button
                      className="ghost small"
                      onClick={() => {
                        s.toggleUser(index);
                        notify("success", "账号状态已更新");
                      }}
                    >
                      {user.status === "启用" ? "停用" : "启用"}
                    </button>{" "}
                    <Popconfirm
                      title="确认删除该账号？"
                      okText="删除"
                      cancelText="取消"
                      okButtonProps={{ danger: true }}
                      onConfirm={() => {
                        s.deleteUser(index);
                        notify("success", "账号已删除");
                      }}
                    >
                      <button className="ghost small">删除</button>
                    </Popconfirm>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
        <article className="panel">
          <div className="panel-head">
            <div>
              <p>角色模板</p>
              <h2>RBAC 权限</h2>
            </div>
          </div>
          <div className="info-list">
            {[
              ["教师", "作业、批改、班级学情"],
              ["学生", "只看自己的作业、答卷和反馈"],
              ["管理员", "组织、人员、系统配置"],
            ].map(([role, desc]) => (
              <div className="info-row" key={role}>
                <strong>{role}</strong>
                <span>{desc}</span>
                <button className="ghost small" onClick={() => s.openModal("permission")}>
                  配置
                </button>
              </div>
            ))}
          </div>
        </article>
        <article className="panel">
          <div className="panel-head">
            <div>
              <p>系统配置</p>
              <h2>登录安全与存储</h2>
            </div>
          </div>
          <div className="info-list">
            {[
              ["手机验证码", "60 秒重发 · 10 分钟有效 · 防刷限制", "security"],
              ["密码策略", "最少 8 位 · 支持重置和禁用", "security"],
              ["登录日志", "记录 IP、设备、角色与组织范围", "audit"],
              ["MySQL", "业务数据主库", "storage"],
              ["对象存储", "视频、图片、手写附件", "storage"],
              ["审计日志", "权限变更保留 180 天", "audit"],
            ].map(([title, desc, modal]) => (
              <div className="info-row" key={title}>
                <strong>{title}</strong>
                <span>{desc}</span>
                <button className="ghost small" onClick={() => s.openModal(modal)}>
                  配置
                </button>
              </div>
            ))}
          </div>
        </article>
      </div>
    </PageShell>
  );
}
