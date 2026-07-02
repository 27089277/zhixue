const state = {
  dataVersion: "ai-bank-flow-20260630-34",
  role: "teacher",
  section: "workspace",
  defaultWorkspaceHtml: "",
  loginMode: "sms",
  smsCode: "246810",
  codeCountdown: 0,
  rememberLogin: true,
  pendingLoginAccount: null,
  aiBusy: false,
  aiMode: "auto",
  bankView: "questions",
  loginAccounts: {
    "13800000000": { name: "张老师", avatar: "张", scope: "光明中学", roles: ["teacher"] },
    "13900000000": { name: "王子涵", avatar: "王", scope: "初三(1)班", roles: ["student"] },
    "13700000000": { name: "赵管理员", avatar: "赵", scope: "光明中学", roles: ["admin"] }
  },
  currentUser: {
    name: "张老师",
    scope: "光明中学 / 初三数学组",
    phone: "13800000000"
  },
  roleProfiles: {
    teacher: {
      name: "张老师",
      scope: "光明中学 / 初三数学组",
      avatar: "张",
      banner: ["AI题库 1", "学生 1", "待批 1"],
      allowed: ["workspace", "bank", "homework", "grading", "analytics"]
    },
    student: {
      name: "王子涵",
      scope: "初三(1)班 / 学生",
      avatar: "王",
      banner: ["待完成 1", "已提交 0", "反馈 0"],
      allowed: ["workspace"]
    },
    admin: {
      name: "赵管理员",
      scope: "光明中学 / 校区管理员",
      avatar: "赵",
      banner: ["角色 3", "教师 1", "学生 1"],
      allowed: ["workspace", "org", "bank", "admin"]
    }
  },
  selectedQuestions: 2,
  activePaperId: "p-demo-dl",
  paperFilters: { type: "all", search: "", year: "", region: "" },
  exam: {
    mode: "library",
    currentNo: 1,
    startedAt: null,
    endsAt: null,
    answers: {},
    submitted: {}
  },
  assignments: [
    { id: "hw-demo", title: "大连中考物理真题练习", paperId: "p-demo-dl", className: "初三(1)班", deadline: "2026-07-01T22:00", status: "待完成", createdAt: Date.now(), kind: "作业", mode: "paper" }
  ],
  videos: [
    { name: "电学计算真题讲解.mp4", size: "186.4MB", progress: 100, status: "已完成", owner: "张老师", source: "老师上传", paperTitle: "2025 大连中考物理真题练习", point: "欧姆定律" }
  ],
  classes: [
    { name: "初三(1)班", count: 1, owner: "张老师", rate: 0 }
  ],
  questions: [
    { title: "家庭电路中空气开关跳闸的常见原因是（ ）", type: "单选题", point: "安全用电", source: "2025 大连中考物理真题练习", visibility: "public", owner: "系统真题库", origin: "试卷导入", paperTitle: "2025 大连中考物理真题练习" },
    { title: "已知电压 6V、电阻 3Ω，求通过电阻的电流。", type: "填空题", point: "欧姆定律", source: "AI 生成", visibility: "teacher", owner: "张老师", origin: "AI 生成", sharedWith: [] },
    { title: "结合图像说明串联电路中电流、电压的特点。", type: "解答题", point: "串并联电路", source: "老师手动编写", visibility: "teacher", owner: "张老师", origin: "老师手动编写", sharedWith: ["李老师"] },
    { title: "小灯泡亮度变化与实际功率的关系练习", type: "单选题", point: "电功率", source: "公共练习库", visibility: "public", owner: "系统推荐", origin: "公共题" }
  ],
  papers: [
    {
      id: "p-demo-dl",
      title: "2025 大连中考物理真题练习",
      exam: "中考真题",
      subject: "物理",
      region: "大连",
      year: 2025,
      duration: 45,
      score: 60,
      questions: 6,
      progress: 48,
      difficulty: "中等",
      sections: ["选择题 3", "填空题 2", "解答题 1"],
      tags: ["AI 智能搜索", "老师待校对", "可发布"],
      visibility: "public",
      owner: "系统真题库",
      source: "AI 从网络导入",
      sharedWith: [],
      items: [
        { no: 1, type: "单选题", title: "家庭电路中空气开关跳闸的常见原因是（ ）", choices: ["电路断路", "电路短路", "电压过低", "用电器断开"], answer: "B", score: 6, status: "未答" },
        { no: 2, type: "单选题", title: "下列做法符合安全用电原则的是（ ）", choices: ["湿手触摸开关", "更换灯泡前断开电源", "用铜丝代替保险丝", "多个大功率电器共用插座"], answer: "B", score: 6, status: "未答" },
        { no: 3, type: "单选题", title: "一只标有 6V 3W 的小灯泡正常发光时电流约为（ ）", choices: ["0.2A", "0.5A", "2A", "18A"], answer: "B", score: 6, status: "未答" },
        { no: 4, type: "填空题", title: "电压 6V、电阻 3Ω，通过电阻的电流为 ____ A。", answer: "2", score: 8, status: "未答" },
        { no: 5, type: "填空题", title: "串联电路中各处电流 ____，总电压等于各部分电压 ____。", answer: "相等；之和", score: 10, status: "未答" },
        { no: 6, type: "解答题", title: "请设计一个实验验证并联电路干路电流等于各支路电流之和，写出器材、步骤和结论。", answer: "主观题待老师批改", score: 24, status: "未答" }
      ]
    }
  ],
  students: ["王子涵"],
  risk: [
    { name: "王子涵", risk: "需关注", point: "欧姆定律、实验表达" }
  ],
  users: [
    { name: "张老师", role: "教师", org: "光明中学 / 初三(1)班", status: "启用" },
    { name: "李老师", role: "教师", org: "光明中学 / 初三(2)班", status: "启用" },
    { name: "王子涵", role: "学生", org: "初三(1)班", status: "启用" },
    { name: "赵管理员", role: "校区管理员", org: "光明中学校区", status: "启用" },
  ],
  knowledge: [
    { name: "安全用电", mastery: 82, count: 2 },
    { name: "欧姆定律", mastery: 68, count: 2 },
    { name: "串并联电路", mastery: 55, count: 2 }
  ]
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
const API_BASE = "http://127.0.0.1:8000/api";

function toast(message) {
  const el = $("#toast");
  el.textContent = message;
  el.classList.add("show");
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => el.classList.remove("show"), 2200);
}

async function aiPost(path, payload) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      throw new Error(data.detail || text);
    } catch (error) {
      if (error.message && error.message !== text) throw error;
      throw new Error(text || `AI 请求失败：${response.status}`);
    }
  }
  return response.json();
}

function aiErrorMessage(error) {
  const message = error?.message || String(error || "未知错误");
  if (message.includes("未配置 DEEPSEEK_API_KEY")) return "DeepSeek Key 未配置，后端已接通但不能调用模型";
  if (message.includes("404")) return "DeepSeek 后端路由未加载，请重启 8000 后端服务";
  if (message.includes("504") || message.includes("响应超时") || message.includes("timed out")) return "DeepSeek 响应超时，请稍后重试或缩小导入范围";
  if (message.includes("Failed to fetch")) return "无法连接 AI 后端，请先启动 8000 服务";
  return message.length > 120 ? `${message.slice(0, 120)}...` : message;
}

function mockAiQuestions({ title = "AI生成题目", knowledgePoint = "一元二次方程", count = 3, type = "单选题" } = {}) {
  return Array.from({ length: count }, (_, index) => ({
    title: `${title}：${knowledgePoint} 第 ${index + 1} 题`,
    type,
    point: knowledgePoint,
    source: "教师题库",
    visibility: "teacher",
    owner: currentProfile().name
  }));
}

const aiSceneNames = {
  workspace: "教学首页",
  org: "班级与学生管理",
  bank: "题库管理",
  homework: "作业与考试",
  grading: "批改与评价",
  video: "讲题视频",
  analytics: "学情分析",
  admin: "后台管理"
};

function aiContextFor(section = state.section) {
  const classes = visibleClasses();
  return {
    role: state.role,
    scene: aiSceneNames[section] || section,
    classes: classes.map(item => ({ name: item.name, count: item.count, completion: item.rate })),
    students: classes.reduce((sum, item) => sum + item.count, 0),
    questions: visibleQuestions().length,
    papers: state.papers.length,
    assignments: state.assignments.filter(item => classes.some(cls => cls.name === item.className)).length,
    videos: state.videos.length,
    knowledge: state.knowledge,
    pendingManual: 12,
    riskStudents: state.risk
  };
}

function mockAiAnalysis(scene = state.section) {
  const name = aiSceneNames[scene] || "当前模块";
  const presets = {
    workspace: ["优先处理 12 份主观题，再提醒 8 名未提交学生。", "本周均分上升，但几何证明仍是风险点。"],
    org: ["张老师只应管理授权班级，建议继续按班级筛选学生。", "需关注学生应加入本周跟进计划。"],
    bank: ["公共真题、教师题库、学生练习库边界清晰，导入后建议先审核再公开。", "AI 搜真题适合先生成草稿，再人工校对答案解析。"],
    homework: ["整卷发布适合考试，题库选题适合作业和测验。", "建议给未提交学生设置自动提醒。"],
    grading: ["主观题建议按题集中批改，并用 AI 生成初评语。", "低分学生应自动进入错题和讲题视频推荐。"],
    video: ["讲题视频应绑定知识点、题目和作业结果。", "未观看学生可进入提醒队列。"],
    analytics: ["班级薄弱点集中在相似三角形和二次函数。", "建议按风险学生生成分层练习。"],
    admin: ["建议检查账号、权限边界和异常登录。", "SSO 与手机验证码登录需要审计日志。"]
  };
  const insights = presets[scene] || [`${name} 可加入 AI 总结、风险识别和下一步建议。`];
  return {
    summary: `${name} AI 分析已生成`,
    insights: insights.map((detail, index) => ({ title: index ? "补充观察" : "重点建议", detail, priority: index ? "中" : "高" })),
    actions: [
      { label: "生成跟进计划", target_module: scene, reason: "把分析转成可执行任务" },
      { label: "推送个性化练习", target_module: "homework", reason: "针对薄弱知识点补练" }
    ],
    risks: [{ name: "数据需复核", reason: "当前为原型数据", suggestion: "正式版接 MySQL 和审计日志后再自动执行" }]
  };
}

function currentProfile() {
  return state.roleProfiles[state.role] || state.roleProfiles.teacher;
}

function hasPermission(section) {
  return currentProfile().allowed.includes(section);
}

function visibleClasses() {
  if (state.role === "teacher") {
    return state.classes.filter(item => item.owner === currentProfile().name);
  }
  return state.classes;
}

function classOptions() {
  return visibleClasses().map(item => `<option>${item.name}</option>`).join("");
}

function availableTeacherNames(owner = currentProfile().name) {
  const names = state.users.filter(user => user.role === "教师" && user.status === "启用").map(user => user.name);
  return Array.from(new Set([...names, owner, "李老师", "王教研"])).filter(Boolean);
}

function sharedWithNames(item = {}) {
  return Array.isArray(item.sharedWith) ? item.sharedWith : [];
}

function canViewBankAsset(item = {}) {
  if (state.role !== "teacher") return true;
  if (item.visibility !== "teacher") return true;
  return item.owner === currentProfile().name || sharedWithNames(item).includes(currentProfile().name);
}

function canOperateBankAsset(item = {}) {
  if (state.role !== "teacher") return true;
  if (item.visibility !== "teacher") return true;
  return item.owner === currentProfile().name;
}

function bankAssetScopeText(item = {}) {
  if (item.visibility !== "teacher") return "公共库";
  const shared = sharedWithNames(item);
  if (item.owner === currentProfile().name) return shared.length ? `我的私人库 · 已共享给 ${shared.join("、")}` : "我的私人库 · 仅自己可见";
  if (shared.includes(currentProfile().name)) return `${item.owner} 共享给我`;
  return `${item.owner} 私人库`;
}

function visibleQuestions() {
  if (state.role === "teacher") {
    return state.questions.filter(canViewBankAsset);
  }
  if (state.role === "student") {
    return state.questions.filter(item => item.visibility === "public" || item.visibility === "student");
  }
  return state.questions;
}

function questionStatus(item) {
  if (item.visibility === "teacher") {
    if (item.owner === currentProfile().name) return sharedWithNames(item).length ? "已共享" : "仅自己";
    return "共享给我";
  }
  if (item.visibility === "student") return "学生可练";
  return "公共可用";
}

function studentsForClass(className) {
  const classInfo = state.classes.find(item => item.name === className) || state.classes[0];
  if (className === "初三(1)班") {
    return [{
      id: "s-demo-wzh",
      name: "王子涵",
      className,
      studentNo: "GM2026001",
      phone: "139****0000",
      parentPhone: "138****6000",
      score: 72,
      completion: classInfo.rate,
      weakPoint: "欧姆定律",
      risk: "需关注",
      account: "启用",
      lastLogin: "今天 08:20"
    }];
  }
  const familyNames = ["王", "李", "张", "刘", "陈", "赵", "孙", "周", "吴", "郑", "冯", "蒋", "沈", "韩", "杨", "朱", "秦", "许", "何", "林"];
  const givenNames = ["子涵", "思远", "雨桐", "宇航", "梓萱", "天宇", "明轩", "若溪", "佳怡", "浩然", "一诺", "嘉宁", "晨曦", "睿泽", "欣怡", "奕辰", "诗涵", "承泽", "语彤", "景行"];
  const weakPoints = ["二次函数", "相似三角形", "一元二次方程", "几何证明", "圆", "勾股定理", "函数图像"];
  return Array.from({ length: classInfo.count }, (_, index) => {
    const score = Math.max(48, Math.min(99, 92 - (index % 9) * 4 + (index % 3) * 2));
    const completion = Math.max(52, Math.min(100, classInfo.rate - (index % 6) * 3 + (index % 4)));
    const risk = score < 65 ? "高风险" : score < 78 ? "需关注" : "正常";
    const no = String(index + 1).padStart(2, "0");
    return {
      id: `${className.replace(/\D/g, "") || "9"}${no}`,
      name: `${familyNames[index % familyNames.length]}${givenNames[(index + className.length) % givenNames.length]}`,
      className,
      studentNo: `GM2026${className.match(/\((\d)\)/)?.[1] || "0"}${no}`,
      phone: `139****${String(1000 + index * 17).slice(-4)}`,
      parentPhone: `138****${String(6000 + index * 23).slice(-4)}`,
      score,
      completion,
      weakPoint: weakPoints[index % weakPoints.length],
      risk,
      account: index % 13 === 0 ? "待激活" : "启用",
      lastLogin: index % 5 === 0 ? "昨天 20:18" : "今天 07:42"
    };
  });
}

function visibleClassStudents() {
  return visibleClasses().flatMap(item => studentsForClass(item.name));
}

function searchCatalog(keyword = "") {
  const query = keyword.trim();
  const items = [
    ...state.students.map(name => ({
      type: "学生",
      title: name,
      meta: "初三(1)班 · 最近正确率 72%",
      section: "analytics",
      action: "查看学情"
    })),
    ...visibleClasses().map(item => ({
      type: "班级",
      title: item.name,
      meta: `${item.count} 人 · 本周完成率 ${item.rate}%`,
      section: "org",
      action: "管理学生"
    })),
    ...visibleQuestions().map(item => ({
      type: "题目",
      title: item.title,
      meta: `${item.point} · ${item.source}`,
      section: "bank",
      action: "打开题目"
    })),
    ...state.papers.map(item => ({
      type: "试卷",
      title: item.title,
      meta: `${item.exam} · ${item.questions} 题 · ${item.duration} 分钟`,
      section: "homework",
      action: "发布整卷"
    })),
    ...state.assignments.filter(item => visibleClasses().some(cls => cls.name === item.className)).map(item => ({
      type: item.kind || "作业",
      title: item.title,
      meta: `${item.className} · 截止 ${item.deadline.replace("T", " ")}`,
      section: "homework",
      action: "看进度"
    })),
    ...state.videos.map(item => ({
      type: "视频",
      title: item.name,
      meta: `${item.status} · ${item.size}`,
      section: "video",
      action: "关联题目"
    }))
  ];
  if (!query) return items.slice(0, 8);
  return items.filter(item => `${item.type} ${item.title} ${item.meta}`.toLowerCase().includes(query.toLowerCase())).slice(0, 12);
}

function groupedSearchResults(keyword = "") {
  return searchCatalog(keyword).reduce((groups, item) => {
    if (!groups[item.type]) groups[item.type] = [];
    groups[item.type].push(item);
    return groups;
  }, {});
}

function renderSearchPanel(keyword = "") {
  const search = $(".search");
  if (!search) return;
  let panel = $("#globalSearchPanel");
  if (!panel) {
    panel = document.createElement("div");
    panel.id = "globalSearchPanel";
    panel.className = "global-search-panel hidden";
    search.appendChild(panel);
  }
  const query = keyword.trim();
  const groups = groupedSearchResults(query);
  const groupNames = Object.keys(groups);
  const quickActions = [
    { label: "发布作业", section: "homework" },
    { label: "新增题目", modal: "question" },
    { label: "查看批改", section: "grading" }
  ];
  panel.innerHTML = `
    <div class="search-panel-head">
      <strong>${query ? `搜索“${query}”` : "全局搜索"}</strong>
      <span>学生、班级、题目、试卷、作业、视频</span>
    </div>
    <div class="search-shortcuts">
      ${quickActions.map(item => `<button type="button" data-search-section="${item.section || ""}" data-search-modal="${item.modal || ""}">${item.label}</button>`).join("")}
    </div>
    ${groupNames.length ? groupNames.map(name => `
      <section class="search-group">
        <h3>${name}</h3>
        ${groups[name].map(item => `
          <button type="button" class="search-hit" data-search-section="${item.section}">
            <span class="hit-type">${item.type}</span>
            <span><strong>${item.title}</strong><small>${item.meta}</small></span>
            <b>${item.action}</b>
          </button>
        `).join("")}
      </section>
    `).join("") : `<div class="search-empty"><strong>没有找到相关内容</strong><span>换个关键词，或新建题目/试卷后再搜索。</span></div>`}
  `;
  panel.classList.remove("hidden");
}

function hideSearchPanel() {
  $("#globalSearchPanel")?.classList.add("hidden");
}

function applyPermissions() {
  const profile = currentProfile();
  state.currentUser = {
    name: profile.name,
    scope: profile.scope,
    phone: $("#phoneInput") ? $("#phoneInput").value : state.currentUser.phone
  };
  $("#currentAvatar").textContent = profile.avatar;
  $("#currentUserName").textContent = profile.name;
  $("#currentUserScope").textContent = profile.scope;
  $$(".side-nav > button[data-section]").forEach(btn => {
    const allowed = hasPermission(btn.dataset.section);
    btn.classList.toggle("locked", !allowed);
    btn.style.display = allowed ? "" : "none";
    btn.disabled = false;
  });
  const workspaceBtn = $('.side-nav button[data-section="workspace"]');
  const homeLabels = {
    student: "<span>▦</span>学习首页",
    teacher: "<span>▦</span>教学首页",
    admin: "<span>▦</span>运营总览"
  };
  workspaceBtn.innerHTML = homeLabels[state.role] || homeLabels.teacher;
  $(".role-switch").style.display = "none";
  $("#publishTop").style.display = hasPermission("homework") ? "" : "none";
  $("#permissionBtn").style.display = state.role === "admin" ? "" : "none";
  $("#globalSearch").placeholder = state.role === "student"
    ? "搜索作业、错题、讲题视频"
    : state.role === "admin"
      ? "搜索账号、角色、学校、审计日志"
      : "搜索学生、作业、试卷、资源等";
}

function saveLoginSession(role, method = "password") {
  if (!$("#rememberLogin")?.checked && method !== "restore") return;
  const profile = state.roleProfiles[role] || state.roleProfiles.teacher;
  localStorage.setItem("zhixue-login-session", JSON.stringify({
    role,
    method,
    name: profile.name,
    scope: profile.scope,
    phone: $("#phoneInput")?.value || state.currentUser.phone,
    loginAt: Date.now(),
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
  }));
}

function clearLoginSession() {
  localStorage.removeItem("zhixue-login-session");
}

function restoreLoginSession() {
  try {
    const saved = JSON.parse(localStorage.getItem("zhixue-login-session") || "null");
    if (!saved || !saved.role || saved.expiresAt < Date.now()) {
      clearLoginSession();
      return false;
    }
    if ($("#rememberLogin")) $("#rememberLogin").checked = true;
    if ($("#phoneInput") && saved.phone) $("#phoneInput").value = saved.phone;
    loginAs(saved.role, "restore");
    toast(`${saved.name || currentProfile().name} 已恢复登录状态`);
    return true;
  } catch {
    clearLoginSession();
    return false;
  }
}

function loginAs(role, method = state.loginMode) {
  state.role = role;
  applyPermissions();
  $("#loginScreen").classList.add("hidden");
  $$(".role-switch button").forEach(btn => btn.classList.toggle("active", btn.dataset.role === role));
  $("#roleBanner h1").textContent = role === "student" ? "学生学习空间" : role === "admin" ? "管理后台" : "老师工作台";
  $("#roleBanner .banner-metrics").innerHTML = currentProfile().banner.map(item => `<span>${item}</span>`).join("");
  $("#studentDock").classList.toggle("hidden", role !== "student");
  switchSection("workspace");
  saveLoginSession(role, method);
  toast(`${currentProfile().name} 已登录，权限范围：${currentProfile().scope}`);
}

