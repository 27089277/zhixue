package com.zhixue.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.zhixue.entity.*;
import com.zhixue.repo.*;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.Map;

// 启动数据：前端一次拉取全部目录数据（真实来自 MySQL）。
@RestController
@RequestMapping("/api")
public class BootstrapController {
    private final ObjectMapper m;
    private final PaperRepo papers;
    private final QuestionRepo questions;
    private final ClassRepo classes;
    private final UserRepo users;
    private final VideoRepo videos;
    private final KnowledgeRepo knowledge;
    private final RiskRepo risks;
    private final AssignmentRepo assignments;
    private final SubmissionRepo submissions;

    public BootstrapController(ObjectMapper m, PaperRepo papers, QuestionRepo questions, ClassRepo classes,
                               UserRepo users, VideoRepo videos, KnowledgeRepo knowledge, RiskRepo risks,
                               AssignmentRepo assignments, SubmissionRepo submissions) {
        this.m = m;
        this.papers = papers;
        this.questions = questions;
        this.classes = classes;
        this.users = users;
        this.videos = videos;
        this.knowledge = knowledge;
        this.risks = risks;
        this.assignments = assignments;
        this.submissions = submissions;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "ok");
    }

    @GetMapping("/bootstrap")
    public ObjectNode bootstrap() {
        ObjectNode root = m.createObjectNode();

        ArrayNode papersArr = root.putArray("papers");
        papers.findAll().forEach(p -> papersArr.add(paperNode(p)));

        ArrayNode qArr = root.putArray("questions");
        // 按 id 倒序：最新创建/生成的题排在最前
        questions.findAll().stream()
                .sorted(Comparator.comparing((QuestionEntity q) -> q.id).reversed())
                .forEach(q -> qArr.add(questionNode(q)));

        ArrayNode classesArr = root.putArray("classes");
        classes.findAll().forEach(c -> {
            ObjectNode n = classesArr.addObject();
            n.put("name", c.name);
            n.put("count", c.count);
            n.put("owner", c.owner);
            n.put("rate", c.rate);
        });

        ArrayNode usersArr = root.putArray("users");
        users.findAll().stream().sorted(Comparator.comparingInt(u -> u.orderNo)).forEach(u -> {
            ObjectNode n = usersArr.addObject();
            n.put("id", u.id);
            n.put("name", u.name);
            n.put("role", u.role);
            n.put("org", u.org);
            n.put("status", u.status);
            if (u.phone != null) n.put("phone", u.phone);
        });

        ArrayNode videosArr = root.putArray("videos");
        videos.findAll().stream().sorted(Comparator.comparingInt(v -> v.orderNo)).forEach(v -> {
            ObjectNode n = videosArr.addObject();
            n.put("id", v.id);
            n.put("name", v.name);
            n.put("size", v.size);
            n.put("progress", v.progress);
            n.put("status", v.status);
            n.put("owner", v.owner);
            n.put("source", v.source);
            n.put("paperTitle", v.paperTitle);
            n.put("point", v.point);
        });

        ArrayNode kArr = root.putArray("knowledge");
        knowledge.findAll().forEach(k -> {
            ObjectNode n = kArr.addObject();
            n.put("name", k.name);
            n.put("mastery", k.mastery);
            n.put("count", k.count);
        });

        ArrayNode riskArr = root.putArray("risk");
        risks.findAll().stream().sorted(Comparator.comparingInt(r -> r.orderNo)).forEach(r -> {
            ObjectNode n = riskArr.addObject();
            n.put("name", r.name);
            n.put("risk", r.risk);
            n.put("point", r.point);
        });

        ArrayNode aArr = root.putArray("assignments");
        assignments.findAll().stream().sorted(Comparator.comparingInt(a -> a.orderNo)).forEach(a -> {
            ObjectNode n = aArr.addObject();
            n.put("id", a.id);
            n.put("title", a.title);
            n.put("paperId", a.paperId);
            n.put("className", a.className);
            n.put("deadline", a.deadline);
            n.put("status", a.status);
            n.put("createdAt", a.createdAt);
            n.put("kind", a.kind);
            n.put("mode", a.mode);
            if (a.questionCount != null) n.put("questionCount", a.questionCount);
            if (a.timeLimit != null) n.put("timeLimit", a.timeLimit);
            if (a.allowRedo != null) n.put("allowRedo", a.allowRedo);
        });

        ArrayNode subArr = root.putArray("submissions");
        submissions.findAll().forEach(sb -> {
            ObjectNode n = subArr.addObject();
            n.put("id", sb.id);
            n.put("paperId", sb.paperId);
            n.put("studentName", sb.studentName);
            n.put("studentPhone", sb.studentPhone);
            n.set("answers", JsonUtil.parse(m, sb.answers, false));
            n.put("score", sb.score);
            n.put("objectiveTotal", sb.objectiveTotal);
            n.put("unanswered", sb.unanswered);
            n.put("pendingManual", sb.pendingManual);
            if (sb.manualScore != null) n.put("manualScore", sb.manualScore);
            if (sb.finalScore != null) n.put("finalScore", sb.finalScore);
            if (sb.feedback != null) n.put("feedback", sb.feedback);
            n.put("returned", sb.returned);
            n.set("annotations", JsonUtil.parse(m, sb.annotations, false));
            n.put("submittedAt", sb.submittedAt);
            if (sb.gradedAt != null) n.put("gradedAt", sb.gradedAt);
        });

        return root;
    }

    private ObjectNode paperNode(PaperEntity p) {
        ObjectNode n = m.createObjectNode();
        n.put("id", p.id);
        n.put("title", p.title);
        n.put("exam", p.exam);
        n.put("subject", p.subject);
        if (p.stage != null) n.put("stage", p.stage);
        if (p.grade != null) n.put("grade", p.grade);
        n.put("region", p.region);
        n.put("year", p.year);
        n.put("duration", p.duration);
        n.put("score", p.score);
        n.put("questions", p.questions);
        n.put("progress", p.progress);
        n.put("difficulty", p.difficulty);
        n.put("visibility", p.visibility);
        n.put("owner", p.owner);
        n.put("source", p.source);
        n.set("sections", JsonUtil.parse(m, p.sections, true));
        n.set("tags", JsonUtil.parse(m, p.tags, true));
        n.set("sharedWith", JsonUtil.parse(m, p.sharedWith, true));
        n.set("items", JsonUtil.parse(m, p.items, true));
        return n;
    }

    private ObjectNode questionNode(QuestionEntity q) {
        ObjectNode n = m.createObjectNode();
        n.put("id", q.id);
        n.put("title", q.title);
        n.put("type", q.type);
        n.put("point", q.point);
        n.put("source", q.source);
        n.put("visibility", q.visibility);
        n.put("owner", q.owner);
        n.put("origin", q.origin);
        if (q.subject != null) n.put("subject", q.subject);
        if (q.stage != null) n.put("stage", q.stage);
        if (q.grade != null) n.put("grade", q.grade);
        if (q.difficulty != null) n.put("difficulty", q.difficulty);
        if (q.paperId != null) n.put("paperId", q.paperId);
        if (q.paperTitle != null) n.put("paperTitle", q.paperTitle);
        if (q.answer != null) n.put("answer", q.answer);
        if (q.analysis != null) n.put("analysis", q.analysis);
        if (q.choices != null) n.set("choices", JsonUtil.parse(m, q.choices, true));
        if (q.sharedWith != null) n.set("sharedWith", JsonUtil.parse(m, q.sharedWith, true));
        if (q.images != null) n.set("images", JsonUtil.parse(m, q.images, true));
        if (q.videoName != null) n.put("videoName", q.videoName);
        if (q.videoUrl != null) n.put("videoUrl", q.videoUrl);
        return n;
    }
}
