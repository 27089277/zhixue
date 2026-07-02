import { useEffect, useMemo, useState } from "react";
import PageShell from "../components/common/PageShell";
import { useStore } from "../store/useStore";
import { visibleClasses } from "../store/permissions";
import { visibleClassStudents } from "../lib/students";
import { listTeacherClasses, listTeacherClassStudents } from "../api/teacherDirectory";
import type { ClassInfo, StudentDetail } from "../types";

// 组织与班级，移植自 legacy orgPage（班级侧栏 + 学生表）。
export default function Org() {
  const s = useStore();
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [teacherClasses, setTeacherClasses] = useState<ClassInfo[]>([]);
  const [teacherStudents, setTeacherStudents] = useState<StudentDetail[]>([]);
  const [loading, setLoading] = useState(s.role === "teacher");
  const [loadError, setLoadError] = useState("");

  const isTeacher = s.role === "teacher";
  const classes = isTeacher ? teacherClasses : visibleClasses(s);
  const students = isTeacher ? teacherStudents : visibleClassStudents(classes);

  useEffect(() => {
    if (!isTeacher) return;
    let alive = true;
    setLoading(true);
    setLoadError("");
    listTeacherClasses(s.currentUserPhone)
      .then(async (items) => {
        if (!alive) return;
        setTeacherClasses(items);
        const firstClass = items[0]?.name || "";
        setSelectedClass(firstClass);
        if (!firstClass) {
          setTeacherStudents([]);
          return;
        }
        const rows = await listTeacherClassStudents(s.currentUserPhone, firstClass);
        if (alive) setTeacherStudents(rows);
      })
      .catch((error) => {
        if (alive) {
          setTeacherClasses([]);
          setTeacherStudents([]);
          setLoadError(error instanceof Error ? error.message : "教师班级加载失败");
        }
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [isTeacher, s.currentUserPhone]);

  async function changeTeacherClass(className: string) {
    setSelectedClass(className);
    setLoading(true);
    setLoadError("");
    try {
      setTeacherStudents(await listTeacherClassStudents(s.currentUserPhone, className));
    } catch (error) {
      setTeacherStudents([]);
      setLoadError(error instanceof Error ? error.message : "学生列表加载失败");
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(
    () =>
      students.filter((stu) =>
        [stu.name, stu.studentNo, stu.phone]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [students, search]
  );

  return (
    <PageShell
      eyebrow={s.role === "teacher" ? "我的班级 / 学生 / 权限边界" : "组织架构 / 班级 / 人员"}
      title={s.role === "teacher" ? "我的班级管理" : "组织与班级管理"}
      actions={
        isTeacher ? (
          <button className="ghost small" disabled title="等待 App 推送服务配置">
            App 提醒待配置
          </button>
        ) : (
          <>
            <button className="primary small" onClick={() => s.openModal("class")}>
              新增学生/班级
            </button>{" "}
            <button className="ghost small" onClick={() => s.openModal("import")}>
              导入学生名单
            </button>
          </>
        )
      }
    >
      <div className="class-management">
        <article className="panel class-side">
          <div className="panel-head">
            <div>
              <p>授权范围</p>
              <h2>我的班级</h2>
            </div>
          </div>
          <div className="class-card-list">
            {classes.map((item) => (
              <button
                type="button"
                key={item.name}
                className={selectedClass === item.name ? "active" : ""}
                onClick={() =>
                  isTeacher
                    ? changeTeacherClass(item.name)
                    : s.openModal("class", { name: item.name })
                }
              >
                <strong>{item.name}</strong>
                <span>
                  {item.count} 名学生 · 完成率 {item.rate}%
                </span>
                <i style={{ width: `${item.rate}%` }} />
              </button>
            ))}
          </div>
        </article>
        <article className="panel class-main">
          <div className="panel-head">
            <div>
              <p>学生列表</p>
              <h2>{students.length} 名学生信息</h2>
            </div>
            <div className="table-tools compact-tools">
              <input
                placeholder="搜索学生姓名、学号、手机号"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {isTeacher ? (
                <select
                  value={selectedClass}
                  onChange={(event) => changeTeacherClass(event.target.value)}
                  disabled={loading || classes.length === 0}
                >
                  {classes.length === 0 ? (
                    <option value="">暂无班级</option>
                  ) : (
                    classes.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))
                  )}
                </select>
              ) : (
                <select>
                  <option>全部班级</option>
                </select>
              )}
              <select>
                <option>全部状态</option>
                <option>正常</option>
                <option>需关注</option>
                <option>高风险</option>
                <option>待激活</option>
              </select>
            </div>
          </div>
          {loading ? (
            <div className="directory-state">正在从数据库加载班级学生…</div>
          ) : loadError ? (
            <div className="directory-state error">
              <strong>学生目录加载失败</strong>
              <span>{loadError}</span>
              <small>教师端不会回退到前端模拟学生数据。</small>
            </div>
          ) : (
            <table className="compact-table modern-table student-table">
              <thead>
                <tr>
                  <th>学生</th>
                  <th>班级</th>
                  <th>手机号</th>
                  <th>家长电话</th>
                  <th>最近成绩</th>
                  <th>完成率</th>
                  <th>风险</th>
                  <th>账号</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((stu) => (
                  <tr key={stu.id}>
                    <td>
                      <strong>{stu.name}</strong>
                      <small>{stu.studentNo}</small>
                    </td>
                    <td>{stu.className}</td>
                    <td>{stu.phone}</td>
                    <td>{stu.parentPhone}</td>
                    <td>
                      <strong>{stu.score}</strong>
                    </td>
                    <td>
                      <div className="progress" aria-label={`${stu.completion}%`}>
                        <i style={{ width: `${stu.completion}%` }} />
                      </div>
                      <small>{stu.completion}%</small>
                    </td>
                    <td>
                      <span
                        className={`student-status ${
                          stu.risk === "高风险" ? "risk" : stu.risk === "需关注" ? "watch" : ""
                        }`}
                      >
                        {stu.risk}
                      </span>
                    </td>
                    <td>{stu.account}</td>
                    <td>
                      <div className="student-row-actions">
                        <button
                          className="ghost small"
                          onClick={() => s.openModal("studentDetail", stu)}
                        >
                          查看
                        </button>
                        {isTeacher && (
                          <button
                            className="ghost small"
                            onClick={() =>
                              s.openModal("sendMessage", {
                                studentId: stu.id,
                                studentName: stu.name,
                                className: stu.className,
                              })
                            }
                          >
                            发消息
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </article>
      </div>
    </PageShell>
  );
}