function renderClasses() {
  const rows = $("#classRows");
  if (!rows) return;
  rows.innerHTML = visibleClasses().map(item => `
    <tr>
      <td>${item.name}</td>
      <td>${item.count}</td>
      <td>${item.owner}</td>
      <td><div class="progress" aria-label="${item.rate}%"><i style="width:${item.rate}%"></i></div></td>
      <td><button class="ghost small" data-class="${item.name}">查看</button></td>
    </tr>
  `).join("");
}

function renderHomeworkRows() {
  const rows = $("#homeworkRows");
  if (!rows) return;
  rows.innerHTML = visibleQuestions().map((item, index) => `
    <tr>
      <td><input type="checkbox" ${index < state.selectedQuestions ? "checked" : ""} data-question-index="${index}" /></td>
      <td>${item.title}</td>
      <td>${item.type}</td>
      <td>${item.point}</td>
      <td>${item.source}</td>
    </tr>
  `).join("");
}

function updateSelectedCount() {
  state.selectedQuestions = $$("[data-question-index]").filter(input => input.checked).length;
  if ($("#selectedCount")) $("#selectedCount").textContent = `已选 ${state.selectedQuestions} 题，总分 ${state.selectedQuestions * 10} 分`;
}

function renderVideos() {
  const queue = $("#videoQueue");
  if (!queue) return;
  queue.innerHTML = state.videos.map((item, index) => `
    <div class="video-item">
      <strong>${item.name}</strong>
      <div class="video-meta">
        <span>${item.size}</span>
        <span>${item.status === "上传中" ? item.progress + "%" : "已完成"}</span>
      </div>
      <div class="progress"><i style="width:${item.progress}%"></i></div>
      <div class="video-meta">
        <span>${item.status}</span>
        <span><button class="ghost small" data-video-action="${index}">${item.status === "上传中" ? "暂停" : item.status === "已暂停" ? "继续" : "关联题目"}</button> <button class="ghost small" data-delete-video="${index}">删除</button></span>
      </div>
    </div>
  `).join("");
}

function renderStudents() {
  if ($("#studentSelect")) $("#studentSelect").innerHTML = state.students.map(name => `<option>${name}</option>`).join("");
}

function renderAnalytics() {
  const chart = $("#barChart");
  const riskList = $("#riskList");
  if (!chart || !riskList) return;
  const bars = [
    ["安全用电", 82], ["欧姆定律", 68], ["串并联", 55], ["电功率", 60]
  ];
  chart.innerHTML = bars.map(([label, value]) => `
    <div style="height:${value}%"><span>${label}</span></div>
  `).join("");
  riskList.innerHTML = state.risk.map(item => `
    <div class="risk-item">
      <strong>${item.name}</strong>
      <span>${item.point}</span>
      <em>${item.risk}</em>
    </div>
  `).join("");
}

function activePaper() {
  return state.papers.find(paper => paper.id === state.activePaperId) || state.papers[0];
}

function stripChoiceLabel(value) {
  return String(value || "").replace(/^[A-H][\.、．]\s*/i, "").trim();
}

function normalizeAiOptions(options = []) {
  if (!Array.isArray(options)) return [];
  return options.map(option => {
    if (typeof option === "string") return stripChoiceLabel(option);
    if (option && typeof option === "object") return stripChoiceLabel(option.text || option.value || option.content || option.label);
    return stripChoiceLabel(option);
  }).filter(Boolean);
}

function aiQuestionToPaperItem(item = {}, index = 0) {
  const type = item.type || item.question_type || "单选题";
  const score = Number(item.score || item.points || item.full_score) || (type.includes("解答") ? 10 : 4);
  const knowledge = Array.isArray(item.knowledge_points) ? item.knowledge_points : [item.knowledge_point || item.point].filter(Boolean);
  return {
    no: Number(item.number || item.no) || index + 1,
    type,
    title: item.stem || item.title || item.question || `第 ${index + 1} 题`,
    choices: normalizeAiOptions(item.options || item.choices),
    answer: item.standard_answer || item.answer || item.reference_answer || "",
    analysis: item.analysis || item.explanation || item.solution || "",
    score,
    knowledge,
    status: "未答"
  };
}

function normalizePaperSections(sections = [], items = []) {
  if (Array.isArray(sections) && sections.length) {
    return sections.map(section => {
      if (typeof section === "string") return section;
      return `${section.name || section.title || section.section || "题组"} ${section.count || section.question_count || ""}`.trim();
    }).filter(Boolean);
  }
  const counts = items.reduce((result, item) => {
    result[item.type] = (result[item.type] || 0) + 1;
    return result;
  }, {});
  const normalized = Object.entries(counts).map(([type, count]) => `${type} ${count}`);
  return normalized.length ? normalized : ["选择题", "填空题", "解答题"];
}

function createBankQuestionFromPaperItem(item, paper, index) {
  return {
    title: item.title || `${paper.title} 第 ${index + 1} 题`,
    type: item.type || "单选题",
    point: (item.knowledge || [])[0] || "综合应用",
    source: paper.title,
    visibility: paper.visibility || "teacher",
    owner: paper.owner || currentProfile().name,
    origin: "试卷导入",
    paperId: paper.id,
    paperTitle: paper.title
  };
}

function preparePapers() {
  const choiceQuestions = [
    ["下列各数中，是无理数的是（ ）", ["0", "√2", "1/3", "-2"], "B"],
    ["若 x + 2 = 5，则 x 的值是（ ）", ["2", "3", "5", "7"], "B"],
    ["函数 y = 2x - 1 的图像经过（ ）", ["第一、二、三象限", "第一、二、四象限", "第一、三、四象限", "第二、三、四象限"], "C"],
    ["一组数据 2、3、3、5、7 的众数是（ ）", ["2", "3", "5", "7"], "B"],
    ["方程 x² - 4 = 0 的解是（ ）", ["x=2", "x=-2", "x=±2", "无解"], "C"],
    ["等腰三角形的一个底角为 50°，则顶角为（ ）", ["50°", "65°", "80°", "100°"], "C"]
  ];
  state.papers.forEach(paper => {
    const existing = new Map(paper.items.map(item => [item.no, item]));
    paper.items = Array.from({ length: paper.questions }, (_, index) => {
      const no = index + 1;
      const old = existing.get(no) || {};
      if (old.title) {
        return { ...old, no, status: old.status || "未答" };
      }
      if (no <= 6) {
        const sample = choiceQuestions[(no - 1) % choiceQuestions.length];
        return { ...old, no, type: "单选题", title: sample[0], choices: sample[1], answer: sample[2], score: old.score || 4, status: old.status || "未答" };
      }
      if (no <= 18) {
        return {
          ...old,
          no,
          type: "填空题",
          title: `已知关于 x 的方程 x² - ${no}x + ${no - 1} = 0，请写出一个实数根`,
          answer: "1",
          score: old.score || 4,
          status: old.status || "未答"
        };
      }
      return {
        ...old,
        no,
        type: "解答题",
        title: `${no}. 综合题：请结合函数、方程或几何知识写出完整推理过程`,
        answer: "主观题待老师批改",
        score: old.score || (no === paper.questions ? 14 : 10),
        status: old.status || "未答"
      };
    });
  });
}

function loadExamState() {
  try {
    const saved = JSON.parse(localStorage.getItem("zhixue-exam-state") || "{}");
    if (saved.dataVersion !== state.dataVersion) {
      localStorage.removeItem("zhixue-exam-state");
      return;
    }
    state.exam.answers = saved.answers || {};
    state.exam.submitted = saved.submitted || {};
    state.assignments = saved.assignments || state.assignments;
    state.questions = saved.questions || state.questions;
    state.papers = saved.papers || state.papers;
    state.classes = saved.classes || state.classes;
    state.videos = saved.videos || state.videos;
    state.users = saved.users || state.users;
    state.questions = state.questions.map(item => ({
      ...item,
      source: item.source === "校本题" || item.source === "老师自建题" ? "教师题库" : item.source?.includes("真题") || item.source?.includes("中考") ? "公共真题库" : item.source || "教师题库",
      visibility: item.visibility || (item.source === "学生练习库" ? "student" : item.source === "公共真题库" || item.source?.includes("真题") ? "public" : "teacher"),
      owner: item.owner || (item.source === "教师题库" || item.source === "校本题" || item.source === "老师自建题" ? "张老师" : "题库中心")
    }));
    if (saved.roleProfiles) {
      Object.keys(saved.roleProfiles).forEach(role => {
        if (state.roleProfiles[role]) state.roleProfiles[role].allowed = saved.roleProfiles[role].allowed;
      });
    }
    state.papers.forEach(paper => {
      const answered = Object.values(state.exam.answers[paper.id] || {}).filter(answer => answer.value).length;
      paper.progress = state.exam.submitted[paper.id] ? 100 : Math.round(answered / paper.questions * 100);
    });
  } catch {
    state.exam.answers = {};
    state.exam.submitted = {};
  }
}

function persistExamState() {
  localStorage.setItem("zhixue-exam-state", JSON.stringify({
    dataVersion: state.dataVersion,
    answers: state.exam.answers,
    submitted: state.exam.submitted,
    assignments: state.assignments,
    questions: state.questions,
    papers: state.papers,
    classes: state.classes,
    videos: state.videos,
    users: state.users,
    roleProfiles: Object.fromEntries(Object.entries(state.roleProfiles).map(([role, profile]) => [role, { allowed: profile.allowed }]))
  }));
}

function renderStudentAssignments() {
  const list = $("#studentAssignmentList");
  if (!list) return;
  list.innerHTML = state.assignments.map(assignment => {
    const paper = state.papers.find(item => item.id === assignment.paperId);
    const result = state.exam.submitted[assignment.paperId];
    const needsRedo = result?.returned;
    return `<article class="assignment-row">
      <div><strong>${assignment.title}</strong><span>${paper.title} · 截止 ${assignment.deadline.replace("T", " ")}</span></div>
      <em class="${result && !needsRedo ? "done" : ""}">${needsRedo ? "老师退回" : result ? "已提交" : assignment.status}</em>
      <button class="${result && !needsRedo ? "ghost" : "primary"} small" data-start-paper="${paper.id}">${needsRedo ? "修改后重交" : result ? "查看结果" : "开始作业"}</button>
    </article>`;
  }).join("") || `<div class="empty-state">暂无老师发布的作业</div>`;
}

function renderStudentPapers(filter = state.paperFilters.type) {
  const list = $("#studentPaperList");
  if (!list) return;
  state.paperFilters.type = filter;
  if (state.exam.mode === "library") {
    $(".tablet-top strong").textContent = "历史真题";
    $(".tablet-top span").textContent = "选择试卷后进入完整答题流程";
    $(".student-progress i").style.width = "0";
    $(".back").classList.add("hidden");
    $("#examClockWrap").classList.add("hidden");
  }
  const papers = state.papers.filter(paper => {
    const typeMatch = filter === "all" || (filter === "unfinished" ? paper.progress < 100 : paper.exam === filter);
    const search = state.paperFilters.search.toLowerCase();
    const searchMatch = !search || `${paper.title} ${paper.region} ${paper.year}`.toLowerCase().includes(search);
    const yearMatch = !state.paperFilters.year || String(paper.year) === state.paperFilters.year;
    const regionMatch = !state.paperFilters.region || paper.region === state.paperFilters.region;
    return typeMatch && searchMatch && yearMatch && regionMatch;
  });
  list.innerHTML = papers.map(paper => `
    <article class="paper-card">
      <div class="paper-card-head"><span>${paper.exam}</span><em>${paper.difficulty}</em></div>
      <strong>${paper.title}</strong>
      <span>${paper.region} · ${paper.year} · ${paper.questions} 题 · ${paper.score} 分 · ${paper.duration} 分钟</span>
      <div class="progress"><i style="width:${paper.progress}%"></i></div>
      <div class="tag-row">${paper.tags.map(tag => `<span>${tag}</span>`).join("")}</div>
      <div class="paper-card-actions">
        <small>${state.exam.submitted[paper.id]?.returned ? "老师已退回修改" : state.exam.submitted[paper.id] ? `已交卷 · ${state.exam.submitted[paper.id].score} 分` : paper.progress ? `已完成 ${paper.progress}%` : "尚未开始"}</small>
        <button class="primary small" data-start-paper="${paper.id}">${state.exam.submitted[paper.id]?.returned ? "修改后重交" : state.exam.submitted[paper.id] ? "查看结果" : paper.progress ? "继续答题" : "开始答题"}</button>
      </div>
    </article>
  `).join("") || `<div class="empty-state">没有符合条件的试卷</div>`;
}

function renderPaperQuestionNav() {
  const nav = $("#paperQuestionNav");
  if (!nav) return;
  const paper = activePaper();
  nav.innerHTML = paper.items.map(item => {
    const saved = state.exam.answers[paper.id]?.[item.no];
    const cls = item.no === state.exam.currentNo ? "current" : saved?.value ? "done" : "todo";
    return `<button class="${cls}" data-paper-question="${item.no}">${item.no}</button>`;
  }).join("");
  const current = paper.items.find(item => item.no === state.exam.currentNo) || paper.items[0];
  $("#currentQuestionMeta").textContent = `第 ${current.no} 题 · ${current.type} · ${current.score} 分`;
  $("#currentQuestionTitle").textContent = current.title;
  if (state.exam.mode === "exam") {
    $(".tablet-top strong").textContent = paper.title;
    $(".tablet-top span").textContent = `第 ${current.no} / ${paper.questions} 题 · 已自动保存`;
  }
  $(".student-progress i").style.width = `${paper.progress}%`;
  renderPaperQuestion(current);
}

function renderPaperQuestion(item) {
  const paper = activePaper();
  const saved = state.exam.answers[paper.id]?.[item.no]?.value || "";
  const content = $("#paperQuestionContent");
  if (item.type === "单选题") {
    content.innerHTML = `<div class="exam-options">${item.choices.map((choice, index) => {
      const value = String.fromCharCode(65 + index);
      return `<label><input type="radio" name="paperAnswer" value="${value}" ${saved === value ? "checked" : ""}/><b>${value}</b><span>${choice}</span></label>`;
    }).join("")}</div>`;
  } else if (item.type === "填空题") {
    content.innerHTML = `<label class="exam-answer"><span>答案</span><input id="paperTextAnswer" value="${saved}" placeholder="请输入答案" autocomplete="off" /></label>`;
  } else {
    content.innerHTML = `<label class="exam-answer"><span>文字作答</span><textarea id="paperTextAnswer" placeholder="可输入文字，也可以使用下方触屏笔书写">${saved}</textarea></label>`;
  }
  $("#handwritingArea").classList.toggle("hidden", item.type !== "解答题");
}

function saveCurrentAnswer() {
  if (state.exam.mode !== "exam") return;
  const paper = activePaper();
  const item = paper.items.find(candidate => candidate.no === state.exam.currentNo);
  const choice = $('input[name="paperAnswer"]:checked');
  const text = $("#paperTextAnswer");
  const value = choice?.value || text?.value.trim() || "";
  state.exam.answers[paper.id] ||= {};
  state.exam.answers[paper.id][item.no] = { value, savedAt: Date.now() };
  const answered = Object.values(state.exam.answers[paper.id]).filter(answer => answer.value).length;
  paper.progress = Math.round(answered / paper.questions * 100);
  item.status = value ? "已答" : "未答";
  persistExamState();
  $("#autoSaveStatus").textContent = `已保存 ${new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`;
}

function showPaperStart(paperId) {
  state.activePaperId = paperId;
  const paper = activePaper();
  if (state.exam.submitted[paper.id] && !state.exam.submitted[paper.id].returned) {
    showPaperResult(paper.id);
    return;
  }
  $("#modalEyebrow").textContent = "考试须知";
  $("#modalTitle").textContent = paper.title;
  $("#modalBody").innerHTML = `
    <div class="exam-brief">
      <div><strong>${paper.questions}</strong><span>题目</span></div>
      <div><strong>${paper.score}</strong><span>总分</span></div>
      <div><strong>${paper.duration}</strong><span>分钟</span></div>
    </div>
    <div class="notice-list">
      <p>答题过程中自动保存，刷新页面后可继续。</p>
      <p>客观题交卷后自动判分，主观题进入老师批改队列。</p>
      <p>支持键盘输入和触屏笔手写；交卷前可通过题卡检查漏题。</p>
    </div>`;
  $("#modalFoot").innerHTML = `<button class="ghost" id="cancelModal">取消</button><button class="primary" id="confirmStartPaper">${paper.progress ? "继续答题" : "开始答题"}</button>`;
  $("#modalBackdrop").classList.remove("hidden");
  $("#cancelModal").addEventListener("click", closeModal);
  $("#confirmStartPaper").addEventListener("click", () => {
    closeModal();
    startPaper(paper.id);
  });
}

function selectPaperQuestion(no) {
  saveCurrentAnswer();
  state.exam.currentNo = Number(no);
  renderPaperQuestionNav();
  $("#paperExamView").scrollIntoView({ behavior: "smooth", block: "start" });
}

function startPaper(paperId) {
  state.activePaperId = paperId;
  state.exam.mode = "exam";
  const paper = activePaper();
  const saved = state.exam.answers[paper.id] || {};
  state.exam.currentNo = paper.items.find(item => !saved[item.no]?.value)?.no || 1;
  state.exam.startedAt ||= Date.now();
  state.exam.endsAt = Date.now() + paper.duration * 60 * 1000;
  $("#paperLibraryView").classList.add("hidden");
  $("#paperExamView").classList.remove("hidden");
  $("#studentExamSide").classList.remove("hidden");
  $(".back").classList.remove("hidden");
  $("#examClockWrap").classList.remove("hidden");
  $(".student-body").classList.add("exam-active");
  renderPaperQuestionNav();
  startExamClock();
}

function startExamClock() {
  window.clearInterval(state.examTimer);
  const tick = () => {
    const remain = Math.max(0, state.exam.endsAt - Date.now());
    const minutes = Math.floor(remain / 60000);
    const seconds = Math.floor(remain % 60000 / 1000);
    $("#examClock").textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    if (!remain) submitCurrentPaper(true);
  };
  tick();
  state.examTimer = window.setInterval(tick, 1000);
}

function submitCurrentPaper(auto = false, confirmed = false) {
  saveCurrentAnswer();
  const paper = activePaper();
  const answers = state.exam.answers[paper.id] || {};
  const unanswered = paper.items.filter(item => !answers[item.no]?.value).length;
  if (!auto && unanswered && !confirmed) {
    $("#modalEyebrow").textContent = "交卷确认";
    $("#modalTitle").textContent = `还有 ${unanswered} 题未作答`;
    $("#modalBody").innerHTML = `
      <div class="notice-list">
        <p>交卷后不能继续修改答案。</p>
        <p>客观题将立即判分，主观题会进入老师批改队列。</p>
      </div>`;
    $("#modalFoot").innerHTML = `<button class="ghost" id="cancelModal">继续检查</button><button class="primary" id="confirmSubmitPaper">确认交卷</button>`;
    $("#modalBackdrop").classList.remove("hidden");
    $("#cancelModal").addEventListener("click", closeModal);
    $("#confirmSubmitPaper").addEventListener("click", () => {
      closeModal();
      submitCurrentPaper(false, true);
    });
    return;
  }
  let score = 0;
  let objectiveTotal = 0;
  paper.items.forEach(item => {
    if (item.type === "解答题") return;
    objectiveTotal += item.score;
    if (String(answers[item.no]?.value || "").trim() === String(item.answer).trim()) score += item.score;
  });
  state.exam.submitted[paper.id] = {
    score,
    objectiveTotal,
    submittedAt: Date.now(),
    unanswered,
    pendingManual: paper.items.filter(item => item.type === "解答题").length
  };
  paper.progress = 100;
  persistExamState();
  renderStudentAssignments();
  window.clearInterval(state.examTimer);
  showPaperResult(paper.id);
}

function showPaperResult(paperId) {
  const paper = state.papers.find(item => item.id === paperId);
  const result = state.exam.submitted[paperId];
  $("#modalEyebrow").textContent = "交卷结果";
  $("#modalTitle").textContent = paper.title;
  $("#modalBody").innerHTML = `
    <div class="result-score"><strong>${result.finalScore ?? result.score}</strong><span>${result.finalScore !== undefined ? `/ ${paper.score} 最终成绩` : `/ ${result.objectiveTotal} 客观题得分`}</span></div>
    <div class="student-summary">
      <div><strong>${paper.questions - result.unanswered}</strong><span>已作答</span></div>
      <div><strong>${result.unanswered}</strong><span>未作答</span></div>
      <div><strong>${result.pendingManual}</strong><span>${result.pendingManual ? "待老师批改" : "批改完成"}</span></div>
    </div>
    <p class="result-note">${result.feedback ? `老师评语：${result.feedback}` : "客观题已自动判分；主观题批改完成后将生成最终成绩、解析和错题本。"}</p>`;
  $("#modalFoot").innerHTML = `<button class="ghost" id="returnPaperLibrary">返回试卷库</button><button class="primary" id="reviewPaper">查看答题卡</button>`;
  $("#modalBackdrop").classList.remove("hidden");
  $("#returnPaperLibrary").addEventListener("click", () => {
    closeModal();
    exitPaper();
  });
  $("#reviewPaper").addEventListener("click", () => {
    closeModal();
    startPaper(paperId);
  });
}

