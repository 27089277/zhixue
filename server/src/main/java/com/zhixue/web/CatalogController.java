package com.zhixue.web;

import com.fasterxml.jackson.databind.JsonNode;
import com.zhixue.ai.VectorStore;
import com.zhixue.ai.PaperVectorStore;
import com.zhixue.entity.*;
import com.zhixue.repo.*;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

// 写入/删除接口：前端新增、导入、删除、编辑都真实落库 MySQL。
@RestController
@RequestMapping("/api")
public class CatalogController {
    private final QuestionRepo questions;
    private final PaperRepo papers;
    private final VideoRepo videos;
    private final UserRepo users;
    private final ClassRepo classes;
    private final AssignmentRepo assignments;
    private final VectorStore vectorStore;
    private final PaperVectorStore paperVectors;

    public CatalogController(QuestionRepo questions, PaperRepo papers, VideoRepo videos,
                             UserRepo users, ClassRepo classes, AssignmentRepo assignments,
                             VectorStore vectorStore, PaperVectorStore paperVectors) {
        this.questions = questions;
        this.papers = papers;
        this.videos = videos;
        this.users = users;
        this.classes = classes;
        this.assignments = assignments;
        this.vectorStore = vectorStore;
        this.paperVectors = paperVectors;
    }

    private void fillQuestion(QuestionEntity e, JsonNode b) {
        e.title = txt(b, "title");
        e.type = txt(b, "type");
        e.point = txt(b, "point");
        e.source = txt(b, "source");
        e.visibility = txt(b, "visibility");
        e.owner = txt(b, "owner");
        e.origin = txt(b, "origin");
        e.subject = txt(b, "subject");
        e.stage = txt(b, "stage");
        e.grade = txt(b, "grade");
        e.difficulty = txt(b, "difficulty");
        e.answer = txt(b, "answer");
        e.analysis = txt(b, "analysis");
        e.paperId = txt(b, "paperId");
        e.paperTitle = txt(b, "paperTitle");
        e.choices = arr(b, "choices");
        e.sharedWith = arr(b, "sharedWith");
        e.images = arr(b, "images");
        e.videoName = txt(b, "videoName");
        e.videoUrl = txt(b, "videoUrl");
    }

    private String txt(JsonNode n, String k) {
        JsonNode v = n.get(k);
        return v == null || v.isNull() ? null : v.asText();
    }
    private String arr(JsonNode n, String k) {
        JsonNode v = n.get(k);
        return v == null || v.isNull() ? null : v.toString();
    }
    private int intv(JsonNode n, String k, int def) {
        JsonNode v = n.get(k);
        return v == null || v.isNull() ? def : v.asInt(def);
    }

    @PostMapping("/questions")
    public Map<String, Object> createQuestion(@RequestBody JsonNode b) {
        QuestionEntity e = new QuestionEntity();
        fillQuestion(e, b);
        e.orderNo = (int) (questions.count());
        questions.save(e);
        vectorStore.reindex(e.id); // 入向量库
        return Map.of("ok", true, "id", e.id);
    }

    @PutMapping("/questions/{id}")
    public Map<String, Object> updateQuestion(@PathVariable Long id, @RequestBody JsonNode b) {
        QuestionEntity e = questions.findById(id).orElseGet(QuestionEntity::new);
        int order = e.orderNo;
        fillQuestion(e, b);
        e.id = id;
        e.orderNo = order;
        questions.save(e);
        vectorStore.reindex(id); // 更新向量
        return Map.of("ok", true, "id", id);
    }

    @PostMapping("/videos")
    public Map<String, Object> createVideo(@RequestBody JsonNode b) {
        VideoEntity e = new VideoEntity();
        e.name = txt(b, "name");
        e.size = txt(b, "size");
        e.progress = intv(b, "progress", 0);
        e.status = txt(b, "status");
        e.owner = txt(b, "owner");
        e.source = txt(b, "source");
        e.paperTitle = txt(b, "paperTitle");
        e.point = txt(b, "point");
        e.orderNo = (int) videos.count();
        videos.save(e);
        return Map.of("ok", true, "id", e.id);
    }

