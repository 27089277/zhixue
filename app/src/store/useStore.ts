import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Assignment,
  BankView,
  ClassInfo,
  ExamState,
  Knowledge,
  LoginMethod,
  Paper,
  PaperFilters,
  Question,
  Risk,
  Role,
  RoleProfile,
  Section,
  SubmissionRecord,
  UserRow,
  Video,
} from "../types";
import {
  DATA_VERSION,
  loginAccounts,
  roleProfiles as seedRoleProfiles,
  seedAssignments,
  seedClasses,
  seedKnowledge,
  seedPapers,
  seedQuestions,
  seedRisk,
  seedStudents,
  seedUsers,
  seedVideos,
} from "../data/seed";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { preparePapers } from "../lib/papers";
import { currentProfile } from "./permissions";
import type { PracticeWrong } from "../lib/practice";
import type { LoginSession } from "../types";
import {
  persistPaper,
  persistQuestion,
  persistVideo,
  persistUser,
  persistClass,
  persistAssignment,
  persistSubmission,
  updateQuestionApi,
  deleteClassApi,
  deleteQuestionApi,
  deletePaperApi,
  deleteUserApi,
  deleteVideoApi,
  deleteSubmissionApi,
} from "../api/catalog";

export interface ModalState {
  type: string;
  payload?: any;
}

export interface StoreState {
  // session / ui
  authed: boolean;
  role: Role;
  currentUserPhone: string;
  section: Section;
  bankView: BankView;
  loginMethod: LoginMethod;
  aiMode: string;
  aiBusy: boolean;
  selectedQuestions: number;
  activePaperId: string;
  paperFilters: PaperFilters;
  activeModal: ModalState | null;

  // data
  roleProfiles: Record<Role, RoleProfile>;
  assignments: Assignment[];
  videos: Video[];
  classes: ClassInfo[];
  questions: Question[];
  papers: Paper[];
  students: string[];
  risk: Risk[];
  users: UserRow[];
  knowledge: Knowledge[];
  exam: ExamState;
  submissions: SubmissionRecord[]; // 教师侧全量答卷（全班全卷，从 DB hydrate）
  myPracticeQuestions: Question[]; // 学生 AI 自练私有题（只本地、不落库、不进公共/老师库）
  practiceWrong: PracticeWrong[]; // 学生自主/AI 练习错题（本地记录，进错题本）

  // actions: session
  login: (role: Role, _method?: LoginMethod, phone?: string) => void;
  logout: () => void;
  switchRole: (role: Role) => void;
  switchSection: (section: Section) => void;
  restoreSession: (session: LoginSession) => void;
  setBankView: (view: BankView) => void;
  setAiMode: (mode: string) => void;
  setAiBusy: (busy: boolean) => void;
  setSelectedQuestions: (n: number) => void;
  setActivePaper: (id: string) => void;
  setPaperFilters: (patch: Partial<PaperFilters>) => void;

  // actions: modal
  openModal: (type: string, payload?: any) => void;
  closeModal: () => void;

  // actions: data mutations
  setPapers: (papers: Paper[]) => void;
  addPaper: (paper: Paper, opts?: { persist?: boolean }) => void;
  deletePaper: (id: string) => void;
  addQuestions: (questions: Question[]) => void;
  addMyPracticeQuestions: (questions: Question[]) => void; // 学生私有题：仅本地
  logPracticeWrong: (w: PracticeWrong) => void; // 记录自主/AI 练习错题
  clearPracticeWrong: (key: string) => void;
  updateQuestion: (index: number, patch: Partial<Question>) => void;
  deleteQuestion: (index: number) => void;
  addAssignment: (a: Assignment) => void;
  addVideo: (v: Video) => void;
  updateVideo: (index: number, patch: Partial<Video>) => void;
  deleteVideo: (index: number) => void;
  addUser: (u: UserRow) => void;
  toggleUser: (index: number) => void;
  deleteUser: (index: number) => void;
  upsertClass: (name: string, owner: string, originalName?: string) => void;
  deleteClass: (name: string) => void;
  setRoleAllowed: (role: Role, allowed: Section[]) => void;
  shareAsset: (
    assetType: "paper" | "question",
    key: string | number,
    sharedWith: string[]
  ) => void;

  // 用后端真实数据填充目录 + 学生答卷/批改（submissions → exam.submitted / answers）
  hydrate: (data: Partial<Pick<StoreState,
    "papers" | "questions" | "classes" | "users" | "videos" | "knowledge" | "risk" | "assignments">> & {
    submissions?: any[];
  }) => void;