function openSubmission(paperId) {
  const paper = state.papers.find(item => item.id === paperId);
  const result = state.exam.submitted[paperId];
  const answers = state.exam.answers[paperId] || {};
  const subjective = paper.items.filter(item => item.type === "解答题");
  $("#modalEyebrow").textContent = "主观题批改";
  $("#modalTitle").textContent = `${paper.title} · 王子涵`;
  $("#modalBody").innerHTML = `
    <div class="submission-list">
      ${subjective.map(item => `<article>
        <strong>第 ${item.no} 题 · ${item.score} 分</strong>
        <p>${item.title}</p>
        <div class="student-answer">${answers[item.no]?.value || "学生未作答"}</div>
      </article>`).join("")}
    </div>
    <div class="form-grid">
      <label class="field"><span>主观题得分</span><input id="manualScore" type="number" min="0" max="${paper.score - result.objectiveTotal}" value="${result.manualScore || 0}" /></label>
      <label class="field full"><span>老师评语</span><textarea id="gradingFeedback">${result.feedback || "请补充关键推理步骤，注意书写完整。"}</textarea></label>
    </div>`;
  $("#modalFoot").innerHTML = `<button class="ghost" id="cancelModal">取消</button><button class="ghost" id="returnSubmission">退回修改</button><button class="primary" id="confirmGradeSubmission">提交并返回学生</button>`;
  $("#modalBackdrop").classList.remove("hidden");
  $("#cancelModal").addEventListener("click", closeModal);
  $("#returnSubmission").addEventListener("click", () => {
    result.feedback = $("#gradingFeedback").value.trim() || "请补充解题过程后重新提交。";
    result.returned = true;
    result.pendingManual = subjective.length;
    persistExamState();
    renderStudentAssignments();
    closeModal();
    switchSection("grading");
    toast("答卷已退回学生修改");
  });
  $("#confirmGradeSubmission").addEventListener("click", () => {
    result.manualScore = Math.max(0, Number($("#manualScore").value) || 0);
    result.finalScore = result.score + result.manualScore;
    result.feedback = $("#gradingFeedback").value.trim();
    result.pendingManual = 0;
    result.returned = false;
    result.gradedAt = Date.now();
    persistExamState();
    closeModal();
    switchSection("grading");
    toast(`批改已提交，最终成绩 ${result.finalScore} 分`);
  });
}

function exitPaper() {
  saveCurrentAnswer();
  state.exam.mode = "library";
  window.clearInterval(state.examTimer);
  $("#paperLibraryView").classList.remove("hidden");
  $("#paperExamView").classList.add("hidden");
  $("#studentExamSide").classList.add("hidden");
  $(".back").classList.add("hidden");
  $("#examClockWrap").classList.add("hidden");
  $(".student-body").classList.remove("exam-active");
  renderStudentPapers();
}

function sectionTemplate(type) {
  const templates = {
    org: orgPage,
    bank: bankPage,
    homework: homeworkPage,
    grading: gradingPage,
    video: videoPage,
    analytics: analyticsPage,
    admin: adminPage
  };
  return templates[type] ? templates[type]() : "";
}

function roleWorkspacePage() {
  if (state.role === "admin") {
    return `
      <section class="flow-home admin-flow">
        <article class="flow-hero">
          <div>
            <p>管理员工作台 · 光明中学</p>
            <h2>先把学校、账号和权限边界配置清楚</h2>
            <span>当前原型只保留 1 名管理员、1 名老师、1 名学生，方便完整跑通流程。</span>
          </div>
          <button class="primary small" data-section-jump="admin">进入后台管理</button>
        </article>
        <div class="flow-steps">
          <button class="step-card" data-section-jump="org"><em>01</em><strong>组织结构</strong><span>光明中学 / 初三(1)班 / 1 名学生</span></button>
          <button class="step-card" data-section-jump="admin"><em>02</em><strong>账号角色</strong><span>管理员、老师、学生各 1 个账号</span></button>
          <button class="step-card" data-section-jump="admin"><em>03</em><strong>登录与 SSO</strong><span>手机验证码、密码、登录状态记忆</span></button>
        </div>
        <article class="panel wide">
          <div class="panel-head"><div><p>最小可运行数据</p><h2>角色与权限边界</h2></div></div>
          <table class="compact-table modern-table">
            <thead><tr><th>账号</th><th>角色</th><th>可见范围</th><th>登录手机号</th><th>状态</th></tr></thead>
            <tbody>
              <tr><td>赵管理员</td><td>管理员</td><td>学校、账号、权限</td><td>13700000000</td><td><span class="student-status">启用</span></td></tr>
              <tr><td>张老师</td><td>教师</td><td>初三(1)班、作业、批改、分析</td><td>13800000000</td><td><span class="student-status">启用</span></td></tr>
              <tr><td>王子涵</td><td>学生</td><td>自己的作业、答卷、反馈</td><td>13900000000</td><td><span class="student-status">启用</span></td></tr>
            </tbody>
          </table>
        </article>
      </section>
    `;
  }
  if (state.role === "teacher") {
    const classes = visibleClasses();
    const firstAssignment = state.assignments[0];
    const paper = state.papers.find(item => item.id === firstAssignment.paperId) || state.papers[0];
    const submitted = state.exam.submitted[paper.id];
    return `
      <section class="flow-home teacher-flow">
        <article class="flow-hero">
          <div>
            <p>老师工作台 · ${currentProfile().scope}</p>
            <h2>按真实教学流程完成一次发布与批改</h2>
            <span>不再单独放题库和学生班级入口，老师从这里进入完整闭环。</span>
          </div>
          <div class="flow-actions">
            <button class="ghost small" data-ai-scene="workspace">AI 分析流程</button>
            <button class="primary small" data-section-jump="bank">进入 AI 题库</button>
          </div>
        </article>
        <div class="flow-steps">
          <button class="step-card" data-section-jump="bank"><em>01</em><strong>AI 题库备课</strong><span>搜真题、生成题目、导入整卷、自动组卷都从这里开始</span></button>
          <button class="step-card" data-section-jump="homework"><em>02</em><strong>发布作业/测验/考试</strong><span>发布整套试卷，或挑选其中某几道题发布</span></button>
          <button class="step-card" data-section-jump="grading"><em>03</em><strong>批改与反馈</strong><span>查看学生答卷、批改主观题、返回评语</span></button>
        </div>
        <div class="flow-kpis">
          <button data-section-jump="homework"><span>当前作业</span><strong>1</strong><em>${firstAssignment.title}</em></button>
          <button data-section-jump="analytics"><span>学生</span><strong>${classes.reduce((sum, item) => sum + item.count, 0)}</strong><em>${classes.map(item => item.name).join(" / ")}</em></button>
          <button data-section-jump="grading"><span>提交状态</span><strong>${submitted ? "已交" : "待交"}</strong><em>${submitted ? "可进入批改" : "等待学生答题"}</em></button>
          <button data-section-jump="analytics"><span>薄弱点</span><strong>欧姆定律</strong><em>建议追加 3 道巩固题</em></button>
        </div>
        <div class="flow-main-grid">
          <article class="panel wide">
            <div class="panel-head"><div><p>发布内容</p><h2>${paper.title}</h2></div><button class="ghost small" data-section-jump="homework">查看发布页</button></div>
            <table class="compact-table modern-table">
              <thead><tr><th>题号</th><th>题型</th><th>题目</th><th>分值</th></tr></thead>
              <tbody>${paper.items.map(item => `<tr><td>${item.no}</td><td>${item.type}</td><td>${item.title}</td><td>${item.score}</td></tr>`).join("")}</tbody>
            </table>
          </article>
          <article class="panel">
            <div class="panel-head"><div><p>学生进度</p><h2>王子涵</h2></div><button class="ghost small" data-section-jump="grading">查看答卷</button></div>
            <div class="info-list">
              <div class="info-row"><strong>${submitted ? submitted.finalScore || submitted.score : "--"} 分</strong><span>${submitted ? "学生已提交，等待老师确认主观题" : "学生还未提交"}</span></div>
              <div class="info-row"><strong>欧姆定律</strong><span>系统识别为本次薄弱点</span></div>
              <div class="info-row"><strong>讲题视频</strong><span>已关联电学计算真题讲解</span></div>
            </div>
          </article>
        </div>
      </section>
    `;
  }
  return state.defaultWorkspaceHtml;
}

function pageShell(eyebrow, title, action, body) {
  return `
    <div class="toolbar-line">
      <div>
        <p class="muted">${eyebrow}</p>
        <h2 style="margin:4px 0 0">${title}</h2>
      </div>
      <div class="page-actions">${action || ""}</div>
    </div>
    ${body}
  `;
}

function initTeacherDashboardCharts() {
  if (state.role !== "teacher" || state.section !== "workspace") return;
  const chartIds = ["teacherScoreChart", "teacherMasteryChart", "teacherSubmitChart"];
  if (!chartIds.every(id => document.getElementById(id))) return;
  if (!window.echarts) {
    renderTeacherChartFallbacks();
    return;
  }
  state.teacherCharts?.forEach(chart => chart.dispose());
  state.teacherCharts = [];
  chartIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = "";
  });
  const colors = ["#0f8a68", "#4c9ad4", "#f2b84b", "#e06b6b"];
  const scoreChart = echarts.init(document.getElementById("teacherScoreChart"));
  scoreChart.setOption({
    color: colors,
    grid: { left: 36, right: 18, top: 28, bottom: 30 },
    tooltip: { trigger: "axis" },
    xAxis: { type: "category", data: ["作业1", "周测", "作业2", "单元测", "作业3", "本周"], axisTick: { show: false } },
    yAxis: { type: "value", min: 60, max: 100, splitLine: { lineStyle: { color: "#edf2ef" } } },
    series: [
      { name: "初三(1)班", type: "line", smooth: true, symbolSize: 7, data: [78, 81, 83, 80, 86, 88], areaStyle: { opacity: 0.08 } },
      { name: "王子涵", type: "line", smooth: true, symbolSize: 7, data: [58, 62, 66, 68, 70, 72], areaStyle: { opacity: 0.06 } }
    ]
  });
  const masteryChart = echarts.init(document.getElementById("teacherMasteryChart"));
  masteryChart.setOption({
    color: colors,
    tooltip: {},
    radar: {
      radius: "66%",
      indicator: [
        { name: "一元二次", max: 100 },
        { name: "二次函数", max: 100 },
        { name: "相似三角形", max: 100 },
        { name: "勾股定理", max: 100 },
        { name: "圆", max: 100 }
      ]
    },
    series: [{ type: "radar", data: [{ value: [86, 62, 48, 78, 55], name: "掌握率", areaStyle: { opacity: 0.18 } }] }]
  });
  const submitChart = echarts.init(document.getElementById("teacherSubmitChart"));
  submitChart.setOption({
    color: ["#0f8a68", "#f2b84b", "#e06b6b"],
    tooltip: { trigger: "item" },
    series: [{
      type: "pie",
      radius: ["58%", "78%"],
      avoidLabelOverlap: true,
      label: { formatter: "{b}\\n{c}人" },
      data: [
        { value: 83, name: "已提交" },
        { value: 8, name: "未提交" },
        { value: 12, name: "待批" }
      ]
    }]
  });
  state.teacherCharts = [scoreChart, masteryChart, submitChart];
  window.clearTimeout(state.teacherChartResizeTimer);
  state.teacherChartResizeTimer = window.setTimeout(() => {
    state.teacherCharts?.forEach(chart => chart.resize());
    const anyBlank = chartIds.some(id => {
      const el = document.getElementById(id);
      return el && !el.querySelector("canvas");
    });
    if (anyBlank) renderTeacherChartFallbacks();
  }, 60);
  window.setTimeout(() => state.teacherCharts?.forEach(chart => chart.resize()), 300);
}

function renderTeacherChartFallbacks() {
  const scoreEl = $("#teacherScoreChart");
  const masteryEl = $("#teacherMasteryChart");
  const submitEl = $("#teacherSubmitChart");
  if (scoreEl) scoreEl.innerHTML = teacherChartFallbackHtml("score");
  if (masteryEl) masteryEl.innerHTML = teacherChartFallbackHtml("mastery");
  if (submitEl) submitEl.innerHTML = teacherChartFallbackHtml("submit");
}

function teacherChartFallbackHtml(type) {
  if (type === "score") {
    return `
      <div class="fallback-line-chart">
        <svg viewBox="0 0 520 220" role="img" aria-label="近 6 次成绩趋势">
          <g class="grid-lines"><line x1="40" y1="35" x2="500" y2="35"/><line x1="40" y1="90" x2="500" y2="90"/><line x1="40" y1="145" x2="500" y2="145"/><line x1="40" y1="200" x2="500" y2="200"/></g>
          <polyline class="line a" points="40,155 132,132 224,118 316,138 408,85 500,70"/>
          <polyline class="line b" points="40,178 132,160 224,142 316,110 408,98 500,84"/>
          <g class="dots"><circle cx="500" cy="70" r="5"/><circle cx="500" cy="84" r="5"/></g>
        </svg>
        <div class="chart-legend"><span><i></i>初三(1)班均分 72</span><span><i class="blue"></i>王子涵 72</span></div>
      </div>`;
  }
  if (type === "mastery") {
    const rows = [["一元二次", 86], ["二次函数", 62], ["相似三角形", 48], ["勾股定理", 78], ["圆", 55]];
    return `<div class="fallback-bars">${rows.map(([name, value]) => `
      <div><span>${name}</span><b><i style="width:${value}%"></i></b><em>${value}%</em></div>
    `).join("")}</div>`;
  }
  if (type === "submit") {
    return `
      <div class="fallback-donut">
        <svg viewBox="0 0 180 180" role="img" aria-label="提交分布">
          <circle cx="90" cy="90" r="62" class="donut-bg"/>
          <circle cx="90" cy="90" r="62" class="donut-submit"/>
          <circle cx="90" cy="90" r="62" class="donut-wait"/>
        </svg>
        <div class="donut-center"><strong>91%</strong><span>完成率</span></div>
        <div class="chart-legend stacked"><span><i></i>已提交 83</span><span><i class="yellow"></i>未提交 8</span><span><i class="red"></i>待批 12</span></div>
      </div>`;
  }
  return "";
}

function orgPage() {
  const classes = visibleClasses();
  const studentRows = visibleClassStudents().map(student => `
    <tr>
      <td><strong>${student.name}</strong><small>${student.studentNo}</small></td>
      <td>${student.className}</td>
      <td>${student.phone}</td>
      <td>${student.parentPhone}</td>
      <td><strong>${student.score}</strong></td>
      <td><div class="progress" aria-label="${student.completion}%"><i style="width:${student.completion}%"></i></div><small>${student.completion}%</small></td>
      <td><span class="student-status ${student.risk === "高风险" ? "risk" : student.risk === "需关注" ? "watch" : ""}">${student.risk}</span></td>
      <td>${student.account}</td>
      <td><button class="ghost small" data-student-detail="${student.id}">画像</button></td>
    </tr>
  `).join("");
  return pageShell(state.role === "teacher" ? "我的班级 / 学生 / 权限边界" : "组织架构 / 班级 / 人员", state.role === "teacher" ? "我的班级管理" : "组织与班级管理",
    `<button class="primary small" data-modal="class">新增学生/班级</button> <button class="ghost small" data-modal="import">导入学生名单</button>`,
    `<div class="class-management">
      <article class="panel class-side">
        <div class="panel-head"><div><p>授权范围</p><h2>我的班级</h2></div></div>
        <div class="class-card-list">
          ${classes.map(item => `
            <button type="button" data-open-class="${item.name}">
              <strong>${item.name}</strong>
              <span>${item.count} 名学生 · 完成率 ${item.rate}%</span>
              <i style="width:${item.rate}%"></i>
            </button>
          `).join("")}
        </div>
      </article>
      <article class="panel class-main">
        <div class="panel-head"><div><p>学生列表</p><h2>${visibleClassStudents().length} 名学生信息</h2></div><div class="table-tools compact-tools"><input id="studentListSearch" placeholder="搜索学生姓名、学号、手机号" /><select><option>全部班级</option>${classes.map(item => `<option>${item.name}</option>`).join("")}</select><select><option>全部状态</option><option>正常</option><option>需关注</option><option>高风险</option><option>待激活</option></select></div></div>
        <table class="compact-table modern-table student-table">
          <thead><tr><th>学生</th><th>班级</th><th>手机号</th><th>家长电话</th><th>最近成绩</th><th>完成率</th><th>风险</th><th>账号</th><th>操作</th></tr></thead>
          <tbody id="studentRows">${studentRows}</tbody>
        </table>
      </article>
    </div>`
  );
}

function bankPage() {
  const view = state.bankView || "questions";
  const tabs = [
    ["questions", "题目"],
    ["papers", "试卷"],
    ["videos", "讲解视频"]
  ];
  const all = visibleQuestions();
  const publicQuestions = all.filter(item => item.visibility === "public");
  const teacherQuestions = all.filter(item => item.visibility === "teacher" && item.owner === currentProfile().name);
  const visiblePapers = state.papers.filter(canViewBankAsset);
  const publicPapers = visiblePapers.filter(paper => (paper.visibility || "public") === "public");
  const teacherPapers = visiblePapers.filter(paper => paper.visibility === "teacher");
  const visibleVideos = state.videos.filter(item => state.role !== "teacher" || !item.owner || item.owner === currentProfile().name);

  const aiPlaceholder = {
    questions: "例如：帮我生成 6 道初三物理欧姆定律中档题，含答案解析，保存到张老师私人库",
    papers: "例如：从网上找 2025 大连中考物理真题，导入为整套试卷，题目同步录入题目库并标明来源",
    videos: "例如：根据 2025 大连中考物理卷第 6 题，生成 8 分钟讲解视频脚本和知识点标签"
  }[view];

  const aiComposer = `
    <section class="bank-ai-console">
      <div class="bank-ai-composer" data-ai-ready="true">
        <textarea id="bankAiPrompt" rows="4" placeholder="${aiPlaceholder}"></textarea>
        <div class="bank-ai-composer-foot">
          <div class="bank-ai-left-tools">
            <span id="bankAiStatus">Enter 发送 · Shift + Enter 换行</span>
          </div>
          <button class="composer-send" id="bankAiSend" type="button" aria-label="发送给 AI" title="发送给 AI">↑</button>
        </div>
      </div>
    </section>`;

  const qRows = visibleQuestions().map((item, index) => {
    const realIndex = state.questions.indexOf(item);
    const editable = canOperateBankAsset(item);
    const status = questionStatus(item);
    const actionButtons = editable
      ? `<button class="ghost small" data-edit-question="${realIndex}">编辑</button> <button class="ghost small" data-question-access="${realIndex}">可见范围</button> ${item.owner === currentProfile().name ? `<button class="ghost small" data-delete-question="${realIndex}">删除</button>` : ""}`
      : `<button class="ghost small" data-edit-question="${realIndex}">查看</button>`;
    return `
    <tr>
      <td>
        <div class="question-title-cell">
          <strong>${item.title}</strong>
          <span>${item.origin || "题目"} · ${item.source || "未标注来源"} · ${bankAssetScopeText(item)}</span>
        </div>
      </td>
      <td><span class="type-pill">${item.type}</span></td>
      <td>${item.point}</td>
      <td>${bankAssetScopeText(item)}</td>
      <td>${item.source}</td>
      <td><span class="bank-status ${item.visibility}">${status}</span></td>
      <td>${actionButtons}</td>
    </tr>
  `;
  }).join("");

  const paperCards = visiblePapers.map(paper => `
    <article class="paper-asset-card">
      <div><span>${paper.exam}</span><b>${paper.subject}</b></div>
      <strong>${paper.title}</strong>
      <small>${paper.region} · ${paper.year} · ${paper.questions} 题 · ${paper.score} 分 · ${paper.duration} 分钟</small>
      <small>${bankAssetScopeText(paper)} · ${paper.source || "来源未标注"}</small>
      <footer>
        <em>${paper.sections.join(" / ")}</em>
        <span class="paper-asset-actions">
          <button class="ghost small" data-view-paper="${paper.id}">查看试卷</button>
          ${canOperateBankAsset(paper) && paper.visibility === "teacher" ? `<button class="ghost small" data-paper-access="${paper.id}">可见范围</button>` : ""}
        </span>
      </footer>
    </article>
  `).join("");

  const videoCards = visibleVideos.map((item, index) => `
    <article class="video-library-card">
      <div>
        <strong>${item.name}</strong>
        <span>${item.owner || currentProfile().name} · ${item.source || "老师上传"} · ${item.point || "未绑定知识点"}</span>
      </div>
      <small>${item.paperTitle || "未关联试卷"} · ${item.size} · ${item.status}</small>
      <div class="progress"><i style="width:${item.progress}%"></i></div>
      <footer><button class="ghost small" data-video-action="${index}">编辑关联</button><button class="ghost small" data-delete-video="${index}">删除</button></footer>
    </article>
  `).join("");

  const body = view === "papers" ? `
    ${aiComposer}
    <article class="panel bank-paper-panel">
      <div class="panel-head"><div><p>试卷库</p><h2>整套试卷导入、AI 联网导入、考试样式预览</h2></div><button class="ghost small" data-modal="webImportPaper">导入试卷</button></div>
      <div class="paper-asset-grid">${paperCards}</div>
    </article>` : view === "videos" ? `
    ${aiComposer}
    <article class="panel bank-video-panel">
      <div class="panel-head"><div><p>讲解视频库</p><h2>按老师、试卷、知识点管理</h2></div><button class="primary small" data-modal="video">上传视频</button></div>
      <div class="video-library-grid">${videoCards}</div>
    </article>` : `
    ${aiComposer}
    <article class="panel bank-main">
      <div class="bank-panel-head">
        <div><p>题目库</p><h2>题目来源必须清楚：手写、AI 生成或来自某套试卷</h2></div>
        <button class="primary small" data-modal="question">自己编写题目</button>
      </div>
      <div class="bank-table-shell">
        <div class="table-toolbar">
          <label class="table-search"><span>⌕</span><input id="bankQuestionSearch" placeholder="搜索题干、知识点、来源" /></label>
          <div class="table-filter-group">
            <select id="bankTypeFilter"><option>全部题型</option><option>单选题</option><option>填空题</option><option>解答题</option></select>
            <select id="bankScopeFilter"><option>全部库</option><option>公共库</option><option>老师私人库</option><option>共享给我</option></select>
          </div>
        </div>
        <div class="subnav bank-tabs"><button class="active">全部</button><button>公共库</button><button>张老师私人库</button><button>AI 生成</button><button>试卷导入</button></div>
        <table class="compact-table modern-table bank-table">
          <thead>
            <tr>
              <th>题目 <button class="table-head-icon" title="按题目排序">↕</button></th>
              <th>题型 <button class="table-head-icon" title="筛选题型">▾</button></th>
              <th>知识点 <button class="table-head-icon" title="筛选知识点">▾</button></th>
              <th>库 <button class="table-head-icon" title="筛选库">▾</button></th>
              <th>来源 <button class="table-head-icon" title="筛选来源">▾</button></th>
              <th>状态 <button class="table-head-icon" title="筛选状态">▾</button></th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody id="bankQuestionRows">${qRows}</tbody>
        </table>
      </div>
    </article>`;

  return pageShell("题目 / 试卷 / 讲解视频", "题库管理",
    "",
    `<div class="bank-module">
      <div class="bank-page single">${body}</div>
    </div>`
  );
}