    @PostMapping("/users")
    public Map<String, Object> createUser(@RequestBody JsonNode b) {
        AppUserEntity e = new AppUserEntity();
        e.name = txt(b, "name");
        e.role = txt(b, "role");
        e.org = txt(b, "org");
        e.status = txt(b, "status");
        e.phone = txt(b, "phone");
        // 学生可带班级/学号/家长电话/成绩等（新增学生到班级用）
        e.className = txt(b, "className");
        e.studentNo = txt(b, "studentNo");
        e.parentPhone = txt(b, "parentPhone");
        JsonNode rs = b.get("recentScore");
        e.recentScore = rs == null || rs.isNull() ? null : rs.asInt();
        JsonNode cp = b.get("completion");
        e.completion = cp == null || cp.isNull() ? null : cp.asInt();
        e.risk = txt(b, "risk");
        e.weakPoint = txt(b, "weakPoint");
        e.orderNo = (int) users.count();
        users.save(e);
        return Map.of("ok", true, "id", e.id);
    }

    @PostMapping("/classes")
    public Map<String, Object> upsertClass(@RequestBody JsonNode b) {
        ClassEntity e = new ClassEntity();
        e.name = txt(b, "name");
        e.count = intv(b, "count", 0);
        e.owner = txt(b, "owner");
        e.rate = intv(b, "rate", 0);
        classes.save(e);
        return Map.of("ok", true, "name", e.name);
    }

    @PostMapping("/assignments")
    public Map<String, Object> createAssignment(@RequestBody JsonNode b) {
        AssignmentEntity e = new AssignmentEntity();
        e.id = txt(b, "id") != null ? txt(b, "id") : "hw-" + System.currentTimeMillis();
        e.title = txt(b, "title");
        e.paperId = txt(b, "paperId");
        e.className = txt(b, "className");
        e.deadline = txt(b, "deadline");
        e.status = txt(b, "status");
        JsonNode ca = b.get("createdAt");
        e.createdAt = ca == null || ca.isNull() ? System.currentTimeMillis() : ca.asLong();
        e.kind = txt(b, "kind");
        e.mode = txt(b, "mode");
        e.questionCount = intv(b, "questionCount", 0);
        JsonNode tl = b.get("timeLimit");
        e.timeLimit = tl == null || tl.isNull() ? null : tl.asInt();
        JsonNode rd = b.get("allowRedo");
        e.allowRedo = rd != null && rd.asBoolean(false);
        e.orderNo = (int) assignments.count();
        assignments.save(e);
        return Map.of("ok", true, "id", e.id);
    }

    @DeleteMapping("/questions/{id}")
    public Map<String, Object> deleteQuestion(@PathVariable Long id) {
        questions.deleteById(id);
        return Map.of("ok", true);
    }

    @DeleteMapping("/papers/{id}")
    public Map<String, Object> deletePaper(@PathVariable String id) {
        papers.deleteById(id);
        return Map.of("ok", true);
    }

    @DeleteMapping("/videos/{id}")
    public Map<String, Object> deleteVideo(@PathVariable Long id) {
        videos.deleteById(id);
        return Map.of("ok", true);
    }

    @DeleteMapping("/users/{id}")
    public Map<String, Object> deleteUser(@PathVariable Long id) {
        users.deleteById(id);
        return Map.of("ok", true);
    }

    @DeleteMapping("/classes/{name}")
    public Map<String, Object> deleteClass(@PathVariable String name) {
        classes.deleteById(name);
        return Map.of("ok", true);
    }

    @PostMapping("/papers")
    public Map<String, Object> createPaper(@RequestBody JsonNode b) {
        PaperEntity p = new PaperEntity();
        p.id = txt(b, "id") != null ? txt(b, "id") : "paper-" + System.currentTimeMillis();
        p.title = txt(b, "title");
        p.exam = txt(b, "exam");
        p.subject = txt(b, "subject");
        p.stage = txt(b, "stage");
        p.grade = txt(b, "grade");
        p.region = txt(b, "region");
        p.year = intv(b, "year", 2025);
        p.duration = intv(b, "duration", 100);
        p.score = intv(b, "score", 120);
        p.questions = intv(b, "questions", 0);
        p.progress = intv(b, "progress", 0);
        p.difficulty = txt(b, "difficulty");
        p.visibility = txt(b, "visibility");
        p.owner = txt(b, "owner");
        p.source = txt(b, "source");
        p.sections = arr(b, "sections");
        p.tags = arr(b, "tags");
        p.sharedWith = arr(b, "sharedWith");
        p.items = arr(b, "items");
        papers.save(p);
        paperVectors.reindex(p.id); // 入试卷向量库
        return Map.of("ok", true, "id", p.id);
    }
}
