package com.zhixue.bootstrap;

import com.zhixue.entity.*;
import com.zhixue.repo.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;

// 首次启动时把演示数据写入 MySQL（真实库数据来源）。
@Component
public class DataLoader implements CommandLineRunner {
    private final PaperRepo papers;
    private final QuestionRepo questions;
    private final ClassRepo classes;
    private final UserRepo users;
    private final VideoRepo videos;
    private final KnowledgeRepo knowledge;
    private final RiskRepo risks;
    private final AssignmentRepo assignments;

    public DataLoader(PaperRepo papers, QuestionRepo questions, ClassRepo classes, UserRepo users,
                      VideoRepo videos, KnowledgeRepo knowledge, RiskRepo risks, AssignmentRepo assignments) {
        this.papers = papers;
        this.questions = questions;
        this.classes = classes;
        this.users = users;
        this.videos = videos;
        this.knowledge = knowledge;
        this.risks = risks;
        this.assignments = assignments;
    }

    @Override
    public void run(String... args) {
        ensureTeacherStudentDirectory();
        // 只要已有人员数据就不再灌种子：避免"清空试卷/题库后重启"把演示数据重复写回。
        if (users.count() > 0) return;

        // 知识点
        knowledge.save(k("安全用电", 82, 2));
        knowledge.save(k("欧姆定律", 68, 2));
        knowledge.save(k("串并联电路", 55, 2));

        // 风险学生
        risks.save(risk("王子涵", "需关注", "欧姆定律、实验表达", 0));

        // 人员账号
        users.save(user("张老师", "教师", "光明中学 / 初三(1)班", "启用", "13800000000", 0));
        users.save(user("李老师", "教师", "光明中学 / 初三(2)班", "启用", null, 1));
        AppUserEntity wang = user("王子涵", "学生", "初三(1)班", "启用", "13900000000", 2);
        fillStudent(wang);
        users.save(wang);
        users.save(user("赵管理员", "校区管理员", "光明中学校区", "启用", "13700000000", 3));

        // 班级
        ClassEntity c = new ClassEntity();
        c.name = "初三(1)班"; c.count = 1; c.owner = "张老师"; c.rate = 0;
        classes.save(c);

        // 讲解视频
        VideoEntity v = new VideoEntity();
        v.name = "电学计算真题讲解.mp4"; v.size = "186.4MB"; v.progress = 100; v.status = "已完成";
        v.owner = "张老师"; v.source = "老师上传"; v.paperTitle = "2025 大连中考物理真题练习"; v.point = "欧姆定律"; v.orderNo = 0;
        videos.save(v);

        // 题目库
        questions.save(q(0, "家庭电路中空气开关跳闸的常见原因是（ ）", "单选题", "安全用电",
                "2025 大连中考物理真题练习", "public", "系统真题库", "试卷导入", "物理", "初中", "初三",
                null, null, null, null, "2025 大连中考物理真题练习"));
        questions.save(q(1, "已知电压 6V、电阻 3Ω，求通过电阻的电流。", "填空题", "欧姆定律",
                "AI 生成", "teacher", "张老师", "AI 生成", "物理", "初中", "初三",
                "2", null, null, "[]", null));
        questions.save(q(2, "结合图像说明串联电路中电流、电压的特点。", "解答题", "串并联电路",
                "老师手动编写", "teacher", "张老师", "老师手动编写", "物理", "初中", "初三",
                "主观题", null, null, "[\"李老师\"]", null));
        questions.save(q(3, "小灯泡亮度变化与实际功率的关系练习", "单选题", "电功率",
                "公共练习库", "public", "系统推荐", "公共题", "物理", "初中", "初三",
                null, null, null, null, null));

        // 试卷（含 6 道题）
        PaperEntity p = new PaperEntity();
        p.id = "p-demo-dl";
        p.title = "2025 大连中考物理真题练习";
        p.exam = "中考真题"; p.subject = "物理"; p.stage = "初中"; p.grade = "初三";
        p.region = "大连"; p.year = 2025; p.duration = 45; p.score = 60; p.questions = 6; p.progress = 48;
        p.difficulty = "中等"; p.visibility = "public"; p.owner = "系统真题库"; p.source = "AI 从网络导入";
        p.sections = "[\"选择题 3\",\"填空题 2\",\"解答题 1\"]";
        p.tags = "[\"AI 智能搜索\",\"老师待校对\",\"可发布\"]";
        p.sharedWith = "[]";
        p.items = """
            [
              {"no":1,"type":"单选题","title":"家庭电路中空气开关跳闸的常见原因是（ ）","choices":["电路断路","电路短路","电压过低","用电器断开"],"answer":"B","score":6,"status":"未答"},
              {"no":2,"type":"单选题","title":"下列做法符合安全用电原则的是（ ）","choices":["湿手触摸开关","更换灯泡前断开电源","用铜丝代替保险丝","多个大功率电器共用插座"],"answer":"B","score":6,"status":"未答"},
              {"no":3,"type":"单选题","title":"一只标有 6V 3W 的小灯泡正常发光时电流约为（ ）","choices":["0.2A","0.5A","2A","18A"],"answer":"B","score":6,"status":"未答"},
              {"no":4,"type":"填空题","title":"电压 6V、电阻 3Ω，通过电阻的电流为 ____ A。","answer":"2","score":8,"status":"未答"},
              {"no":5,"type":"填空题","title":"串联电路中各处电流 ____，总电压等于各部分电压 ____。","answer":"相等；之和","score":10,"status":"未答"},
              {"no":6,"type":"解答题","title":"请设计一个实验验证并联电路干路电流等于各支路电流之和，写出器材、步骤和结论。","answer":"主观题待老师批改","score":24,"status":"未答"}
            ]
            """;
        papers.save(p);

        // 作业
        AssignmentEntity a = new AssignmentEntity();
        a.id = "hw-demo"; a.title = "大连中考物理真题练习"; a.paperId = "p-demo-dl"; a.className = "初三(1)班";
        a.deadline = "2026-07-01T22:00"; a.status = "待完成"; a.createdAt = 1751212800000L;
        a.kind = "作业"; a.mode = "paper"; a.orderNo = 0;
        assignments.save(a);
    }