function homeworkPage() {
  const classes = visibleClasses();
  const questionRows = visibleQuestions().map((item, index) => `
    <tr>
      <td><input type="checkbox" ${index < state.selectedQuestions ? "checked" : ""} data-question-index="${index}" /></td>
      <td>${item.title}</td>
      <td>${item.type}</td>
      <td>${item.point}</td>
      <td>${item.source}</td>
      <td>${questionStatus(item)}</td>
    </tr>
  `).join("");
  return pageShell("发布中心", "发布作业、测验或考试",
    `<div class="page-actions"><button class="ghost small" data-modal="question">新增题目</button><button class="primary small" id="publishFromPage">确认发布</button></div>`,
    `<div class="publish-page">
      <article class="publish-hero">
        <div>
          <p>只可发布到授权班级</p>
          <h2>从整卷、题库或临时题快速发布</h2>
        </div>
        <div class="publish-steps"><span class="active">1 设置</span><span>2 选内容</span><span>3 发布</span></div>
      </article>

      <section class="publish-layout">
        <article class="panel publish-card">
          <div class="panel-head"><div><p>发布信息</p><h2>对象与规则</h2></div></div>
          <div class="publish-grid compact">
            <label class="field"><span>类型</span><select id="publishKind"><option>作业</option><option>测验</option><option>考试</option></select></label>
            <label class="field"><span>班级</span><select id="homeworkClass">${classOptions()}</select></label>
            <label class="field full"><span>标题</span><input id="homeworkTitle" value="二次函数综合练习" /></label>
            <label class="field full"><span>截止时间</span><input id="homeworkDeadline" type="datetime-local" value="2026-07-01T22:00" /></label>
            <label class="field full"><span>答题限制</span><select id="publishLimit"><option>不限时，允许重做</option><option>45 分钟，不允许重做</option><option>90 分钟，交卷后统一出分</option></select></label>
          </div>
          <div class="publish-rules clean">
            <label><input type="checkbox" checked /> 触屏笔手写过程</label>
            <label><input type="checkbox" checked /> 批改后显示解析</label>
            <label><input type="checkbox" checked /> 自动进入错题本</label>
            <label><input type="checkbox" /> 通知家长端</label>
          </div>
        </article>

        <article class="panel publish-card span-2">
          <div class="panel-head"><div><p>内容来源</p><h2>整卷发布或题库选题</h2></div><span id="selectedCount" class="pill">已选 ${state.selectedQuestions} 题</span></div>
          <div class="publish-mode refined">
            <label class="mode-card"><input type="radio" name="publishMode" value="paper" checked /> <strong>整卷发布</strong><span>选择一张公共试卷，学生按整卷答题。</span></label>
            <label class="mode-card"><input type="radio" name="publishMode" value="questions" /> <strong>题库选题</strong><span>从公共题库、教师题库中自由勾选。</span></label>
            <label class="mode-card"><input type="radio" name="publishMode" value="new" /> <strong>临时新增题</strong><span>可选择是否沉淀到教师题库。</span></label>
          </div>
          <div class="paper-choice-list">
            ${state.papers.map((paper, index) => `<label class="paper-choice">
              <input type="radio" name="homeworkPaperRadio" value="${paper.id}" ${paper.id === state.activePaperId || (!state.activePaperId && index === 0) ? "checked" : ""} />
              <span><strong>${paper.title}</strong><small>${paper.exam} · ${paper.questions} 题 · ${paper.score} 分 · ${paper.duration} 分钟</small></span>
              <b>整卷</b>
            </label>`).join("")}
          </div>
        </article>
      </section>

      <section class="panel question-picker">
        <div class="panel-head"><div><p>题库选题</p><h2>搜索题目并加入本次发布</h2></div><button class="ghost small" data-modal="question">新增题目</button></div>
        <div class="table-tools refined"><input id="questionFilter" placeholder="搜索题干、知识点、来源" /><select><option>全部来源</option><option>公共真题库</option><option>教师题库</option><option>学生练习库</option></select><select><option>全部题型</option><option>单选题</option><option>填空题</option><option>解答题</option></select></div>
        <table class="compact-table modern-table"><thead><tr><th>选</th><th>题目</th><th>题型</th><th>知识点</th><th>来源</th><th>状态</th></tr></thead><tbody id="homeworkRows">${questionRows}</tbody></table>
      </section>

      <section class="panel publish-records">
        <div class="panel-head"><div><p>发布记录</p><h2>我发布的作业、测验和考试</h2></div></div>
        <table class="compact-table modern-table">
          <thead><tr><th>名称</th><th>类型</th><th>班级</th><th>内容</th><th>截止时间</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>${state.assignments.filter(item => classes.some(cls => cls.name === item.className)).map(item => {
            const paper = state.papers.find(p => p.id === item.paperId) || state.papers[0];
            const submitted = Boolean(state.exam.submitted[item.paperId]);
            return `<tr><td>${item.title}</td><td>${item.kind || "作业"}</td><td>${item.className}</td><td>${item.mode === "questions" ? `${item.questionCount || state.selectedQuestions} 道题` : paper.title}</td><td>${item.deadline.replace("T", " ")}</td><td>${submitted ? "待批改" : item.status}</td><td><button class="ghost small" data-section-jump="${submitted ? "grading" : "homework"}">${submitted ? "去批改" : "查看进度"}</button></td></tr>`;
          }).join("")}</tbody>
        </table>
      </section>
    </div>`
  );
}

function publishAssignmentFromPage() {
  const title = $("#homeworkTitle")?.value.trim();
  const className = $("#homeworkClass")?.value;
  const kind = $("#publishKind")?.value || "作业";
  const mode = $("input[name='publishMode']:checked")?.value || "paper";
  const paperId = $("input[name='homeworkPaperRadio']:checked")?.value || state.papers[0].id;
  const selected = $$("[data-question-index]").filter(input => input.checked).length;
  if (!title) {
    toast("请输入发布标题");
    return;
  }
  if (!className) {
    toast("当前没有可发布的授权班级");
    return;
  }
  if (mode === "questions" && selected === 0) {
    toast("请至少选择一道题");
    return;
  }
  state.assignments.unshift({
    id: `hw-${Date.now()}`,
    title,
    kind,
    mode,
    paperId,
    questionCount: mode === "questions" ? selected : 0,
    className,
    deadline: $("#homeworkDeadline")?.value || "2026-07-01T22:00",
    status: "进行中",
    createdAt: Date.now()
  });
  persistExamState();
  renderStudentAssignments();
  switchSection("homework");
  toast(`${kind}“${title}”已发布到 ${className}`);
}

function updateBankAiStatus(message, busy = state.aiBusy) {
  const composer = $("#bankAiPrompt")?.closest(".bank-ai-composer");
  const prompt = $("#bankAiPrompt");
  const button = $("#bankAiSend");
  const more = $("#bankAiMore");
  const status = $("#bankAiStatus");
  if (composer) composer.classList.toggle("busy", busy);
  if (prompt) prompt.disabled = busy;
  if (button) {
    button.disabled = busy;
    button.textContent = busy ? "…" : "↑";
  }
  if (more) more.disabled = busy;
  if (status) status.textContent = message;
}

const bankAiModeLabels = {
  auto: "自动判断",
  web: "搜真题/网页",
  import: "导入整卷",
  generate: "生成题目",
  assemble: "自动组卷"
};

function setBankAiMode(mode = "auto") {
  state.aiMode = bankAiModeLabels[mode] ? mode : "auto";
  const selected = $("#bankAiSelected");
  if (selected) selected.textContent = `当前类型：${bankAiModeLabels[state.aiMode]}`;
  $$("#bankAiMenu [data-bank-ai-mode]").forEach(item => {
    item.classList.toggle("active", item.dataset.bankAiMode === state.aiMode);
  });
}

function parseSmartIntent(query) {
  const yearMatch = query.match(/20\d{2}/);
  const subject = query.includes("物理") ? "物理" : query.includes("语文") ? "语文" : query.includes("英语") ? "英语" : query.includes("化学") ? "化学" : "数学";
  return {
    isGenerate: /生成|出题|新增题|题目/.test(query) && !/真题|试卷|卷/.test(query),
    isAssemble: /组卷|测验|考试|作业|一张/.test(query) && !/真题/.test(query),
    year: yearMatch ? Number(yearMatch[0]) : new Date().getFullYear(),
    subject,
    region: query.match(/([\u4e00-\u9fa5]{2,4})(?:中考|高考|期末|真题)/)?.[1] || "本地",
    exam: query.includes("高考") ? "高考真题" : query.includes("期末") ? "期末真题" : query.includes("测验") ? "测验" : "中考真题"
  };
}

async function executeSmartAiRequest(query, sourceUrl = "", options = {}) {
  if (state.aiBusy) return;
  if (!query.trim()) {
    toast("请输入要交给 AI 处理的需求");
    return;
  }
  state.aiBusy = true;
  updateBankAiStatus("AI 正在理解需求...", true);
  try {
    const selectedMode = options.mode || state.aiMode || "auto";
    if (selectedMode === "video") {
      const title = query.slice(0, 28) || "AI 讲解视频脚本";
      state.videos.unshift({
        name: `${title}.mp4`,
        size: "脚本待录制",
        progress: 0,
        status: "脚本草稿",
        owner: currentProfile().name,
        source: "AI 生成脚本",
        paperTitle: activePaper()?.title || "未关联试卷",
        point: state.knowledge[0]?.name || "综合讲解"
      });
      persistExamState();
      toast("AI 已生成讲解视频脚本草稿，可继续上传成片");
      return;
    }
    const intent = parseSmartIntent(query);
    if (selectedMode === "generate") {
      intent.isGenerate = true;
      intent.isAssemble = false;
    }
    if (selectedMode === "assemble") {
      intent.isGenerate = false;
      intent.isAssemble = true;
    }
    if (selectedMode === "web" || selectedMode === "import") {
      intent.isGenerate = false;
      intent.isAssemble = false;
    }
    if (intent.isGenerate) {
      const point = query.match(/(?:道|个)?([\u4e00-\u9fa5]{2,12})(?:题|中档|基础|较难)/)?.[1] || "综合应用";
      const count = Number(query.match(/(\d+)\s*道/)?.[1]) || 6;
      updateBankAiStatus("DeepSeek 正在生成题目与解析...", true);
      const ai = await aiPost("/ai/generate-questions", {
        subject: intent.subject,
        knowledge_point: point,
        question_type: query.includes("解答") ? "解答题" : "单选题",
        difficulty: query.includes("较难") ? "较难" : query.includes("基础") ? "容易" : "中等",
        count,
        source_scope: "教师题库"
      });
      const generated = (ai.result.questions || []).map((item, index) => ({
        title: item.stem || `${point} AI 题目 ${index + 1}`,
        type: item.type || "单选题",
        point: (item.knowledge_points || [point])[0],
        source: "AI 生成",
        visibility: "teacher",
        owner: currentProfile().name,
        origin: "AI 生成",
        sharedWith: []
      }));
      if (!generated.length) throw new Error("DeepSeek 没有返回题目结构");
      state.questions.unshift(...generated);
      persistExamState();
      toast(`DeepSeek 已生成 ${generated.length} 道题`);
    } else if (intent.isAssemble) {
      const title = query.slice(0, 24) || "AI 智能组卷";
      updateBankAiStatus("DeepSeek 正在设计组卷蓝图...", true);
      const ai = await aiPost("/ai/assemble-paper", {
        title,
        subject: intent.subject,
        exam_type: query.includes("考试") ? "考试" : query.includes("作业") ? "作业" : "测验",
        knowledge_points: state.knowledge.map(item => item.name),
        question_count: Number(query.match(/(\d+)\s*道/)?.[1]) || 12,
        total_score: 100,
        difficulty_ratio: query.includes("较难") ? "易20% / 中50% / 难30%" : "易30% / 中50% / 难20%"
      });
      const blueprint = ai.result.blueprint || [];
      const paperInfo = ai.result.paper || {};
      state.papers.unshift({
        id: `smart-paper-${Date.now()}`,
        title: paperInfo.title || title,
        exam: paperInfo.exam_type || "AI测验",
        subject: paperInfo.subject || intent.subject,
        region: "校本",
        year: intent.year,
        duration: paperInfo.duration_minutes || Number(query.match(/(\d+)\s*分钟/)?.[1]) || 45,
        score: paperInfo.total_score || 100,
        questions: Number(query.match(/(\d+)\s*道/)?.[1]) || 12,
        progress: 0,
        difficulty: "AI分层",
        sections: blueprint.length ? blueprint.map(item => `${item.section || "题组"} ${item.count || 3}`) : ["选择题 6", "填空题 4", "解答题 2"],
        tags: ["DeepSeek组卷", "老师私人库", "待校对"],
        visibility: "teacher",
        owner: currentProfile().name,
        source: "AI 自动组卷",
        sharedWith: [],
        items: []
      });
      preparePapers();
      persistExamState();
      toast("DeepSeek 已生成组卷，可在发布中心整卷发布");
    } else {
      updateBankAiStatus("DeepSeek 正在检索并解析真题...", true);
      const ai = await aiPost("/ai/web-import-paper", {
        title: `${intent.year} ${intent.region}${intent.exam}${intent.subject}卷`,
        subject: intent.subject,
        exam_type: intent.exam,
        region: intent.region,
        year: intent.year,
        question_count: 24,
        total_score: 120,
        duration_minutes: 100,
        raw_text: "",
        query,
        source_url: sourceUrl
      });
      const aiQuestions = ai.result.questions || [];
      const aiPaper = ai.result.paper || {};
      if (!aiQuestions.length && !aiPaper.title) throw new Error("DeepSeek 没有返回可导入的试卷结构");
      const title = aiPaper.title || `${intent.year} ${intent.region}${intent.exam}${intent.subject}卷`;
      const paperItems = aiQuestions.map(aiQuestionToPaperItem);
      const importedPaper = {
        id: `web-paper-${Date.now()}`,
        title,
        exam: aiPaper.exam_type || intent.exam,
        subject: aiPaper.subject || intent.subject,
        region: aiPaper.region || intent.region,
        year: aiPaper.year || intent.year,
        duration: aiPaper.duration_minutes || 100,
        score: aiPaper.total_score || paperItems.reduce((sum, item) => sum + (Number(item.score) || 0), 0) || 120,
        questions: Math.max(1, paperItems.length || 24),
        progress: 0,
        difficulty: "中等",
        sections: normalizePaperSections(aiPaper.sections, paperItems),
        tags: sourceUrl ? ["联网导入", "DeepSeek整卷", "待校对"] : ["DeepSeek整卷", "待校对"],
        visibility: "teacher",
        owner: currentProfile().name,
        source: sourceUrl ? "AI 从网络/PDF 导入" : "AI 从网络搜索导入",
        sharedWith: [],
        items: paperItems
      };
      state.papers.unshift(importedPaper);
      state.activePaperId = importedPaper.id;
      const importedQuestions = paperItems.map((item, index) => createBankQuestionFromPaperItem(item, importedPaper, index));
      state.questions.unshift(...importedQuestions);
      preparePapers();
      persistExamState();
      toast(`DeepSeek 已导入整卷“${title}”，共 ${importedPaper.questions} 题`);
    }
    if (options.closeModalOnSuccess) closeModal();
    if (state.section === "bank") switchSection("bank");
    updateBankAiStatus("处理完成，可以继续输入新的需求", false);
  } catch (error) {
    toast(`AI 处理失败：${aiErrorMessage(error)}`);
    updateBankAiStatus(`处理失败：${aiErrorMessage(error)}`, false);
  } finally {
    state.aiBusy = false;
    updateBankAiStatus($("#bankAiPrompt") ? "Enter 发送，Shift + Enter 换行" : "", false);
  }
}

function submitBankAiPrompt() {
  const input = $("#bankAiPrompt");
  if (!input || state.aiBusy) return;
  const mode = state.bankView === "questions" ? "generate" : state.bankView === "videos" ? "video" : "auto";
  executeSmartAiRequest(input.value.trim(), "", { mode });
}

function gradingPage() {
  const pendingPapers = state.papers.filter(paper => state.exam.submitted[paper.id]);
  return pageShell("批改 / 评分点 / 批注 / 退回重做", "批改与评价中心",
    `<button class="primary small" data-modal="rubric">配置评分标准</button>`,
    `<div class="module-grid">
      <article class="panel">
        <div class="panel-head"><div><p>批改队列</p><h2>按题批改更快</h2></div></div>
        <div class="info-list">
          ${pendingPapers.length ? pendingPapers.map(paper => {
            const result = state.exam.submitted[paper.id];
            return `<div class="info-row"><strong>${paper.title}</strong><span>王子涵 · ${result.pendingManual} 道主观题待批 · 客观题 ${result.score}/${result.objectiveTotal}</span><button class="ghost small" data-open-submission="${paper.id}">进入批改</button></div>`;
          }).join("") : `<div class="empty-state">暂无待批提交</div>`}
        </div>
      </article>
      <article class="panel">
        <div class="panel-head"><div><p>常用评语</p><h2>一键插入</h2></div></div>
        <div class="check-grid">
          <label><input type="checkbox" checked /> 思路清晰</label>
          <label><input type="checkbox" /> 计算准确</label>
          <label><input type="checkbox" /> 书写规范</label>
          <label><input type="checkbox" /> 需补步骤</label>
        </div>
      </article>
      <article class="panel wide">
        <div class="timeline">
          <div class="timeline-item"><time>09:30</time><div><strong>客观题自动批改完成</strong><p class="muted">36 名学生已出分，错题已进入错题本。</p></div></div>
          <div class="timeline-item"><time>10:10</time><div><strong>张老师提交 8 份主观题批改</strong><p class="muted">包含手写批注、评分点和文字评语。</p></div></div>
          <div class="timeline-item"><time>待办</time><div><strong>12 份需人工复核</strong><p class="muted">系统建议按第 3 题集中批改。</p></div></div>
        </div>
      </article>
    </div>`
  );
}