  // actions: exam lifecycle
  startPaper: (paperId: string) => void;
  selectQuestion: (no: number) => void;
  saveAnswer: (paperId: string, no: number, value: string) => void;
  submitPaper: (paperId: string) => void;
  gradeSubmission: (
    submissionId: string,
    manualScore: number,
    feedback: string,
    returned: boolean,
    annotations?: Record<number, string>
  ) => void;
  deleteSubmission: (submissionId: string) => void;
  exitPaper: () => void;
}

function seedExam(): ExamState {
  return {
    mode: "library",
    currentNo: 1,
    startedAt: null,
    endsAt: null,
    examPaperId: null,
    answers: {},
    submitted: {},
  };
}

// RN：会话恢复是异步的（AsyncStorage），启动时由根布局调用 restoreSession()。
export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      authed: false,
      role: "teacher" as Role,
      currentUserPhone: "",
      section: "workspace",
      bankView: "questions",
      loginMethod: "sms",
      aiMode: "auto",
      aiBusy: false,
      selectedQuestions: 2,
      activePaperId: "p-demo-dl",
      paperFilters: { type: "all", search: "", year: "", region: "" },
      activeModal: null,

      roleProfiles: seedRoleProfiles,
      assignments: seedAssignments,
      videos: seedVideos,
      classes: seedClasses,
      questions: seedQuestions,
      papers: preparePapers(seedPapers),
      students: seedStudents,
      risk: seedRisk,
      users: seedUsers,
      knowledge: seedKnowledge,
      exam: seedExam(),
      submissions: [],
      myPracticeQuestions: [],
      practiceWrong: [],

      login: (role, _method, phone) => {
        const prev = get().roleProfiles;
        const acct = phone ? loginAccounts[phone] : undefined;
        // 按登录账号切换身份（姓名/范围/头像），保证多老师的归属与班级目录正确
        const roleProfiles = acct
          ? {
              ...prev,
              [role]: { ...prev[role], name: acct.name, scope: acct.scope, avatar: acct.avatar },
            }
          : prev;
        const allowed = roleProfiles[role].allowed;
        set({
          authed: true,
          role,
          currentUserPhone: phone || get().currentUserPhone,
          roleProfiles,
          section: allowed.includes("workspace") ? "workspace" : allowed[0],
        });
      },
      logout: () => {
        set({ authed: false, section: "workspace", role: "teacher", currentUserPhone: "" });
      },
      // RN：用已保存的会话恢复登录态（根布局启动时调用）
      restoreSession: (session: LoginSession) => {
        const acct = loginAccounts[session.phone];
        const role = session.role;
        const roleProfiles = acct
          ? {
              ...get().roleProfiles,
              [role]: {
                ...get().roleProfiles[role],
                name: acct.name,
                scope: acct.scope,
                avatar: acct.avatar,
              },
            }
          : get().roleProfiles;
        const allowed = roleProfiles[role].allowed;
        set({
          authed: true,
          role,
          currentUserPhone: session.phone,
          roleProfiles,
          section: allowed.includes("workspace") ? "workspace" : allowed[0],
        });
      },
      switchRole: (role) => {
        const allowed = get().roleProfiles[role].allowed;
        const section = get().section;
        set({
          role,
          section: allowed.includes(section) ? section : "workspace",
        });
      },
      switchSection: (section) => {
        const s = get();
        if (!currentProfile(s).allowed.includes(section)) return;
        set({ section });
      },
      setBankView: (bankView) => set({ bankView }),
      setAiMode: (aiMode) => set({ aiMode }),
      setAiBusy: (aiBusy) => set({ aiBusy }),
      setSelectedQuestions: (selectedQuestions) => set({ selectedQuestions }),
      setActivePaper: (activePaperId) => set({ activePaperId }),
      setPaperFilters: (patch) =>
        set((s) => ({ paperFilters: { ...s.paperFilters, ...patch } })),

      openModal: (type, payload) => set({ activeModal: { type, payload } }),
      closeModal: () => set({ activeModal: null }),

      hydrate: (data) =>
        set((s) => {
          // 教师侧全量答卷 + 仅回填当前登录用户自己的 exam（学生看自己的结果/进度）
          let exam = s.exam;
          let submissions = s.submissions;
          if (Array.isArray(data.submissions)) {
            submissions = data.submissions
              .filter((sub: any) => sub?.paperId)
              .map((sub: any) => ({
                id: sub.id || `${sub.paperId}__${sub.studentPhone || "anon"}`,
                paperId: sub.paperId,
                answers: sub.answers ?? undefined,
                score: sub.score,
                objectiveTotal: sub.objectiveTotal,
                submittedAt: sub.submittedAt,
                unanswered: sub.unanswered,
                pendingManual: sub.pendingManual,
                finalScore: sub.finalScore ?? undefined,
                manualScore: sub.manualScore ?? undefined,
                feedback: sub.feedback ?? undefined,
                returned: !!sub.returned,
                gradedAt: sub.gradedAt ?? undefined,
                studentName: sub.studentName ?? undefined,
                studentPhone: sub.studentPhone ?? undefined,
                annotations: sub.annotations ?? undefined,
              }));
            // 仅把「当前登录用户自己」的答卷回填到 exam（教师的 exam 不被全班污染）
            const answers = { ...s.exam.answers };
            const submitted = { ...s.exam.submitted };
            submissions
              .filter((sub) => sub.studentPhone === s.currentUserPhone)
              .forEach((sub) => {
                if (sub.answers) answers[sub.paperId] = sub.answers as any;
                const { id: _id, paperId: _pid, answers: _a, ...rest } = sub;
                submitted[sub.paperId] = rest;
              });
            exam = { ...s.exam, answers, submitted };
          }
          return {
            submissions,
            // 合并而非替换：DB 试卷 + 本地独有试卷（如内置演示卷 p-demo-dl）都保留，
            // 否则学生答过的演示卷在 hydrate 后消失，学情分析/批改无法关联到答卷。
            papers: data.papers
              ? preparePapers([
                  ...data.papers,
                  ...s.papers.filter(
                    (p) => !data.papers!.some((d) => d.id === p.id)
                  ),
                ])
              : s.papers,
            questions: data.questions ?? s.questions,
            classes: data.classes ?? s.classes,
            users: data.users ?? s.users,
            videos: data.videos ?? s.videos,
            knowledge: data.knowledge ?? s.knowledge,
            risk: data.risk ?? s.risk,
            // 合并而非替换：后端作业 + 本地刚发布（可能尚未回读到）的作业都保留，
            // 避免老师刚发的作业被一次 hydrate 覆盖掉、学生看不到。
            assignments: data.assignments
              ? [
                  ...data.assignments,
                  ...s.assignments.filter(
                    (a) => !data.assignments!.some((d) => d.id === a.id)
                  ),
                ]
              : s.assignments,
            exam,
          };
        }),

      setPapers: (papers) => set({ papers: preparePapers(papers) }),
      addPaper: (paper, opts) => {
        if (opts?.persist !== false) persistPaper(paper); // 落库 MySQL（同 id 为更新）；学生私有真题 persist:false 只存本地
        set((s) => {
          const exists = s.papers.some((p) => p.id === paper.id);
          const next = exists
            ? s.papers.map((p) => (p.id === paper.id ? paper : p))
            : [paper, ...s.papers];
          return { papers: preparePapers(next), activePaperId: paper.id };
        });
      },
      deletePaper: (id) => {
        deletePaperApi(id); // 删库 MySQL
        set((s) => ({ papers: s.papers.filter((p) => p.id !== id) }));
      },
      addQuestions: (questions) => {
        questions.forEach(persistQuestion); // 落库 MySQL
        set((s) => ({ questions: [...questions, ...s.questions] }));
      },
      // 学生 AI 私有题：只进本地 slice，绝不 persistQuestion（不入公共/老师库）
      addMyPracticeQuestions: (questions) =>
        set((s) => ({ myPracticeQuestions: [...questions, ...s.myPracticeQuestions] })),
      logPracticeWrong: (w) =>
        set((s) => ({
          practiceWrong: [w, ...s.practiceWrong.filter((x) => x.key !== w.key)].slice(0, 200),
        })),
      clearPracticeWrong: (key) =>
        set((s) => ({ practiceWrong: s.practiceWrong.filter((x) => x.key !== key) })),
      updateQuestion: (index, patch) =>
        set((s) => {
          const questions = s.questions.slice();
          if (questions[index]) {
            const merged = { ...questions[index], ...patch };
            questions[index] = merged;
            if (merged.id != null) updateQuestionApi(merged.id, merged); // 写库
          }
          return { questions };
        }),
      deleteQuestion: (index) =>
        set((s) => {
          const q = s.questions[index];
          if (q?.id != null) deleteQuestionApi(q.id); // 真删 MySQL
          return { questions: s.questions.filter((_, i) => i !== index) };
        }),
      addAssignment: (a) => {
        persistAssignment(a);
        set((s) => ({ assignments: [a, ...s.assignments] }));
      },
      addVideo: (v) => {
        persistVideo(v);
        set((s) => ({ videos: [v, ...s.videos] }));
      },
      updateVideo: (index, patch) =>
        set((s) => {
          const videos = s.videos.slice();
          if (videos[index]) videos[index] = { ...videos[index], ...patch };
          return { videos };
        }),
      deleteVideo: (index) =>
        set((s) => {
          const v = s.videos[index];
          if (v?.id != null) deleteVideoApi(v.id);
          return { videos: s.videos.filter((_, i) => i !== index) };
        }),
      addUser: (u) => {
        persistUser(u);
        set((s) => ({ users: [u, ...s.users] }));
      },
      toggleUser: (index) =>
        set((s) => {
          const users = s.users.slice();
          if (users[index])
            users[index] = {
              ...users[index],
              status: users[index].status === "启用" ? "停用" : "启用",
            };
          return { users };
        }),
      deleteUser: (index) =>
        set((s) => {
          const u = s.users[index];
          if (u?.id != null) deleteUserApi(u.id);
          return { users: s.users.filter((_, i) => i !== index) };
        }),
      upsertClass: (name, owner, originalName) =>
        set((s) => {
          const classes = s.classes.slice();
          const idx = classes.findIndex(
            (c) => c.name === (originalName || name)
          );
          let saved: ClassInfo;
          if (idx >= 0) {
            saved = { ...classes[idx], name, owner };
            classes[idx] = saved;
          } else {
            saved = { name, count: 0, owner, rate: 0 };
            classes.push(saved);
          }
          persistClass(saved); // 写库
          return { classes };
        }),
      deleteClass: (name) => {
        deleteClassApi(name);
        set((s) => ({ classes: s.classes.filter((c) => c.name !== name) }));
      },
      setRoleAllowed: (role, allowed) =>
        set((s) => ({
          roleProfiles: {
            ...s.roleProfiles,
            [role]: { ...s.roleProfiles[role], allowed },
          },
        })),
      shareAsset: (assetType, key, sharedWith) =>
        set((s) => {
          if (assetType === "paper") {
            const papers = s.papers.map((p) =>
              p.id === key ? { ...p, sharedWith } : p
            );
            const target = papers.find((p) => p.id === key);
            if (target) persistPaper(target); // 写库
            return { papers };
          }
          const questions = s.questions.slice();
          const idx = key as number;
          if (questions[idx]) {
            questions[idx] = { ...questions[idx], sharedWith };
            const q = questions[idx];
            if (q.id != null) updateQuestionApi(q.id, q); // 写库
          }
          return { questions };
        }),

      startPaper: (paperId) =>
        set((s) => {
          const paper =
            s.papers.find((p) => p.id === paperId) || s.papers[0];
          const saved = s.exam.answers[paper.id] || {};
          const firstUnanswered =
            paper.items.find((it) => !saved[it.no]?.value)?.no || 1;
          // 续做同一份卷子：保留原计时（退出期间时间照走），不重置；
          // 换成另一份卷子或首次进入：才新建计时会话。
          const resuming = s.exam.examPaperId === paperId && s.exam.startedAt != null;
          if (resuming) {
            return {
              activePaperId: paperId,
              exam: { ...s.exam, mode: "exam", currentNo: firstUnanswered },
            };
          }
          // 作业若设了限时则以其为准；timeLimit=null 表示不限时（无倒计时）
          const assignment = s.assignments.find((a) => a.paperId === paperId);
          const minutes =
            assignment && "timeLimit" in assignment ? assignment.timeLimit : paper.duration;
          const started = Date.now();
          return {
            activePaperId: paperId,
            exam: {
              ...s.exam,
              mode: "exam",
              examPaperId: paperId,
              currentNo: firstUnanswered,
              startedAt: started,
              endsAt: minutes ? started + minutes * 60 * 1000 : null,
            },
          };
        }),
      selectQuestion: (no) =>
        set((s) => ({ exam: { ...s.exam, currentNo: no } })),
      saveAnswer: (paperId, no, value) =>
        set((s) => {
          const paperAnswers = { ...(s.exam.answers[paperId] || {}) };
          paperAnswers[no] = { value, savedAt: Date.now() };
          const answers = { ...s.exam.answers, [paperId]: paperAnswers };
          const papers = s.papers.map((p) => {
            if (p.id !== paperId) return p;
            const answered = Object.values(paperAnswers).filter(
              (a) => a.value
            ).length;
            const items = p.items.map((it) =>
              it.no === no
                ? { ...it, status: (value ? "已答" : "未答") as "已答" | "未答" }
                : it
            );
            return {
              ...p,
              items,
              progress: Math.round((answered / (p.questions || 1)) * 100),
            };
          });
          return { exam: { ...s.exam, answers }, papers };
        }),
      submitPaper: (paperId) =>
        set((s) => {
          const paper = s.papers.find((p) => p.id === paperId)!;
          const answers = s.exam.answers[paperId] || {};
          const unanswered = paper.items.filter(
            (it) => !answers[it.no]?.value
          ).length;
          let score = 0;
          let objectiveTotal = 0;
          paper.items.forEach((it) => {
            if (it.type === "解答题") return;
            objectiveTotal += it.score;
            if (
              String(answers[it.no]?.value || "").trim() ===
              String(it.answer).trim()
            )
              score += it.score;
          });
          const result = {
            score,
            objectiveTotal,
            submittedAt: Date.now(),
            unanswered,
            pendingManual: paper.items.filter((it) => it.type === "解答题").length,
            studentName: currentProfile(s).name,
            studentPhone: s.currentUserPhone,
          };
          const submitted = { ...s.exam.submitted, [paperId]: result };
          const papers = s.papers.map((p) =>
            p.id === paperId ? { ...p, progress: 100 } : p
          );
          const id = `${paperId}__${s.currentUserPhone || "anon"}`;
          const paperAnswers = s.exam.answers[paperId] || {};
          // 落库 MySQL（含手写作答答案引用）
          persistSubmission({ id, paperId, ...result, answers: paperAnswers });
          // 同步进教师侧全量列表（同 id 覆盖）
          const record: SubmissionRecord = { id, paperId, answers: paperAnswers, ...result };
          const submissions = [
            record,
            ...s.submissions.filter((x) => x.id !== id),
          ];
          return { exam: { ...s.exam, submitted }, papers, submissions };
        }),
      gradeSubmission: (submissionId, manualScore, feedback, returned, annotations) =>
        set((s) => {
          const prev = s.submissions.find((x) => x.id === submissionId);
          if (!prev) return {};
          const next: SubmissionRecord = returned
            ? {
                ...prev,
                feedback: feedback || "请补充解题过程后重新提交。",
                returned: true,
                pendingManual: prev.pendingManual,
                annotations: annotations ?? prev.annotations,
              }
            : {
                ...prev,
                manualScore: Math.max(0, manualScore || 0),
                finalScore: prev.score + Math.max(0, manualScore || 0),
                feedback,
                pendingManual: 0,
                returned: false,
                gradedAt: Date.now(),
                annotations: annotations ?? prev.annotations,
              };
          // 落库 MySQL
          persistSubmission({ ...next, answers: prev.answers ?? {} });
          const submissions = s.submissions.map((x) =>
            x.id === submissionId ? next : x
          );
          // 若批改的是当前用户自己的答卷，同步 exam.submitted
          const exam =
            next.studentPhone === s.currentUserPhone
              ? {
                  ...s.exam,
                  submitted: { ...s.exam.submitted, [next.paperId]: next },
                }
              : s.exam;
          return { submissions, exam };
        }),
      deleteSubmission: (submissionId) =>
        set((s) => {
          const sub = s.submissions.find((x) => x.id === submissionId);
          deleteSubmissionApi(submissionId); // 删库 MySQL
          const submissions = s.submissions.filter((x) => x.id !== submissionId);
          // 若删的是当前用户自己的答卷，同步清 exam
          let exam = s.exam;
          if (sub && sub.studentPhone === s.currentUserPhone) {
            const submitted = { ...s.exam.submitted };
            const answers = { ...s.exam.answers };
            delete submitted[sub.paperId];
            delete answers[sub.paperId];
            exam = { ...s.exam, submitted, answers };
          }
          return { submissions, exam };
        }),
      exitPaper: () =>
        set((s) => ({ exam: { ...s.exam, mode: "library" } })),
    }),
    {
      name: "zhixue-exam-state",
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      // 目录数据以后端 MySQL 为准（启动时 hydrate）；本地只持久化考试进度。
      partialize: (s) => ({
        dataVersion: DATA_VERSION,
        exam: s.exam,
        activePaperId: s.activePaperId,
        myPracticeQuestions: s.myPracticeQuestions,
        practiceWrong: s.practiceWrong,
      }),
      merge: (persisted, current) => {
        const p = persisted as any;
        if (!p || p.dataVersion !== DATA_VERSION) return current;
        return {
          ...current,
          exam: p.exam ?? current.exam,
          activePaperId: p.activePaperId ?? current.activePaperId,
          myPracticeQuestions: p.myPracticeQuestions ?? current.myPracticeQuestions,
          practiceWrong: p.practiceWrong ?? current.practiceWrong,
        };
      },
    }
  )
);