    // 旧数据库升级后补齐老师班级与真实学生字段；数据存在 MySQL 中，不由前端生成。
    private void ensureTeacherStudentDirectory() {
        AppUserEntity teacher = users.findByPhone("13800000000").orElse(null);
        if (teacher != null) {
            teacher.role = "教师";
            teacher.name = "张老师";
            users.save(teacher);
        }

        AppUserEntity student = users.findByPhone("13900000000").orElse(null);
        if (student != null) {
            fillStudent(student);
            users.save(student);
        }

        ClassEntity cls = classes.findById("初三(1)班").orElse(null);
        if (cls != null) {
            cls.owner = "张老师";
            cls.count = (int) users.findByRoleAndClassNameOrderByNameAsc("学生", cls.name).size();
            classes.save(cls);
        }
    }

    private void fillStudent(AppUserEntity e) {
        e.className = "初三(1)班";
        e.studentNo = "GM2026001";
        e.parentPhone = "13800006000";
        e.recentScore = 72;
        e.completion = 86;
        e.risk = "需关注";
        e.weakPoint = "欧姆定律";
        e.lastLoginAt = LocalDateTime.now().minusHours(2);
    }

    private KnowledgeEntity k(String name, int mastery, int count) {
        KnowledgeEntity e = new KnowledgeEntity();
        e.name = name; e.mastery = mastery; e.count = count;
        return e;
    }

    private RiskEntity risk(String name, String risk, String point, int order) {
        RiskEntity e = new RiskEntity();
        e.name = name; e.risk = risk; e.point = point; e.orderNo = order;
        return e;
    }

    private AppUserEntity user(String name, String role, String org, String status, String phone, int order) {
        AppUserEntity e = new AppUserEntity();
        e.name = name; e.role = role; e.org = org; e.status = status; e.phone = phone; e.orderNo = order;
        return e;
    }

    private QuestionEntity q(int order, String title, String type, String point, String source,
                             String visibility, String owner, String origin, String subject,
                             String stage, String grade, String answer, String analysis,
                             String choices, String sharedWith, String paperTitle) {
        QuestionEntity e = new QuestionEntity();
        e.orderNo = order; e.title = title; e.type = type; e.point = point; e.source = source;
        e.visibility = visibility; e.owner = owner; e.origin = origin; e.subject = subject;
        e.stage = stage; e.grade = grade; e.answer = answer; e.analysis = analysis;
        e.choices = choices; e.sharedWith = sharedWith; e.paperTitle = paperTitle;
        return e;
    }
}