function videoPage() {
  const videoRows = state.videos.map((item, index) => `
    <tr><td>${item.name}</td><td>${item.size}</td><td>${item.status}</td><td>${item.progress}%</td><td>初三(1)班</td><td><button class="ghost small" data-video-action="${index}">${item.status === "上传中" ? "暂停" : item.status === "已暂停" ? "继续" : "关联"}</button> <button class="ghost small" data-delete-video="${index}">删除</button></td></tr>
  `).join("");
  return pageShell("视频 / 题目关联 / 观看数据", "讲题视频管理",
    `<button class="primary small" data-modal="video">上传视频</button>`,
    `<div class="module-grid">
      <article class="panel wide">
        <table class="compact-table"><thead><tr><th>视频</th><th>大小</th><th>状态</th><th>进度</th><th>可见班级</th><th>操作</th></tr></thead><tbody>${videoRows}</tbody></table>
      </article>
      <article class="panel">
        <div class="panel-head"><div><p>观看效果</p><h2>关联题目提升</h2></div></div>
        <div class="metric-row"><div><strong>78%</strong><span>完播率</span></div><div><strong>31%</strong><span>二练提升</span></div><div><strong>18</strong><span>提问</span></div><div><strong>9</strong><span>未看</span></div></div>
      </article>
      <article class="panel">
        <div class="panel-head"><div><p>答疑</p><h2>视频下方问题</h2></div></div>
        <div class="info-list">
          <div class="info-row"><strong>王子涵</strong><span>为什么判别式要大于 0？</span><button class="ghost small">回复</button></div>
          <div class="info-row"><strong>李思远</strong><span>第 3 分钟的步骤没看懂</span><button class="ghost small">回复</button></div>
        </div>
      </article>
    </div>`
  );
}

function analyticsPage() {
  return pageShell("学生 / 班级 / 知识点 / 趋势", "学情分析",
    `<button class="primary small" data-modal="report">生成报告</button>`,
    `<div class="module-grid">
      <article class="panel">
        <div class="panel-head"><div><p>知识点掌握</p><h2>Top 薄弱点</h2></div></div>
        <div class="info-list">
          ${state.knowledge.map(item => `<div class="info-row"><strong>${item.name}</strong><span>掌握率 ${item.mastery}% · ${item.count} 题样本</span><button class="ghost small">专项练习</button></div>`).join("")}
        </div>
      </article>
      <article class="panel">
        <div class="panel-head"><div><p>学生风险</p><h2>需重点关注</h2></div></div>
        <div class="risk-list">${state.risk.map(item => `<div class="risk-item"><strong>${item.name}</strong><span>${item.point}</span><em>${item.risk}</em></div>`).join("")}</div>
      </article>
      <article class="panel wide">
        <div class="panel-head"><div><p>报告结构</p><h2>自动生成班级讲评</h2></div></div>
        <div class="timeline">
          <div class="timeline-item"><time>1</time><div><strong>整体完成与分数分布</strong><p class="muted">覆盖完成率、平均分、分数段和异常提交。</p></div></div>
          <div class="timeline-item"><time>2</time><div><strong>高频错题与讲评建议</strong><p class="muted">自动推荐老师应优先讲解的题目。</p></div></div>
          <div class="timeline-item"><time>3</time><div><strong>学生分层与推荐练习</strong><p class="muted">按风险等级、薄弱知识点推送个性练习。</p></div></div>
        </div>
      </article>
    </div>`
  );
}

function adminPage() {
  const userRows = state.users.map((user, index) => `
    <tr><td>${user.name}</td><td>${user.role}</td><td>${user.org}</td><td>${user.status}</td><td><button class="ghost small" data-modal="permission">权限</button> <button class="ghost small" data-toggle-user="${index}">${user.status === "启用" ? "停用" : "启用"}</button> <button class="ghost small" data-delete-user="${index}">删除</button></td></tr>
  `).join("");
  return pageShell("账号 / 角色 / 权限 / 数据隔离", "后台管理",
    `<button class="primary small" data-modal="user">新增账号</button>`,
    `<div class="module-grid">
      <article class="panel wide">
        <div class="subnav"><button class="active">人员账号</button><button>角色权限</button><button>组织数据隔离</button><button>操作日志</button></div>
        <table class="compact-table"><thead><tr><th>姓名</th><th>角色</th><th>组织范围</th><th>状态</th><th>操作</th></tr></thead><tbody>${userRows}</tbody></table>
      </article>
      <article class="panel">
        <div class="panel-head"><div><p>角色模板</p><h2>RBAC 权限</h2></div></div>
        <div class="info-list">
          <div class="info-row"><strong>教师</strong><span>作业、批改、班级学情</span><button class="ghost small" data-modal="permission">配置</button></div>
          <div class="info-row"><strong>学生</strong><span>只看自己的作业、答卷和反馈</span><button class="ghost small" data-modal="permission">配置</button></div>
          <div class="info-row"><strong>管理员</strong><span>组织、人员、系统配置</span><button class="ghost small" data-modal="permission">配置</button></div>
        </div>
      </article>
      <article class="panel">
        <div class="panel-head"><div><p>系统配置</p><h2>登录安全与存储</h2></div></div>
        <div class="info-list">
          <div class="info-row"><strong>手机验证码</strong><span>60 秒重发 · 10 分钟有效 · 防刷限制</span><button class="ghost small">配置</button></div>
          <div class="info-row"><strong>密码策略</strong><span>最少 8 位 · 支持重置和禁用</span><button class="ghost small">配置</button></div>
          <div class="info-row"><strong>登录日志</strong><span>记录 IP、设备、角色与组织范围</span><button class="ghost small">查看</button></div>
          <div class="info-row"><strong>MySQL</strong><span>业务数据主库</span><button class="ghost small">查看</button></div>
          <div class="info-row"><strong>对象存储</strong><span>视频、图片、手写附件</span><button class="ghost small">配置</button></div>
          <div class="info-row"><strong>审计日志</strong><span>权限变更保留 180 天</span><button class="ghost small">导出</button></div>
        </div>
      </article>
    </div>`
  );
}

function switchSection(section) {
  if (!hasPermission(section)) {
    toast("当前账号没有访问该模块的权限，可在管理后台调整角色权限");
    return;
  }
  state.section = section;
  $$(".side-nav > button[data-section]").forEach(btn => btn.classList.toggle("active", btn.dataset.section === section));
  $$(".side-subnav [data-bank-view]").forEach(btn => btn.classList.toggle("active", state.section === "bank" && btn.dataset.bankView === state.bankView));
  $$(".section-page").forEach(page => page.classList.add("hidden"));
  if (section === "workspace" && state.role !== "student") {
    $("#workspace").innerHTML = roleWorkspacePage();
    $("#workspace").classList.remove("hidden");
    if (state.role === "teacher") {
      renderClasses();
      renderHomeworkRows();
      updateSelectedCount();
      renderVideos();
      renderStudents();
      renderAnalytics();
      setupCanvas("gradingCanvas");
      window.setTimeout(initTeacherDashboardCharts, 80);
    }
    $(".main")?.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  $("#workspace").classList.toggle("hidden", section !== "workspace" || state.role === "student");
  $$(".section-page").forEach(page => {
    const active = page.id === section && section !== "workspace" && state.role !== "student";
    page.classList.toggle("hidden", !active);
    if (active) page.innerHTML = sectionTemplate(section);
  });
  if (section === "bank") setBankAiMode(state.aiMode);
  $(".main")?.scrollTo({ top: 0, behavior: "smooth" });
}

function switchRole(role) {
  state.role = role;
  $$(".role-switch button").forEach(btn => btn.classList.toggle("active", btn.dataset.role === role));
  applyPermissions();
  const title = role === "teacher" ? "老师工作台" : role === "student" ? "学生学习空间" : "管理后台";
  $("#roleBanner h1").textContent = title;
  $("#roleBanner .banner-metrics").innerHTML = currentProfile().banner.map(item => `<span>${item}</span>`).join("");
  $("#studentDock").classList.toggle("hidden", role !== "student");
  $("#workspace").classList.toggle("hidden", role === "student" || state.section !== "workspace");
  if (role === "admin") switchSection("admin");
  if (role === "teacher" && state.section === "admin") switchSection("workspace");
}

function setupCanvas(canvasId) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");
  const toolbar = $(`.pen-toolbar[data-target="${canvasId}"]`);
  const history = [];
  let drawing = false;
  let color = canvasId === "gradingCanvas" ? "#e3342f" : "#111827";
  let tool = "pen";
  let last = null;

  function seed() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (canvasId === "gradingCanvas") {
      ctx.fillStyle = "#242d2a";
      ctx.font = "20px serif";
      ctx.fillText("解：2x² - 5x + 2 = 0", 36, 54);
      ctx.fillText("(2x - 1)(x - 2) = 0", 70, 108);
      ctx.fillText("x = 1/2 或 x = 2", 88, 162);
      ctx.strokeStyle = "#e3342f";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(454, 208);
      ctx.lineTo(488, 238);
      ctx.lineTo(554, 154);
      ctx.stroke();
      ctx.fillStyle = "#e3342f";
      ctx.font = "26px cursive";
      ctx.fillText("10分", 520, 248);
    } else {
      ctx.fillStyle = "#1f2925";
      ctx.font = "22px serif";
      ctx.fillText("请用触屏笔写出推理过程，也可以画辅助线。", 34, 60);
    }
    save();
  }

  function save() {
    try {
      history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
      if (history.length > 18) history.shift();
    } catch (error) {
      console.warn(error);
    }
  }

  function restore() {
    if (history.length > 1) {
      history.pop();
      ctx.putImageData(history[history.length - 1], 0, 0);
    }
  }

  function point(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  canvas.addEventListener("pointerdown", event => {
    drawing = true;
    last = point(event);
    canvas.setPointerCapture(event.pointerId);
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
  });

  canvas.addEventListener("pointermove", event => {
    if (!drawing) return;
    const next = point(event);
    ctx.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
    ctx.strokeStyle = color;
    ctx.lineWidth = tool === "eraser" ? 18 : event.pointerType === "pen" ? 3 : 4;
    ctx.lineTo(next.x, next.y);
    ctx.stroke();
    last = next;
  });

  ["pointerup", "pointercancel", "pointerleave"].forEach(name => {
    canvas.addEventListener(name, () => {
      if (!drawing) return;
      drawing = false;
      ctx.globalCompositeOperation = "source-over";
      save();
    });
  });

  toolbar.addEventListener("click", event => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.dataset.tool) {
      tool = button.dataset.tool === "grid" ? "pen" : button.dataset.tool;
      $$(".tool", toolbar).forEach(btn => btn.classList.toggle("active", btn === button));
      if (button.dataset.tool === "grid") {
        canvas.style.backgroundSize = canvas.style.backgroundSize === "12px 12px" ? "24px 24px" : "12px 12px";
        toast("已切换书写网格");
      }
    }
    if (button.dataset.color) {
      color = button.dataset.color;
      tool = "pen";
      $$(".swatch", toolbar).forEach(btn => btn.classList.toggle("active", btn === button));
      $$(".tool", toolbar).forEach(btn => btn.classList.toggle("active", btn.dataset.tool === "pen"));
    }
    if (button.dataset.action === "undo") restore();
    if (button.dataset.action === "clear") {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      save();
    }
  });

  seed();
}

function modalContent(type, payload = {}) {
  const forms = {
    homework: {
      eyebrow: "发布作业",
      title: "设置作业/考试要求",
      body: `
        <div class="form-grid">
          <label class="field"><span>作业名称</span><input id="homeworkTitle" value="二次函数综合练习" /></label>
          <label class="field"><span>发布班级</span><select id="homeworkClass">${classOptions()}</select></label>
          <label class="field"><span>发布模式</span><select><option>整卷发布</option><option>从试卷节选题目</option><option>从题库手动选题</option><option>按知识点自动组卷</option><option>按学生错题个性化发布</option></select></label>
          <label class="field"><span>试卷来源</span><select id="homeworkPaper">${state.papers.map(paper => `<option value="${paper.id}">${paper.title}</option>`).join("")}</select></label>
          <label class="field"><span>截止时间</span><input id="homeworkDeadline" type="datetime-local" value="2026-07-01T22:00" /></label>
          <label class="field"><span>限时</span><select><option>不限时</option><option>45 分钟</option><option>90 分钟</option></select></label>
          <div class="field full"><span>发布范围</span><div class="check-grid">
            <label><input type="checkbox" checked /> 全班统一作业</label>
            <label><input type="checkbox" /> 分层发布 A/B/C 卷</label>
            <label><input type="checkbox" /> 仅推送给薄弱学生</label>
            <label><input type="checkbox" /> 家长端同步通知</label>
          </div></div>
          <div class="field full"><span>答题与讲评规则</span><div class="check-grid">
            <label><input type="checkbox" checked /> 客观题自动批改</label>
            <label><input type="checkbox" checked /> 主观题需要老师批改</label>
            <label><input type="checkbox" /> 提交后立即显示答案</label>
            <label><input type="checkbox" checked /> 批改后显示解析与讲题视频</label>
            <label><input type="checkbox" checked /> 允许触屏笔手写过程</label>
            <label><input type="checkbox" /> 允许退回重做</label>
            <label><input type="checkbox" checked /> 自动生成错题本</label>
            <label><input type="checkbox" checked /> 作业后生成班级报告</label>
          </div></div>
          <div class="field full"><span>整卷结构预览</span>
            <table class="compact-table">
              <thead><tr><th>试卷</th><th>题量</th><th>分值</th><th>时长</th><th>结构</th></tr></thead>
              <tbody>${state.papers.map(paper => `<tr><td>${paper.title}</td><td>${paper.questions}</td><td>${paper.score}</td><td>${paper.duration} 分钟</td><td>${paper.sections.join(" / ")}</td></tr>`).join("")}</tbody>
            </table>
          </div>
        </div>`,
      action: "确认发布"
    },
    question: {
      eyebrow: "题库编辑",
      title: payload.index !== undefined ? "编辑题目" : "AI 新增题目",
      body: `
        <div class="form-grid">
          ${payload.index === undefined ? `<div class="field full ai-assist-card"><span>DeepSeek AI 出题</span><strong>输入知识点和题型，AI 自动生成题干、答案、解析和教学建议。</strong><label><input id="questionUseAi" type="checkbox" checked /> 使用 AI 生成题目</label></div>` : ""}
          <label class="field full"><span>题干</span><textarea id="questionTitle">${payload.title || "已知关于 x 的一元二次方程 x² - 2x + m = 0 有两个不相等的实数根，则 m 的取值范围是（ ）"}</textarea></label>
          <label class="field"><span>题型</span><select id="questionType"><option ${payload.type === "单选题" ? "selected" : ""}>单选题</option><option>多选题</option><option ${payload.type === "填空题" ? "selected" : ""}>填空题</option><option ${payload.type === "解答题" ? "selected" : ""}>解答题</option></select></label>
          <label class="field"><span>题库归属</span><select id="questionSource"><option ${payload.source === "教师题库" ? "selected" : ""}>教师题库</option><option ${payload.source === "公共真题库" ? "selected" : ""}>公共真题库</option><option ${payload.source === "学生练习库" ? "selected" : ""}>学生练习库</option><option>临时题：仅本次发布</option></select></label>
          <label class="field"><span>知识点</span><select id="questionPoint"><option>一元二次方程</option><option>二次函数图像与性质</option><option>相似三角形</option></select></label>
          <label class="field"><span>难度</span><select id="questionDifficulty"><option>中等</option><option>容易</option><option>较难</option></select></label>
          <div class="field full"><span>保存策略</span><div class="check-grid"><label><input id="saveToBank" type="checkbox" checked /> 保存到题库，后续可复用</label><label><input type="checkbox" checked /> 本次可用于发布作业/测验/考试</label></div></div>
          <label class="field full"><span>标准答案与解析</span><textarea>答案：A。解析：方程有两个不相等实数根，所以判别式 Δ = 4 - 4m > 0，得到 m < 1。</textarea></label>
        </div>`,
      action: payload.index === undefined ? "AI 生成并入库" : "保存并提交审核"
    },
    class: {
      eyebrow: "班级管理",
      title: payload.name ? `${payload.name} 班级画像` : "新建班级",
      body: `
        <div class="form-grid">
          <label class="field"><span>班级名称</span><input id="classNameInput" value="${payload.name || "初三(5)班"}" /></label>
          <label class="field"><span>班主任</span><select id="classOwnerInput"><option>张老师</option></select></label>
          <label class="field"><span>年级</span><select><option>初三</option><option>初二</option></select></label>
          <label class="field"><span>学生导入</span><select><option>手动添加</option><option>Excel 批量导入</option><option>邀请码加入</option></select></label>
          <div class="field full"><span>班级数据</span><div class="metric-row"><div><strong>45</strong><span>学生</span></div><div><strong>88%</strong><span>完成率</span></div><div><strong>72%</strong><span>掌握率</span></div><div><strong>6</strong><span>风险学生</span></div></div></div>
        </div>`,
      action: "保存班级"
    },
    video: {
      eyebrow: "讲题视频",
      title: "上传并关联视频",
      body: `
        <div class="form-grid">
          <label class="field"><span>视频标题</span><input id="videoTitleInput" value="二次函数压轴题讲解" /></label>
          <label class="field"><span>选择文件</span><input id="videoFileInput" type="file" accept="video/*" /></label>
          <label class="field"><span>可见班级</span><select><option>初三(1)班</option></select></label>
          <label class="field"><span>关联知识点</span><select><option>二次函数图像与性质</option><option>一元二次方程</option></select></label>
          <label class="field"><span>关联作业</span><select><option>5月18日综合练习</option><option>几何证明专项</option></select></label>
          <div class="field full"><span>关联题目</span><div class="check-grid">
            ${state.questions.slice(0, 4).map(q => `<label><input type="checkbox" checked /> ${q.title}</label>`).join("")}
          </div></div>
        </div>`,
      action: "保存视频关联"
    },
    report: {
      eyebrow: "学情报告",
      title: "生成班级讲评报告",
      body: `
        <div class="form-grid">
          <label class="field"><span>报告对象</span><select><option>初三(1)班</option><option>王子涵个人报告</option></select></label>
          <label class="field"><span>周期</span><select><option>最近一次作业</option><option>本周</option><option>本月</option></select></label>
          <div class="field full"><span>包含内容</span><div class="check-grid">
            <label><input type="checkbox" checked /> 完成率与分数分布</label>
            <label><input type="checkbox" checked /> 高频错题</label>
            <label><input type="checkbox" checked /> 薄弱知识点</label>
            <label><input type="checkbox" checked /> 风险学生名单</label>
            <label><input type="checkbox" /> 视频观看效果</label>
            <label><input type="checkbox" /> 推荐练习</label>
          </div></div>
        </div>`,
      action: "生成报告"
    },
    user: {
      eyebrow: "人员管理",
      title: "新增账号",
      body: `
        <div class="form-grid">
          <label class="field"><span>姓名</span><input id="userNameInput" value="" placeholder="请输入姓名" /></label>
          <label class="field"><span>手机号</span><input id="userPhoneInput" value="" placeholder="请输入手机号" /></label>
          <label class="field"><span>角色</span><select id="userRoleInput"><option>教师</option><option>学生</option><option>管理员</option></select></label>
          <label class="field"><span>组织范围</span><select id="userOrgInput"><option>光明中学</option><option>初三(1)班</option></select></label>
        </div>`,
      action: "创建账号"
    },
    permission: {
      eyebrow: "权限配置",
      title: "角色权限与数据范围",
      body: `
        <div class="form-grid">
          <label class="field"><span>角色</span><select id="permissionRole"><option value="teacher">教师</option><option value="admin">管理员</option><option value="student">学生</option></select></label>
          <label class="field"><span>数据范围</span><select id="permissionScope"><option>本人班级</option><option>本校区</option><option>全机构</option></select></label>
          <div class="field full"><span>可访问模块</span><div class="check-grid">
            ${[
              ["workspace", "工作台"],
              ["org", "组织与班级"],
              ["bank", "题库管理"],
              ["homework", "作业与考试"],
              ["grading", "批改与评价"],
              ["video", "讲题视频"],
              ["analytics", "学情分析"],
              ["admin", "后台管理"]
            ].map(([id, label]) => `<label><input type="checkbox" data-permission-module="${id}" /> ${label}</label>`).join("")}
          </div></div>
          <p class="field full muted">权限保存后立即生效；当前角色若失去模块权限，会自动返回工作台。</p>
        </div>`,
      action: "保存权限"
    },
    bankAccess: {
      eyebrow: "私人库可见范围",
      title: payload.title || payload.name || "资产权限",
      body: `
        <div class="form-grid">
          <div class="field full ai-assist-card">
            <span>权限规则</span>
            <strong>私人库资产默认只有创建老师可见。只有创建老师可以设置共享对象；被共享老师只能查看，不能编辑、删除或再次转发。</strong>
          </div>
          <label class="field"><span>所属老师</span><input value="${payload.owner || currentProfile().name}" disabled /></label>
          <label class="field"><span>库类型</span><input value="${payload.visibility === "teacher" ? "老师私人库" : "公共库"}" disabled /></label>
          <div class="field full"><span>允许查看的老师</span><div class="check-grid">
            ${availableTeacherNames(payload.owner).filter(name => name !== payload.owner).map(name => `<label><input type="checkbox" data-share-teacher="${name}" ${sharedWithNames(payload).includes(name) ? "checked" : ""} /> ${name}</label>`).join("")}
          </div></div>
          <p class="field full muted">保存后，只有 ${payload.owner || currentProfile().name} 仍可编辑、删除和调整可见范围。</p>
        </div>`,
      action: "保存可见范围"
    },
    rubric: {
      eyebrow: "评分标准",
      title: "配置主观题评分点",
      body: `
        <div class="form-grid">
          <label class="field"><span>题目</span><select><option>第 3 题：解方程</option><option>第 8 题：几何证明</option></select></label>
          <label class="field"><span>总分</span><input type="number" value="10" /></label>
          <label class="field full"><span>评分点</span><textarea>因式分解正确（4分）\n两根写出完整（3分）\n过程表达规范（3分）</textarea></label>
        </div>`,
      action: "应用到批改"
    },
    paper: {
      eyebrow: "AI 自动组卷",
      title: "DeepSeek 按知识点生成组卷蓝图",
      body: `
        <div class="form-grid">
          <div class="field full ai-assist-card"><span>DeepSeek AI 组卷</span><strong>根据知识点、题量、总分和难度比例生成试卷蓝图，再从题库抽题或补题。</strong></div>
          <label class="field"><span>试卷名称</span><input id="aiPaperTitle" value="AI 二次函数周测卷" /></label>
          <label class="field"><span>科目</span><select id="aiPaperSubject"><option>数学</option><option>物理</option></select></label>
          <label class="field"><span>总分</span><input id="aiPaperScore" type="number" value="100" /></label>
          <label class="field"><span>题量</span><input id="aiPaperCount" type="number" value="12" /></label>
          <label class="field"><span>难度比例</span><select id="aiPaperDifficulty"><option>易 30% / 中 50% / 难 20%</option><option>中考模拟</option></select></label>
          <label class="field"><span>题目来源</span><select><option>公共真题库 + 教师题库</option><option>仅公共真题库</option><option>仅教师题库</option></select></label>
          <div class="field full"><span>知识点范围</span><div class="check-grid">${state.knowledge.map(k => `<label><input type="checkbox" checked /> ${k.name}</label>`).join("")}</div></div>
        </div>`,
      action: "AI 生成组卷"
    },
    importPaper: {
      eyebrow: "导入真题卷",
      title: "导入一整套历史真题",
      body: `
        <div class="form-grid">
          <label class="field"><span>试卷名称</span><input id="importPaperTitle" value="2025 杭州中考数学真题卷" /></label>
          <label class="field"><span>考试类型</span><select id="importPaperExam"><option>中考真题</option><option>高考真题</option><option>期末真题</option><option>模拟卷</option></select></label>
          <label class="field"><span>地区</span><input id="importPaperRegion" value="杭州" /></label>
          <label class="field"><span>年份</span><input id="importPaperYear" type="number" value="2025" /></label>
          <label class="field"><span>科目</span><select id="importPaperSubject"><option>数学</option><option>物理</option><option>语文</option><option>英语</option></select></label>
          <label class="field"><span>整卷时长</span><input id="importPaperDuration" type="number" value="100" /></label>
          <label class="field"><span>总分</span><input id="importPaperScore" type="number" value="120" /></label>
          <label class="field"><span>题量</span><input id="importPaperQuestions" type="number" value="24" /></label>
          <label class="field"><span>文件类型</span><select id="importPaperFileType"><option>Word/PDF 试卷 + 答案解析</option><option>Excel 结构化题目</option><option>图片扫描件 OCR</option></select></label>
          <label class="field"><span>使用范围</span><select id="importPaperScope"><option value="teacher">仅本次发布使用</option><option value="public">保存为可复用试卷</option></select></label>
          <label class="field full"><span>真题原文/答案解析</span><textarea id="importPaperRaw" placeholder="可以粘贴 PDF/Word 识别出的真题文本、答案解析，或先只填试卷信息让 AI 生成结构化草稿。"></textarea></label>
          <div class="field full"><span>导入后处理</span><div class="check-grid">
            <label><input type="checkbox" checked /> 自动拆题并生成整卷结构</label>
            <label><input type="checkbox" checked /> 识别答案与解析</label>
            <label><input type="checkbox" checked /> 匹配知识点和难度</label>
            <label><input type="checkbox" checked /> 查重并合并重复题</label>
            <label><input type="checkbox" checked /> 导入后可直接整卷发布</label>
            <label><input type="checkbox" checked /> 导入后先由老师校对答案解析</label>
          </div></div>
          <div class="import-pipeline full">
            <div><b>1</b><strong>上传原卷</strong><span>PDF、Word、Excel 或扫描件</span></div>
            <div><b>2</b><strong>自动解析</strong><span>题型、分值、答案、解析</span></div>
            <div><b>3</b><strong>人工校对</strong><span>缺失字段与公式图片复核</span></div>
            <div><b>4</b><strong>入库发布</strong><span>整卷可发布，题目可抽题</span></div>
          </div>
        </div>`,
      action: "导入并生成试卷"
    },
    webImportPaper: {
      eyebrow: "智能搜索",
      title: "告诉 AI 你想做什么",
      body: `
        <div class="smart-search-form">
          <div class="ai-assist-card">
            <span>智能搜索可以理解自然语言</span>
            <strong>例如：找 2025 大连中考物理真题并导入题库；生成 10 道二次函数中档题；用相似三角形和勾股定理组一张 45 分钟测验。</strong>
          </div>
          <label class="field full"><span>搜索/生成/组卷需求</span><textarea id="smartSearchText" class="smart-search-textarea">找 2025 大连中考物理真题，导入公共真题库，自动拆题并生成答案解析</textarea></label>
          <label class="field full"><span>网页或 PDF 链接（可选）</span><input id="smartSearchUrl" placeholder="https://..." /></label>
          <div class="smart-search-examples">
            <button type="button" data-smart-example="找 2025 大连中考物理真题，导入公共真题库，自动拆题并生成答案解析">搜真题</button>
            <button type="button" data-smart-example="生成 8 道初三数学二次函数中档题，含答案和解析，放入教师题库">生成题目</button>
            <button type="button" data-smart-example="用一元二次方程、相似三角形、勾股定理组一张 45 分钟测验，难度中等">自动组卷</button>
          </div>
          <div class="web-result-list">
            <label><input type="radio" name="smartSearchMode" checked /> <strong>AI 自动判断</strong><small>根据文本自动选择搜真题、出题或组卷</small></label>
            <label><input type="radio" name="smartSearchMode" /> <strong>入库前人工校对</strong><small>生成结果先进入草稿，老师确认后再公开</small></label>
          </div>
        </div>`,
      action: "执行智能搜索"
    },
    aiInsight: {
      eyebrow: "AI 分析",
      title: `${aiSceneNames[payload.scene] || "当前页面"} · 智能建议`,
      body: `
        <div class="ai-insight-view">
          <div class="ai-summary"><span>结论</span><strong>${payload.summary || "AI 正在整理当前模块建议"}</strong></div>
          <div class="ai-insight-grid">
            ${(payload.insights || []).map(item => `<article><b>${item.priority || "中"}</b><strong>${item.title || "建议"}</strong><p>${item.detail || ""}</p></article>`).join("")}
          </div>
          <div class="profile-content-grid">
            <section class="profile-section">
              <div class="profile-section-head"><span>建议动作</span><strong>下一步可以做什么</strong></div>
              <div class="info-list">${(payload.actions || []).map(item => `<div class="info-row"><strong>${item.label}</strong><span>${item.reason || ""}</span><button class="ghost small" data-section-jump="${item.target_module || payload.scene || "workspace"}">前往</button></div>`).join("")}</div>
            </section>
            <section class="profile-section">
              <div class="profile-section-head"><span>风险提示</span><strong>需要人工确认</strong></div>
              <div class="info-list">${(payload.risks || []).map(item => `<div class="info-row"><strong>${item.name}</strong><span>${item.reason || ""} · ${item.suggestion || ""}</span><button class="ghost small">记录</button></div>`).join("")}</div>
            </section>
          </div>
        </div>`,
      action: "保存 AI 建议"
    },
    notifications: {
      eyebrow: "消息中心",
      title: "待处理通知",
      body: `
        <div class="timeline">
          <div class="timeline-item"><time>作业</time><div><strong>王子涵待提交</strong><p class="muted">初三(1)班大连中考物理真题练习，建议课前提醒。</p><button class="ghost small" data-action-kind="remind">提醒学生</button></div></div>
          <div class="timeline-item"><time>题库</time><div><strong>28 道题待审核</strong><p class="muted">包含中考真题标签补全和解析审核。</p><button class="ghost small" data-modal="question">去审核</button></div></div>
          <div class="timeline-item"><time>视频</time><div><strong>2 个视频转码完成</strong><p class="muted">可以关联作业和题目后发布给班级。</p><button class="ghost small" data-modal="video">关联视频</button></div></div>
        </div>`,
      action: "全部标为已读"
    },
    search: {
      eyebrow: "全局搜索",
      title: `搜索：${payload.keyword || "全部"}`,
      body: `
        <div class="search-results">
          ${["学生 王子涵 / 初三(1)班 / 最近正确率 72%", "题目 欧姆定律计算 / 2025 大连中考真题", "视频 电学计算真题讲解 / 已关联 1 套作业", "班级 初三(1)班 / 1 人 / 等待首次提交"].map(item => `
            <div class="result-row"><mark>${payload.keyword || "结果"}</mark><span>${item}</span><button class="ghost small">打开</button></div>
          `).join("")}
        </div>`,
      action: "保存搜索"
    },
    import: {
      eyebrow: "批量导入",
      title: "导入题目、学生或组织数据",
      body: `
        <div class="form-grid">
          <label class="field"><span>导入类型</span><select><option>题库 Excel</option><option>学生名单 Excel</option><option>试卷 Word/PDF</option></select></label>
          <label class="field"><span>导入策略</span><select><option>新增并提交审核</option><option>覆盖已有草稿</option><option>仅校验不入库</option></select></label>
          <div class="field full"><span>校验规则</span><div class="check-grid">
            <label><input type="checkbox" checked /> 检查重复题</label>
            <label><input type="checkbox" checked /> 检查答案完整性</label>
            <label><input type="checkbox" checked /> 自动匹配知识点</label>
            <label><input type="checkbox" /> 识别图片与公式</label>
          </div></div>
          <div class="empty-state full">原型中不上传真实文件。正式产品会使用对象存储保存原文件，并创建异步解析任务。</div>
        </div>`,
      action: "开始导入"
    },
    studentDetail: {
      eyebrow: "学生画像",
      title: payload.name ? `${payload.name} · ${payload.className}` : "学生详情",
      body: `
        <div class="student-profile">
          <div class="profile-hero">
            <div class="profile-head">
              <span>${payload.name?.slice(0, 1) || "学"}</span>
              <div>
                <strong>${payload.name || "学生"}</strong>
                <small>${payload.studentNo || ""} · ${payload.className || "未分班"}</small>
              </div>
            </div>
            <div class="profile-badges">
              <b class="${payload.risk === "需关注" ? "watch" : payload.risk === "高风险" ? "risk" : ""}">${payload.risk || "正常"}</b>
              <b>${payload.account || "启用"}</b>
            </div>
          </div>
          <div class="profile-metrics">
            <button type="button" data-section-jump="analytics"><span>最近成绩</span><strong>${payload.score || 0}</strong><i>班级均分 84.6</i></button>
            <button type="button" data-section-jump="homework"><span>作业完成</span><strong>${payload.completion || 0}%</strong><i>${(payload.completion || 0) >= 90 ? "按时提交稳定" : "需要提醒跟进"}</i></button>
            <button type="button" data-section-jump="grading"><span>待批主观题</span><strong>${(payload.score || 0) > 85 ? 1 : 3}</strong><i>最近一次测验</i></button>
          </div>
          <div class="profile-content-grid">
            <section class="profile-section">
              <div class="profile-section-head"><span>基础信息</span><strong>联系与账号</strong></div>
              <div class="profile-grid">
                <div><span>手机号</span><strong>${payload.phone || "-"}</strong></div>
                <div><span>家长电话</span><strong>${payload.parentPhone || "-"}</strong></div>
                <div><span>最近登录</span><strong>${payload.lastLogin || "-"}</strong></div>
                <div><span>账号状态</span><strong>${payload.account || "启用"}</strong></div>
              </div>
            </section>
            <section class="profile-section">
              <div class="profile-section-head"><span>学习诊断</span><strong>${payload.weakPoint || "薄弱点"} 需巩固</strong></div>
              <div class="profile-progress">
                <label><span>知识点掌握</span><b>${Math.max(55, (payload.score || 0) - 8)}%</b></label>
                <i style="--value:${Math.max(55, (payload.score || 0) - 8)}%"></i>
                <label><span>提交稳定性</span><b>${payload.completion || 0}%</b></label>
                <i style="--value:${payload.completion || 0}%"></i>
              </div>
            </section>
          </div>
          <div class="profile-plan">
            <div class="profile-section-head"><span>跟进计划</span><strong>本周建议</strong></div>
            <div class="timeline">
              <div class="timeline-item"><time>练习</time><div><strong>推送 ${payload.weakPoint || "薄弱点"} 专项练习</strong><p class="muted">6 道同类题，完成后自动复测并生成错因。</p></div></div>
              <div class="timeline-item"><time>讲评</time><div><strong>关联 1 个讲题视频</strong><p class="muted">优先推送与最近错题相关的短视频。</p></div></div>
              <div class="timeline-item"><time>提醒</time><div><strong>同步家长待办</strong><p class="muted">若今晚 20:30 前未完成，进入提醒队列。</p></div></div>
            </div>
          </div>
        </div>`,
      action: "保存跟进记录"
    },
    studentReport: {
      eyebrow: "学生端报告",
      title: "本次作业报告",
      body: `
        <div class="student-summary">
          <div><strong>86</strong><span>本次得分</span></div>
          <div><strong>4</strong><span>新增错题</span></div>
          <div><strong>18 分钟</strong><span>答题时长</span></div>
        </div>
        <div class="timeline" style="margin-top:14px">
          <div class="timeline-item"><time>掌握</time><div><strong>一元二次方程较好</strong><p class="muted">判别式、因式分解题型正确率高。</p></div></div>
          <div class="timeline-item"><time>薄弱</time><div><strong>相似三角形需要巩固</strong><p class="muted">系统已推荐 6 道相似三角形练习。</p></div></div>
          <div class="timeline-item"><time>反馈</time><div><strong>老师建议</strong><p class="muted">过程书写更规范，结论表达完整。</p></div></div>
        </div>`,
      action: "加入复习计划"
    },
    paperDetail: {
      eyebrow: "整卷预览",
      title: payload.title || "试卷详情",
      body: `
        <div class="exam-paper-preview">
          <header>
            <p>${payload.exam || "试卷"} · ${payload.visibility === "teacher" ? `${payload.owner} 私人库` : "公共库"}</p>
            <h1>${payload.title || "未命名试卷"}</h1>
            <div><span>科目：${payload.subject || "-"}</span><span>地区：${payload.region || "-"}</span><span>年份：${payload.year || "-"}</span><span>满分：${payload.score || 0}</span><span>时间：${payload.duration || 0} 分钟</span></div>
          </header>
          <section class="exam-paper-notice">
            <strong>试卷结构</strong>
            <span>${(payload.sections || []).join(" / ") || "待 AI 解析"}</span>
          </section>
          <div class="paper-question-preview-list exam-style">
            ${(payload.items || []).map(item => `
              <article class="paper-question-preview">
                <header><span>第 ${item.no} 题</span><b>${item.type}</b><em>${item.score || 0} 分</em></header>
                <strong>${item.title}</strong>
                ${item.choices?.length ? `<ol>${item.choices.map((choice, index) => `<li><b>${String.fromCharCode(65 + index)}</b>${choice}</li>`).join("")}</ol>` : ""}
                <div class="paper-answer-preview">
                  <span>答案：${item.answer || "待校对"}</span>
                  <p>${item.analysis || "暂无解析，老师可在校对后补充。"}</p>
                </div>
              </article>
            `).join("") || `<div class="empty-state">这张试卷还没有题目，请重新通过 AI 导入整卷。</div>`}
          </div>
        </div>`,
      action: "关闭预览"
    },
    paperOverview: {
      eyebrow: "整卷题卡",
      title: activePaper().title,
      body: `
        <div class="metric-row"><div><strong>${activePaper().questions}</strong><span>题量</span></div><div><strong>${activePaper().score}</strong><span>总分</span></div><div><strong>${activePaper().duration}</strong><span>分钟</span></div><div><strong>${activePaper().progress}%</strong><span>进度</span></div></div>
        <table class="compact-table">
          <thead><tr><th>题号</th><th>题型</th><th>题目</th><th>分值</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>${activePaper().items.map(item => `<tr><td>${item.no}</td><td>${item.type}</td><td>${item.title}</td><td>${item.score}</td><td>${item.status}</td><td><button class="ghost small" data-paper-question="${item.no}">去作答</button></td></tr>`).join("")}</tbody>
        </table>`,
      action: "保存进度"
    },
    reply: {
      eyebrow: "视频答疑",
      title: "回复学生问题",
      body: `
        <div class="form-grid">
          <label class="field full"><span>学生问题</span><textarea>第 3 分钟这里为什么要先看判别式？</textarea></label>
          <label class="field full"><span>老师回复</span><textarea>因为题目问的是实数根个数，先看判别式可以直接判断根的情况。你可以回看 02:48 的公式推导。</textarea></label>
          <div class="field full"><span>回复方式</span><div class="check-grid"><label><input type="checkbox" checked /> 文字回复</label><label><input type="checkbox" /> 录音回复</label><label><input type="checkbox" checked /> 同步给全班可见</label><label><input type="checkbox" /> 生成 FAQ</label></div></div>
        </div>`,
      action: "发送回复"
    },
    security: {
      eyebrow: "安全策略",
      title: "登录与账号安全配置",
      body: `
        <div class="form-grid">
          <label class="field"><span>验证码有效期</span><select><option>10 分钟</option><option>5 分钟</option></select></label>
          <label class="field"><span>重发间隔</span><select><option>60 秒</option><option>90 秒</option></select></label>
          <label class="field"><span>密码最小长度</span><input type="number" value="8" /></label>
          <label class="field"><span>错误锁定</span><select><option>5 次错误锁定 30 分钟</option><option>10 次错误锁定 1 小时</option></select></label>
          <div class="field full"><span>二次验证</span><div class="check-grid"><label><input type="checkbox" checked /> 管理员异地登录需短信验证</label><label><input type="checkbox" /> 老师导出数据需二次确认</label></div></div>
        </div>`,
      action: "保存安全策略"
    },
    audit: {
      eyebrow: "审计日志",
      title: "登录与权限操作日志",
      body: `
        <table class="compact-table">
          <thead><tr><th>时间</th><th>账号</th><th>动作</th><th>IP/设备</th><th>结果</th></tr></thead>
          <tbody>
            <tr><td>今天 10:12</td><td>赵管理员</td><td>修改教师权限</td><td>Chrome / 上海</td><td>成功</td></tr>
            <tr><td>今天 09:44</td><td>张老师</td><td>验证码登录</td><td>iPad / 校内网</td><td>成功</td></tr>
            <tr><td>昨天 18:20</td><td>张老师</td><td>智能搜索导入试卷</td><td>Chrome / 大连</td><td>成功</td></tr>
          </tbody>
        </table>`,
      action: "导出日志"
    },
    storage: {
      eyebrow: "存储配置",
      title: "视频、图片、手写附件存储",
      body: `
        <div class="form-grid">
          <label class="field"><span>对象存储</span><select><option>MinIO 私有化</option><option>阿里云 OSS</option><option>腾讯云 COS</option></select></label>
          <label class="field"><span>视频转码</span><select><option>720p + 1080p</option><option>仅 720p</option></select></label>
          <label class="field"><span>附件保留</span><select><option>随课程保留</option><option>180 天</option></select></label>
          <label class="field"><span>防盗链</span><select><option>开启签名 URL</option><option>关闭</option></select></label>
        </div>`,
      action: "保存存储配置"
    },
    wrongPractice: {
      eyebrow: "错题巩固",
      title: "自动生成错题练习",
      body: `
        <div class="info-list">
          <div class="info-row"><strong>相似三角形</strong><span>3 道错题 · 推荐 6 道同类题</span><button class="ghost small">开始</button></div>
          <div class="info-row"><strong>二次函数</strong><span>2 道错题 · 推荐讲题视频 1 个</span><button class="ghost small">开始</button></div>
          <div class="info-row"><strong>计算规范</strong><span>老师批注 2 条 · 建议重写过程</span><button class="ghost small">重写</button></div>
        </div>`,
      action: "生成练习"
    },
    videoLearning: {
      eyebrow: "视频学习",
      title: "老师推荐讲题视频",
      body: `
        <div class="info-list">
          <div class="info-row"><strong>二次函数压轴题讲解</strong><span>12 分钟 · 已看 40%</span><button class="ghost small">继续</button></div>
          <div class="info-row"><strong>相似三角形判定</strong><span>8 分钟 · 未开始</span><button class="ghost small">播放</button></div>
          <div class="info-row"><strong>错题讲评：第 12 题</strong><span>5 分钟 · 关联当前作业</span><button class="ghost small">播放</button></div>
        </div>`,
      action: "加入学习计划"
    }
  };
  return forms[type] || forms.homework;
}

function openModal(type, payload = {}) {
  const config = modalContent(type, payload);
  const modal = $(".modal");
  modal.className = `modal modal-${type}`;
  $("#modalEyebrow").textContent = config.eyebrow;
  $("#modalTitle").textContent = config.title;
  $("#modalBody").innerHTML = config.body;
  $("#modalFoot").innerHTML = `<button class="ghost" id="cancelModal">取消</button><button class="primary" id="confirmModal">${config.action}</button>`;
  $("#modalBackdrop").classList.remove("hidden");
  $("#modalBackdrop").setAttribute("aria-hidden", "false");
  if (type === "permission") {
    const syncPermissionChecks = () => {
      const role = $("#permissionRole").value;
      $$("[data-permission-module]").forEach(input => {
        input.checked = state.roleProfiles[role].allowed.includes(input.dataset.permissionModule);
      });
    };
    $("#permissionRole").addEventListener("change", syncPermissionChecks);
    syncPermissionChecks();
  }
  $("#cancelModal").addEventListener("click", closeModal);
  $("#confirmModal").addEventListener("click", async () => {
    if (type === "bankAccess") {
      const sharedWith = $$("[data-share-teacher]").filter(input => input.checked).map(input => input.dataset.shareTeacher);
      if (payload.assetType === "paper") {
        const paper = state.papers.find(item => item.id === payload.id);
        if (paper && canOperateBankAsset(paper)) paper.sharedWith = sharedWith;
      } else {
        const question = state.questions[Number(payload.index)];
        if (question && canOperateBankAsset(question)) question.sharedWith = sharedWith;
      }
      persistExamState();
      closeModal();
      if (state.section === "bank") switchSection("bank");
      toast("可见范围已更新");
      return;
    }
    if (type === "paperDetail") {
      closeModal();
      return;
    }
    if (type === "homework") {
      const title = $("#homeworkTitle").value.trim();
      if (!title) {
        toast("请输入作业名称");
        return;
      }
      state.assignments.unshift({
        id: `hw-${Date.now()}`,
        title,
        paperId: $("#homeworkPaper").value,
        className: $("#homeworkClass").value,
        deadline: $("#homeworkDeadline").value,
        status: "进行中",
        createdAt: Date.now()
      });
      persistExamState();
      renderStudentAssignments();
      closeModal();
      toast(`作业“${title}”已发布到 ${$("#homeworkClass")?.value || "班级"}`);
      return;
    }
    if (type === "question") {
      if ($("#questionUseAi")?.checked && payload.index === undefined) {
        toast("AI 正在生成题目...");
        const source = $("#questionSource").value;
        const visibility = source === "公共真题库" ? "public" : source === "学生练习库" ? "student" : "teacher";
        const owner = source === "教师题库" || source.startsWith("临时题") ? currentProfile().name : "题库中心";
        let generated;
        try {
          const ai = await aiPost("/ai/generate-questions", {
            subject: "数学",
            knowledge_point: $("#questionPoint").value,
            question_type: $("#questionType").value,
            difficulty: $("#questionDifficulty").value,
            count: 3,
            source_scope: source
          });
          generated = (ai.result.questions || []).map((item, index) => ({
            title: item.stem || item.title || `${$("#questionPoint").value} AI 题目 ${index + 1}`,
            type: item.type || $("#questionType").value,
            point: (item.knowledge_points || [$("#questionPoint").value])[0],
            source,
            visibility,
            owner
          }));
        } catch {
          generated = mockAiQuestions({ title: "AI模拟生成", knowledgePoint: $("#questionPoint").value, count: 3, type: $("#questionType").value }).map(item => ({ ...item, source, visibility, owner }));
        }
        state.questions.unshift(...generated);
        persistExamState();
        closeModal();
        if (state.section === "bank") switchSection("bank");
        if (state.section === "homework") switchSection("homework");
        toast(`已生成 ${generated.length} 道题并加入${source}`);
        return;
      }
      const question = {
        title: $("#questionTitle").value.trim(),
        type: $("#questionType").value,
        point: $("#questionPoint").value,
        source: $("#questionSource").value,
        visibility: $("#questionSource").value === "公共真题库" ? "public" : $("#questionSource").value === "学生练习库" ? "student" : "teacher",
        owner: $("#questionSource").value === "教师题库" || $("#questionSource").value.startsWith("临时题") ? currentProfile().name : "题库中心"
      };
      if (!question.title) {
        toast("请输入题干");
        return;
      }
      if (!$("#saveToBank")?.checked && payload.index === undefined) {
        closeModal();
        toast("临时题已加入本次发布草稿，不进入题库");
        return;
      }
      if (payload.index !== undefined) state.questions[Number(payload.index)] = question;
      else state.questions.unshift(question);
      persistExamState();
      renderHomeworkRows();
      closeModal();
      if (state.section === "bank") switchSection("bank");
      if (state.section === "homework") switchSection("homework");
      toast(payload.index !== undefined ? "题目已更新" : "题目已新增并进入题库");
      return;
    }
    if (type === "paper") {
      toast("AI 正在生成组卷蓝图...");
      const title = $("#aiPaperTitle").value.trim() || "AI 智能组卷";
      const checkedPoints = $$(".check-grid input:checked").map(input => input.parentElement.textContent.trim()).filter(Boolean);
      let blueprint = [];
      try {
        const ai = await aiPost("/ai/assemble-paper", {
          title,
          subject: $("#aiPaperSubject").value,
          exam_type: "测验",
          knowledge_points: checkedPoints,
          question_count: Number($("#aiPaperCount").value) || 12,
          total_score: Number($("#aiPaperScore").value) || 100,
          difficulty_ratio: $("#aiPaperDifficulty").value
        });
        blueprint = ai.result.blueprint || [];
      } catch {
        blueprint = checkedPoints.map((point, index) => ({ section: `第 ${index + 1} 组`, knowledge_points: [point], count: 3, score_each: 5 }));
      }
      const paper = {
        id: `ai-paper-${Date.now()}`,
        title,
        exam: "AI测验",
        subject: $("#aiPaperSubject").value,
        region: "校本",
        year: 2026,
        duration: 45,
        score: Number($("#aiPaperScore").value) || 100,
        questions: Number($("#aiPaperCount").value) || 12,
        progress: 0,
        difficulty: "AI分层",
        sections: blueprint.length ? blueprint.map(item => `${item.section || "题组"} ${item.count || 3}`) : ["选择题 6", "填空题 4", "解答题 2"],
        tags: ["AI组卷", "教师题库", "可发布"],
        items: []
      };
      state.papers.unshift(paper);
      preparePapers();
      persistExamState();
      closeModal();
      if (state.section === "bank") switchSection("bank");
      toast(`已生成“${title}”，可在发布作业中整卷发布`);
      return;
    }
    if (type === "webImportPaper") {
      const query = $("#smartSearchText").value.trim();
      const sourceUrl = $("#smartSearchUrl").value.trim();
      if (!query) {
        toast("请输入智能搜索需求");
        return;
      }
      await executeSmartAiRequest(query, sourceUrl, { closeModalOnSuccess: true });
      return;
      toast("AI 正在理解需求...");
      const isGenerate = /生成|出题|新增题|题目/.test(query) && !/真题|试卷|卷/.test(query);
      const isAssemble = /组卷|测验|考试|作业|一张/.test(query) && !/真题/.test(query);
      const yearMatch = query.match(/20\d{2}/);
      const year = yearMatch ? Number(yearMatch[0]) : new Date().getFullYear();
      const subject = query.includes("物理") ? "物理" : query.includes("语文") ? "语文" : query.includes("英语") ? "英语" : "数学";
      const region = query.match(/([\u4e00-\u9fa5]{2,4})(?:中考|高考|期末|真题)/)?.[1] || "本地";
      const exam = query.includes("高考") ? "高考真题" : query.includes("期末") ? "期末真题" : query.includes("测验") ? "测验" : "中考真题";
      if (isGenerate) {
        const point = query.match(/(?:道|个)?([\u4e00-\u9fa5]{2,12})(?:题|中档|基础|较难)/)?.[1] || "综合应用";
        const count = Number(query.match(/(\d+)\s*道/)?.[1]) || 6;
        let generated;
        try {
          const ai = await aiPost("/ai/generate-questions", {
            subject,
            knowledge_point: point,
            question_type: query.includes("解答") ? "解答题" : "单选题",
            difficulty: query.includes("较难") ? "较难" : query.includes("基础") ? "容易" : "中等",
            count,
            source_scope: "教师题库"
          });
          generated = (ai.result.questions || []).map((item, index) => ({
            title: item.stem || `${point} AI 题目 ${index + 1}`,
            type: item.type || "单选题",
            point: (item.knowledge_points || [point])[0],
            source: "教师题库",
            visibility: "teacher",
            owner: currentProfile().name
          }));
        } catch {
          generated = mockAiQuestions({ title: "智能搜索生成", knowledgePoint: point, count, type: "单选题" });
        }
        state.questions.unshift(...generated);
        persistExamState();
        closeModal();
        if (state.section === "bank") switchSection("bank");
        toast(`已生成 ${generated.length} 道题并加入教师题库`);
        return;
      }
      if (isAssemble) {
        const title = query.slice(0, 24) || "智能搜索组卷";
        const paper = {
          id: `smart-paper-${Date.now()}`,
          title,
          exam: query.includes("考试") ? "考试" : query.includes("作业") ? "作业" : "测验",
          subject,
          region: "校本",
          year,
          duration: Number(query.match(/(\d+)\s*分钟/)?.[1]) || 45,
          score: 100,
          questions: 12,
          progress: 0,
          difficulty: query.includes("较难") ? "较难" : "中等",
          sections: ["选择题 6", "填空题 4", "解答题 2"],
          tags: ["智能搜索", "AI组卷", "可发布"],
          items: []
        };
        state.papers.unshift(paper);
        preparePapers();
        persistExamState();
        closeModal();
        if (state.section === "bank") switchSection("bank");
        toast(`已生成“${title}”，可在发布作业中整卷发布`);
        return;
      }
      toast("AI 正在联网检索并解析真题...");
      let aiQuestions = [];
      let aiPaper = {};
      try {
        const ai = await aiPost("/ai/web-import-paper", {
          title: `${year} ${region}${exam}${subject}卷`,
          subject,
          exam_type: exam,
          region,
          year,
          question_count: 24,
          total_score: 120,
          duration_minutes: 100,
          raw_text: "",
          query,
          source_url: sourceUrl
        });
        aiQuestions = ai.result.questions || [];
        aiPaper = ai.result.paper || {};
      } catch (error) {
        toast(`DeepSeek 导入失败：${aiErrorMessage(error)}`);
        return;
      }
      if (!aiQuestions.length && !aiPaper.title) {
        toast("DeepSeek 没有返回可导入的试卷结构，请换关键词或补充真题链接");
        return;
      }
      const title = aiPaper.title || `${year} ${region}${exam}${subject}卷`;
      const paper = {
        id: `web-paper-${Date.now()}`,
        title,
        exam,
        subject,
        region,
        year,
        duration: aiPaper.duration_minutes || 100,
        score: aiPaper.total_score || 120,
        questions: Math.max(24, aiQuestions.length || 24),
        progress: 0,
        difficulty: "中等",
        sections: aiPaper.sections || ["选择题 6", "填空题 12", "解答题 6"],
        tags: sourceUrl ? ["联网导入", "真题", "待校对"] : ["AI搜索", "真题草稿", "待校对"],
        items: []
      };
      state.papers.unshift(paper);
      const importedQuestions = aiQuestions.slice(0, 6).map((item, index) => ({
        title: item.stem || `${title} 第 ${item.number || index + 1} 题`,
        type: item.type || "单选题",
        point: (item.knowledge_points || ["综合应用"])[0]
      })).map(item => ({
        ...item,
        source: "公共真题库",
        visibility: "public",
        owner: "题库中心"
      }));
      state.questions.unshift(...importedQuestions);
      preparePapers();
      persistExamState();
      closeModal();
      if (state.section === "bank") switchSection("bank");
      toast(`DeepSeek 已导入“${title}”，生成 ${importedQuestions.length} 道题目草稿`);
      return;
    }
    if (type === "importPaper") {
      const title = $("#importPaperTitle").value.trim();
      const region = $("#importPaperRegion").value.trim();
      const year = Number($("#importPaperYear").value) || new Date().getFullYear();
      const questions = Number($("#importPaperQuestions").value) || 24;
      const score = Number($("#importPaperScore").value) || 120;
      const duration = Number($("#importPaperDuration").value) || 100;
      const scope = $("#importPaperScope").value;
      if (!title || !region) {
        toast("请输入试卷名称和地区");
        return;
      }
      toast("AI 正在解析真题卷...");
      let aiQuestions = [];
      try {
        const ai = await aiPost("/ai/import-paper", {
          title,
          subject: $("#importPaperSubject").value,
          exam_type: $("#importPaperExam").value,
          region,
          year,
          question_count: questions,
          total_score: score,
          duration_minutes: duration,
          raw_text: $("#importPaperRaw").value.trim()
        });
        aiQuestions = ai.result.questions || [];
      } catch (error) {
        toast(`DeepSeek 解析失败：${aiErrorMessage(error)}`);
        return;
      }
      if (!aiQuestions.length) {
        toast("DeepSeek 没有返回题目结构，请粘贴真题原文或补充 PDF/网页链接");
        return;
      }
      const paperId = `paper-${Date.now()}`;
      const paper = {
        id: paperId,
        title,
        exam: $("#importPaperExam").value,
        subject: $("#importPaperSubject").value,
        region,
        year,
        duration,
        score,
        questions,
        progress: 0,
        difficulty: "中等",
        sections: ["选择题 6", "填空题 12", `解答题 ${Math.max(1, questions - 18)}`],
        tags: ["真题", "新导入", scope === "review" ? "待审核" : "可发布"],
        items: []
      };
      state.papers.unshift(paper);
      const visibility = scope === "teacher" ? "teacher" : "public";
      const source = visibility === "teacher" ? "教师题库" : "公共真题库";
      const importedQuestions = aiQuestions.slice(0, 6).map((item, index) => ({
        title: item.stem || `${title} 第 ${item.number || index + 1} 题`,
        type: item.type || "单选题",
        point: (item.knowledge_points || ["综合应用"])[0]
      })).map(item => ({
        ...item,
        source,
        visibility,
        owner: visibility === "teacher" ? currentProfile().name : "题库中心"
      }));
      state.questions.unshift(...importedQuestions);
      preparePapers();
      persistExamState();
      closeModal();
      if (state.section === "bank") switchSection("bank");
      if (state.section === "homework") switchSection("homework");
      toast(`DeepSeek 已导入“${title}”，生成 ${questions} 题整卷和 ${importedQuestions.length} 道题库题`);
      return;
    }
    if (type === "class") {
      const name = $("#classNameInput").value.trim();
      const owner = $("#classOwnerInput").value;
      if (!name) {
        toast("请输入班级名称");
        return;
      }
      const existing = payload.name ? state.classes.find(item => item.name === payload.name) : null;
      if (existing) {
        existing.name = name;
        existing.owner = owner;
      } else {
        state.classes.push({ name, count: 0, owner, rate: 0 });
      }
      persistExamState();
      renderClasses();
      closeModal();
      if (state.section === "org") switchSection("org");
      toast(existing ? "班级信息已更新" : "班级已创建");
      return;
    }
    if (type === "video") {
      const title = $("#videoTitleInput").value.trim();
      const file = $("#videoFileInput").files[0];
      if (!title) {
        toast("请输入视频标题");
        return;
      }
      state.videos.unshift({
        name: file?.name || `${title}.mp4`,
        title,
        size: file ? `${(file.size / 1024 / 1024).toFixed(1)}MB` : "待上传",
        progress: file ? 1 : 0,
        status: file ? "上传中" : "待选择文件",
        owner: currentProfile().name,
        source: "老师上传",
        paperTitle: activePaper()?.title || "未关联试卷",
        point: $("#questionPoint")?.value || state.knowledge[0]?.name || "综合讲解"
      });
      persistExamState();
      renderVideos();
      closeModal();
      if (state.section === "video") switchSection("video");
      if (state.section === "bank") switchSection("bank");
      toast(file ? "视频已加入上传队列" : "视频关联已保存，选择文件后可上传");
      return;
    }
    if (type === "user") {
      const name = $("#userNameInput").value.trim();
      const phone = $("#userPhoneInput").value.trim();
      if (!name || !/^1\d{10}$/.test(phone)) {
        toast("请输入姓名和正确的 11 位手机号");
        return;
      }
      if (state.users.some(user => user.phone === phone)) {
        toast("该手机号已存在");
        return;
      }
      state.users.unshift({
        name,
        phone,
        role: $("#userRoleInput").value,
        org: $("#userOrgInput").value,
        status: "启用"
      });
      persistExamState();
      closeModal();
      if (state.section === "admin") switchSection("admin");
      toast(`账号 ${name} 已创建`);
      return;
    }
    if (type === "permission") {
      const role = $("#permissionRole").value;
      const allowed = $$("[data-permission-module]").filter(input => input.checked).map(input => input.dataset.permissionModule);
      if (!allowed.includes("workspace")) allowed.unshift("workspace");
      state.roleProfiles[role].allowed = allowed;
      persistExamState();
      applyPermissions();
      closeModal();
      if (!hasPermission(state.section)) switchSection("workspace");
      toast("角色权限已保存并立即生效");
      return;
    }
    closeModal();
    toast(`${config.action}成功`);
  });
}

function closeModal() {
  $("#modalBackdrop").classList.add("hidden");
  $("#modalBackdrop").setAttribute("aria-hidden", "true");
  $(".modal").className = "modal";
}

function confirmDelete(title, description, onConfirm) {
  $(".modal").className = "modal";
  $("#modalEyebrow").textContent = "删除确认";
  $("#modalTitle").textContent = title;
  $("#modalBody").innerHTML = `<div class="notice-list"><p>${description}</p><p>删除后无法恢复。</p></div>`;
  $("#modalFoot").innerHTML = `<button class="ghost" id="cancelModal">取消</button><button class="primary danger-action" id="confirmDelete">确认删除</button>`;
  $("#modalBackdrop").classList.remove("hidden");
  $("#cancelModal").addEventListener("click", closeModal);
  $("#confirmDelete").addEventListener("click", () => {
    onConfirm();
    closeModal();
  });
}

function openGenericAction(button) {
  const text = button.textContent.trim();
  const rowText = button.closest(".info-row, .mini-card, .timeline-item, .panel, .video-item")?.textContent || "";
  if (!text) return false;
  if (["批量导入", "导入题目"].includes(text)) return openModal("import"), true;
  if (["配置"].includes(text) && rowText.includes("验证码")) return openModal("security"), true;
  if (["配置"].includes(text) && rowText.includes("密码")) return openModal("security"), true;
  if (["配置"].includes(text) && rowText.includes("对象存储")) return openModal("storage"), true;
  if (["查看"].includes(text) && (rowText.includes("登录日志") || rowText.includes("异常登录"))) return openModal("audit"), true;
  if (["导出"].includes(text) && (rowText.includes("日志") || rowText.includes("审计"))) return openModal("audit"), true;
  if (["回复"].includes(text)) return openModal("reply"), true;
  if (["提醒"].includes(text)) return toast("已通过 App、短信和班级群提醒未提交学生"), true;
  if (["讲评"].includes(text)) return openModal("video"), true;
  if (["套用"].includes(text)) return openModal("homework"), true;
  if (["绑定题目"].includes(text)) return openModal("video"), true;
  if (["专项练习"].includes(text)) return openModal("wrongPractice"), true;
  if (["进入"].includes(text)) return switchSection("grading"), true;
  if (["查看", "打开"].includes(text)) return openModal("search", { keyword: rowText.slice(0, 8) }), true;
  if (["处理", "补全"].includes(text)) return openModal("question"), true;
  if (["发布"].includes(text)) return openModal("homework"), true;
  if (["开始", "重写", "继续", "播放"].includes(text)) return toast(`${text}：已进入对应学习流程`), true;
  if (["B", "I", "公式", "图片", "解析"].includes(text)) return toast(`已切换编辑工具：${text}`), true;
  return false;
}

async function openAiInsight(scene = state.section) {
  toast("AI 正在分析当前页面...");
  let result;
  try {
    const ai = await aiPost("/ai/analyze", {
      scene: aiSceneNames[scene] || scene,
      role: state.role,
      question: "请分析当前模块的风险、下一步建议和可执行动作",
      context: aiContextFor(scene)
    });
    result = ai.result;
  } catch {
    result = mockAiAnalysis(scene);
  }
  openModal("aiInsight", { scene, ...result });
}

function bindEvents() {
  $$("[data-login-role]").forEach(btn => {
    btn.addEventListener("click", () => {
      const labels = { teacher: "教师", student: "学生", admin: "管理" };
      $("#loginRole").value = btn.dataset.loginRole;
      $$("[data-login-role]").forEach(item => item.classList.toggle("active", item === btn));
      $(".login-button-label").textContent = `进入${labels[btn.dataset.loginRole]}空间`;
    });
  });
  $("#phoneInput").addEventListener("input", syncLoginAccount);
  $("#phoneInput").addEventListener("blur", syncLoginAccount);
  $("#rememberLogin")?.addEventListener("change", event => {
    state.rememberLogin = event.target.checked;
    if (!event.target.checked) clearLoginSession();
  });
  $("#ssoLogin")?.addEventListener("click", () => {
    $("#phoneInput").value = "13800000000";
    $("#codeInput").value = state.smsCode;
    $("#rememberLogin").checked = true;
    state.rememberLogin = true;
    toast("正在跳转学校 SSO 统一认证...");
    window.setTimeout(() => {
      loginAs("teacher", "sso");
      toast("SSO 登录成功，已记录登录状态");
    }, 450);
  });
  $$(".login-tabs button").forEach(btn => {
    btn.addEventListener("click", () => {
      state.loginMode = btn.dataset.loginMode;
      $$(".login-tabs button").forEach(item => item.classList.toggle("active", item === btn));
      $(".sms-field").classList.toggle("hidden", state.loginMode !== "sms");
      $(".password-field").classList.toggle("hidden", state.loginMode !== "password");
    });
  });
  $("#sendCode").addEventListener("click", () => {
    const phone = $("#phoneInput").value.trim();
    if (!/^1\d{10}$/.test(phone)) {
      toast("请输入正确的 11 位手机号");
      return;
    }
    state.codeCountdown = 60;
    $("#sendCode").disabled = true;
    $("#sendCode").textContent = "60s 后重发";
    const timer = window.setInterval(() => {
      state.codeCountdown -= 1;
      $("#sendCode").textContent = `${state.codeCountdown}s 后重发`;
      if (state.codeCountdown <= 0) {
        window.clearInterval(timer);
        $("#sendCode").disabled = false;
        $("#sendCode").textContent = "获取验证码";
      }
    }, 1000);
    toast("验证码已发送：演示环境请使用 246810");
  });
  $("#demoCode").addEventListener("click", () => {
    $("#codeInput").value = state.smsCode;
    toast("已填入演示验证码");
  });
  $("#loginForm").addEventListener("submit", event => {
    event.preventDefault();
    if (state.pendingLoginAccount) {
      loginAs($("#loginRole").value, state.loginMode);
      state.pendingLoginAccount = null;
      resetLoginStage();
      return;
    }
    const phone = $("#phoneInput").value.trim();
    if (!/^1\d{10}$/.test(phone)) {
      toast("请输入正确的手机号");
      return;
    }
    const account = state.loginAccounts[phone];
    if (!account) {
      toast("未找到该演示账号，请使用页面底部提供的手机号");
      return;
    }
    if (state.loginMode === "sms" && $("#codeInput").value.trim() !== state.smsCode) {
      toast("验证码不正确，演示验证码是 246810");
      return;
    }
    if (state.loginMode === "password" && !$("#passwordInput").value.trim()) {
      toast("请输入密码");
      return;
    }
    if (account.roles.length > 1) {
      showRoleSelection(account);
      return;
    }
    loginAs(account.roles[0], state.loginMode);
  });
  $("#logoutBtn").addEventListener("click", () => {
    clearLoginSession();
    resetLoginStage();
    $("#loginScreen").classList.remove("hidden");
    toast("已退出登录");
  });
  $("#permissionBtn").addEventListener("click", () => openModal("permission"));
  $("#notificationBtn").addEventListener("click", () => openModal("notifications"));
  $("#studentReportBtn").addEventListener("click", () => openModal("studentReport"));
  $("#paperOverviewBtn").addEventListener("click", () => openModal("paperOverview"));
  $("#refreshPractice").addEventListener("click", () => toast("已根据最新错题重新推荐练习"));
  $("#globalSearch").addEventListener("focus", event => renderSearchPanel(event.target.value));
  $("#globalSearch").addEventListener("input", event => renderSearchPanel(event.target.value));
  $("#globalSearch").addEventListener("keydown", event => {
    if (event.key === "Enter") {
      const first = $("#globalSearchPanel .search-hit");
      if (first) first.click();
      else renderSearchPanel(event.target.value);
    }
    if (event.key === "Escape") hideSearchPanel();
  });
  $("#classSelect").addEventListener("change", event => toast(`已切换到 ${event.target.value} 的班级数据`));
  $(".back").addEventListener("click", exitPaper);
  $$(".grading-side input[type='checkbox']").forEach(box => {
    box.addEventListener("change", () => {
      const checked = $$(".grading-side input[type='checkbox']").filter(item => item.checked).length;
      const score = checked === 3 ? 10 : checked === 2 ? 7 : checked === 1 ? 4 : 0;
      $("#scoreRange").value = score;
      $("#scoreValue").textContent = score;
    });
  });
  $$(".role-switch button").forEach(btn => {
    btn.addEventListener("click", () => switchRole(btn.dataset.role));
  });
  $("#publishHomework").addEventListener("click", () => openModal("homework"));
  $("#publishTop").addEventListener("click", () => {
    switchRole("teacher");
    switchSection("homework");
    toast("已进入发布中心");
  });
  $("#newQuestion").addEventListener("click", () => openModal("question"));
  $("#addVideo").addEventListener("click", () => {
    openModal("video");
  });
  $("#scoreRange").addEventListener("input", event => $("#scoreValue").textContent = event.target.value);
  $("#submitGrade").addEventListener("click", () => toast("批改已提交，学生端可查看分数、批注和评语"));
  $("#saveAndNext").addEventListener("click", () => {
    saveCurrentAnswer();
    const paper = activePaper();
    const next = Math.min(paper.questions, state.exam.currentNo + 1);
    selectPaperQuestion(next);
  });
  $("#prevQuestion").addEventListener("click", () => {
    const previous = Math.max(1, state.exam.currentNo - 1);
    selectPaperQuestion(previous);
  });
  $("#submitPaper").addEventListener("click", () => submitCurrentPaper());
  $("#paperQuestionContent").addEventListener("change", saveCurrentAnswer);
  $("#paperQuestionContent").addEventListener("input", () => {
    window.clearTimeout(state.examSaveTimer);
    state.examSaveTimer = window.setTimeout(saveCurrentAnswer, 350);
  });
  $("#studentPaperSearch").addEventListener("input", event => {
    state.paperFilters.search = event.target.value.trim();
    renderStudentPapers();
  });
  $("#studentYearFilter").addEventListener("change", event => {
    state.paperFilters.year = event.target.value;
    renderStudentPapers();
  });
  $("#studentRegionFilter").addEventListener("change", event => {
    state.paperFilters.region = event.target.value;
    renderStudentPapers();
  });
  $("#syncBtn").addEventListener("click", () => toast("数据已同步到班级学情和作业进度"));
  $("#exportReport").addEventListener("click", () => openModal("report"));
  $("#closeModal").addEventListener("click", closeModal);
  $("#modalBackdrop").addEventListener("click", event => {
    if (event.target.id === "modalBackdrop") closeModal();
  });
  $("#questionFilter").addEventListener("input", event => {
    const keyword = event.target.value.trim();
    $$("#homeworkRows tr").forEach(row => {
      row.style.display = row.textContent.includes(keyword) ? "" : "none";
    });
  });
  document.addEventListener("input", event => {
    if (event.target.matches("#questionFilter")) {
      const keyword = event.target.value.trim();
      $$("#homeworkRows tr").forEach(row => {
        row.style.display = row.textContent.includes(keyword) ? "" : "none";
      });
    }
    if (event.target.matches("#studentListSearch")) {
      const keyword = event.target.value.trim();
      $$("#studentRows tr").forEach(row => {
        row.style.display = row.textContent.includes(keyword) ? "" : "none";
      });
    }
    if (event.target.matches("#bankQuestionSearch")) {
      const keyword = event.target.value.trim();
      $$("#bankQuestionRows tr").forEach(row => {
        row.style.display = row.textContent.includes(keyword) ? "" : "none";
      });
    }
  });
  document.addEventListener("change", event => {
    if (event.target.matches("#bankTypeFilter, #bankScopeFilter")) {
      const type = $("#bankTypeFilter")?.value || "全部题型";
      const scope = $("#bankScopeFilter")?.value || "全部库";
      $$("#bankQuestionRows tr").forEach(row => {
        const text = row.textContent;
        const matchType = type === "全部题型" || text.includes(type);
        const matchScope = scope === "全部库" || text.includes(scope);
        row.style.display = matchType && matchScope ? "" : "none";
      });
    }
  });
  document.addEventListener("change", event => {
    if (event.target.matches("[data-question-index]")) updateSelectedCount();
  });
  document.addEventListener("keydown", event => {
    if (event.target.matches("#bankAiPrompt") && event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitBankAiPrompt();
      return;
    }
    const jumpTarget = event.target.closest("[data-section-jump][role='button']");
    if (jumpTarget && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      switchSection(jumpTarget.dataset.sectionJump);
    }
  });
  document.addEventListener("click", event => {
    const navButton = event.target.closest(".side-nav button[data-section]");
    if (navButton) {
      event.preventDefault();
      switchSection(navButton.dataset.section);
      return;
    }
    const searchAction = event.target.closest("[data-search-section], [data-search-modal]");
    if (searchAction && searchAction.closest("#globalSearchPanel")) {
      const section = searchAction.dataset.searchSection;
      const modal = searchAction.dataset.searchModal;
      hideSearchPanel();
      if (modal) openModal(modal);
      if (section) switchSection(section);
      return;
    }
    if (!event.target.closest(".search")) hideSearchPanel();
    if (!event.target.closest(".bank-ai-left-tools")) {
      $("#bankAiMenu")?.classList.add("hidden");
      $("#bankAiMore")?.classList.remove("active");
    }
    const bankAiMore = event.target.closest("#bankAiMore");
    if (bankAiMore) {
      if (!state.aiBusy) {
        $("#bankAiMenu")?.classList.toggle("hidden");
        bankAiMore.classList.toggle("active", !$("#bankAiMenu")?.classList.contains("hidden"));
      }
      return;
    }
    const bankAiMode = event.target.closest("[data-bank-ai-mode]");
    if (bankAiMode) {
      if (!state.aiBusy) setBankAiMode(bankAiMode.dataset.bankAiMode);
      $("#bankAiMenu")?.classList.add("hidden");
      $("#bankAiMore")?.classList.remove("active");
      return;
    }
    const bankAiSend = event.target.closest("#bankAiSend");
    if (bankAiSend) {
      submitBankAiPrompt();
      return;
    }
    const bankViewButton = event.target.closest("[data-bank-view]");
    if (bankViewButton) {
      state.bankView = bankViewButton.dataset.bankView;
      switchSection("bank");
      return;
    }
    const paperFilter = event.target.closest("[data-paper-filter]");
    if (paperFilter) {
      $$("#studentDock [data-paper-filter]").forEach(btn => btn.classList.toggle("active", btn === paperFilter));
      renderStudentPapers(paperFilter.dataset.paperFilter);
      toast(`已筛选试卷：${paperFilter.textContent.trim()}`);
      return;
    }
    const startPaperButton = event.target.closest("[data-start-paper]");
    if (startPaperButton) {
      showPaperStart(startPaperButton.dataset.startPaper);
      return;
    }
    const paperQuestion = event.target.closest("[data-paper-question]");
    if (paperQuestion) {
      selectPaperQuestion(paperQuestion.dataset.paperQuestion);
      if (paperQuestion.closest(".modal")) closeModal();
      return;
    }
    const subnavButton = event.target.closest(".subnav button");
    if (subnavButton) {
      $$(".subnav button", subnavButton.closest(".subnav")).forEach(btn => btn.classList.toggle("active", btn === subnavButton));
      toast(`已筛选：${subnavButton.textContent.trim()}`);
      return;
    }
    const tabButton = event.target.closest(".tabs button");
    if (tabButton) {
      $$(".tabs button", tabButton.closest(".tabs")).forEach(btn => btn.classList.toggle("active", btn === tabButton));
      const tab = tabButton.dataset.bankTab;
      if (tab === "paper") openModal("paper");
      if (tab === "knowledge") toast("已切换到知识点管理：可维护知识点树和题目绑定");
      if (tab === "edit") toast("已切换到题目编辑");
      return;
    }
    if (event.target.closest("#publishHomework")) {
      switchSection("homework");
      return;
    }
    if (event.target.closest("#publishFromPage")) {
      publishAssignmentFromPage();
      return;
    }
    if (event.target.closest("#newQuestion")) {
      openModal("question");
      return;
    }
    if (event.target.closest("#exportReport")) {
      openModal("report");
      return;
    }
    const viewPaperButton = event.target.closest("[data-view-paper]");
    if (viewPaperButton) {
      const paper = state.papers.find(item => item.id === viewPaperButton.dataset.viewPaper);
      if (paper) openModal("paperDetail", paper);
      return;
    }
    const questionAccessButton = event.target.closest("[data-question-access]");
    if (questionAccessButton) {
      const index = Number(questionAccessButton.dataset.questionAccess);
      const question = state.questions[index];
      if (!question || !canOperateBankAsset(question)) {
        toast("只有创建老师可以设置可见范围");
        return;
      }
      openModal("bankAccess", { ...question, index, assetType: "question" });
      return;
    }
    const paperAccessButton = event.target.closest("[data-paper-access]");
    if (paperAccessButton) {
      const paper = state.papers.find(item => item.id === paperAccessButton.dataset.paperAccess);
      if (!paper || !canOperateBankAsset(paper)) {
        toast("只有创建老师可以设置可见范围");
        return;
      }
      openModal("bankAccess", { ...paper, assetType: "paper" });
      return;
    }
    const publishPaperButton = event.target.closest("[data-publish-paper]");
    if (publishPaperButton) {
      const paperId = publishPaperButton.dataset.publishPaper;
      const paper = state.papers.find(item => item.id === paperId);
      state.activePaperId = paperId;
      switchSection("homework");
      const radio = $(`input[name='homeworkPaperRadio'][value='${paperId}']`);
      if (radio) radio.checked = true;
      toast(`已选择整卷“${paper?.title || "试卷"}”，请设置发布规则`);
      return;
    }
    if (event.target.closest("#submitGrade")) {
      toast("批改已提交，学生端可查看分数、批注和评语");
      return;
    }
    const smartExample = event.target.closest("[data-smart-example]");
    if (smartExample) {
      $("#smartSearchText").value = smartExample.dataset.smartExample;
      return;
    }
    const aiButton = event.target.closest("[data-ai-scene]");
    if (aiButton) {
      openAiInsight(aiButton.dataset.aiScene || state.section);
      return;
    }
    const sectionJump = event.target.closest("[data-section-jump]");
    if (sectionJump) {
      switchSection(sectionJump.dataset.sectionJump);
      return;
    }
    const submissionButton = event.target.closest("[data-open-submission]");
    if (submissionButton) {
      openSubmission(submissionButton.dataset.openSubmission);
      return;
    }
    const toggleUserButton = event.target.closest("[data-toggle-user]");
    if (toggleUserButton) {
      const user = state.users[Number(toggleUserButton.dataset.toggleUser)];
      user.status = user.status === "启用" ? "停用" : "启用";
      persistExamState();
      switchSection("admin");
      toast(`${user.name} 已${user.status}`);
      return;
    }
    const deleteUserButton = event.target.closest("[data-delete-user]");
    if (deleteUserButton) {
      const index = Number(deleteUserButton.dataset.deleteUser);
      const user = state.users[index];
      confirmDelete("删除账号", `${user.name} · ${user.role}`, () => {
        state.users.splice(index, 1);
        persistExamState();
        switchSection("admin");
        toast("账号已删除");
      });
      return;
    }
    const modalButton = event.target.closest("[data-modal]");
    if (modalButton) {
      openModal(modalButton.dataset.modal);
      return;
    }
    const editButton = event.target.closest("[data-edit-question]");
    if (editButton) {
      const question = state.questions[Number(editButton.dataset.editQuestion)];
      openModal("question", { ...question, index: editButton.dataset.editQuestion });
      return;
    }
    const deleteQuestionButton = event.target.closest("[data-delete-question]");
    if (deleteQuestionButton) {
      const index = Number(deleteQuestionButton.dataset.deleteQuestion);
      const question = state.questions[index];
      confirmDelete("删除题目", question.title, () => {
        state.questions.splice(index, 1);
        persistExamState();
        switchSection("bank");
        toast("题目已删除");
      });
      return;
    }
    const classButton = event.target.closest("[data-open-class], [data-class]");
    if (classButton) {
      openModal("class", { name: classButton.dataset.openClass || classButton.dataset.class });
      return;
    }
    const studentDetailButton = event.target.closest("[data-student-detail]");
    if (studentDetailButton) {
      const student = visibleClassStudents().find(item => item.id === studentDetailButton.dataset.studentDetail);
      openModal("studentDetail", student || {});
      return;
    }
    const deleteClassButton = event.target.closest("[data-delete-class]");
    if (deleteClassButton) {
      const name = deleteClassButton.dataset.deleteClass;
      confirmDelete(`删除 ${name}`, "班级内学生不会被删除，但需要重新分配班级。", () => {
        state.classes = state.classes.filter(item => item.name !== name);
        persistExamState();
        switchSection("org");
        toast("班级已删除");
      });
      return;
    }
    const task = event.target.closest("[data-student-task]");
    if (task) {
      $$(".student-task").forEach(item => item.classList.toggle("active", item === task));
      const labels = { answer: "已切换到在线答题", wrong: "已切换到错题巩固", video: "已切换到讲题视频" };
      const type = task.dataset.studentTask;
      if (type === "wrong") openModal("wrongPractice");
      if (type === "video") openModal("videoLearning");
      if (type === "answer") toast(labels[type]);
      return;
    }
    const button = event.target.closest("[data-video-action]");
    if (button) {
      const video = state.videos[Number(button.dataset.videoAction)];
      if (video.status === "上传中") video.status = "已暂停";
      else if (video.status === "已暂停") video.status = "上传中";
      else {
        openModal("video");
        return;
      }
      persistExamState();
      renderVideos();
      if (state.section === "video") switchSection("video");
      toast(video.status === "已暂停" ? "上传已暂停" : "上传已继续");
      return;
    }
    const deleteVideoButton = event.target.closest("[data-delete-video]");
    if (deleteVideoButton) {
      const index = Number(deleteVideoButton.dataset.deleteVideo);
      const video = state.videos[index];
      confirmDelete("删除视频", video.name, () => {
        state.videos.splice(index, 1);
        persistExamState();
        renderVideos();
        if (state.section === "video") switchSection("video");
        toast("视频已删除");
      });
      return;
    }
    if (event.target.closest("#submitPaper, #saveAndNext, #prevQuestion, .side-nav, .role-switch, .top-actions")) return;
    const looseButton = event.target.closest("button");
    if (looseButton && !looseButton.closest(".login-screen") && !looseButton.closest(".modal") && !looseButton.closest(".pen-toolbar")) {
      if (!openGenericAction(looseButton)) toast(`${looseButton.textContent.trim()} 已响应`);
    }
  });
}

function syncLoginAccount() {
  const phone = $("#phoneInput").value.trim();
  $("#loginHeading").textContent = "登录智学云教";
  $("#loginSubheading").textContent = phone.length === 11
    ? "手机号格式正确，请完成验证码或密码验证"
    : "完成身份验证后，系统将匹配你的账号与权限";
}

function showRoleSelection(account) {
  const roleNames = { teacher: "教师", student: "学生", admin: "管理" };
  const currentRole = account.roles[0];
  state.pendingLoginAccount = account;
  $("#loginRole").value = currentRole;
  $("#loginHeading").textContent = `验证成功，${account.name}`;
  $("#loginSubheading").textContent = "该账号拥有多个角色，请选择本次进入的工作空间";
  $("#detectedAvatar").textContent = account.avatar;
  $("#detectedName").textContent = account.name;
  $("#detectedScope").textContent = `${account.scope} · 已通过身份验证`;
  $("#accountDetected").classList.remove("hidden");
  $("#roleEntry").classList.remove("hidden");
  $$(".credential-control").forEach(item => item.classList.add("hidden"));
  $$("[data-login-role]").forEach(btn => {
    const allowed = account.roles.includes(btn.dataset.loginRole);
    btn.classList.toggle("hidden", !allowed);
    btn.classList.toggle("active", btn.dataset.loginRole === currentRole);
  });
  $(".login-button-label").textContent = `进入${roleNames[currentRole]}空间`;
}

function resetLoginStage() {
  state.pendingLoginAccount = null;
  $("#loginHeading").textContent = "登录智学云教";
  $("#loginSubheading").textContent = "完成身份验证后，系统将匹配你的账号与权限";
  $("#accountDetected").classList.add("hidden");
  $("#roleEntry").classList.add("hidden");
  $$(".credential-control").forEach(item => item.classList.remove("hidden"));
  $(".password-field").classList.toggle("hidden", state.loginMode !== "password");
  $(".sms-field").classList.toggle("hidden", state.loginMode !== "sms");
  $(".login-button-label").textContent = "安全登录";
}

function simulateUpload() {
  window.setInterval(() => {
    let changed = false;
    state.videos.forEach(video => {
      if (video.status === "上传中" && video.progress < 100) {
        video.progress = Math.min(100, video.progress + 1);
        if (video.progress === 100) video.status = "已完成";
        changed = true;
      }
    });
    if (changed) {
      persistExamState();
      renderVideos();
    }
  }, 2600);
}

function init() {
  state.defaultWorkspaceHtml = $("#workspace").innerHTML;
  loadExamState();
  preparePapers();
  applyPermissions();
  renderClasses();
  renderHomeworkRows();
  updateSelectedCount();
  renderVideos();
  renderStudents();
  renderAnalytics();
  renderStudentPapers();
  renderStudentAssignments();
  renderPaperQuestionNav();
  setBankAiMode(state.aiMode);
  bindEvents();
  syncLoginAccount();
  setupCanvas("gradingCanvas");
  setupCanvas("studentCanvas");
  simulateUpload();
  restoreLoginSession();
}

init();
