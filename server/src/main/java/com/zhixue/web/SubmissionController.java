package com.zhixue.web;

import com.fasterxml.jackson.databind.JsonNode;
import com.zhixue.entity.SubmissionEntity;
import com.zhixue.repo.SubmissionRepo;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

// 学生答卷/批改结果落库（交卷、批改都调用；同 id 覆盖）。
@RestController
@RequestMapping("/api")
public class SubmissionController {
    private final SubmissionRepo repo;

    public SubmissionController(SubmissionRepo repo) {
        this.repo = repo;
    }

    private String txt(JsonNode n, String k) {
        JsonNode v = n.get(k);
        return v == null || v.isNull() ? null : v.asText();
    }
    private String arr(JsonNode n, String k) {
        JsonNode v = n.get(k);
        return v == null || v.isNull() ? null : v.toString();
    }
    private int intv(JsonNode n, String k) {
        JsonNode v = n.get(k);
        return v == null || v.isNull() ? 0 : v.asInt(0);
    }
    private Integer intOrNull(JsonNode n, String k) {
        JsonNode v = n.get(k);
        return v == null || v.isNull() ? null : v.asInt();
    }

    @PostMapping("/submissions")
    public Map<String, Object> upsert(@RequestBody JsonNode b) {
        String paperId = txt(b, "paperId");
        String phone = txt(b, "studentPhone");
        String id = txt(b, "id");
        if (id == null) id = paperId + "__" + (phone == null ? "anon" : phone);
        SubmissionEntity e = repo.findById(id).orElseGet(SubmissionEntity::new);
        e.id = id;
        e.paperId = paperId;
        e.studentName = txt(b, "studentName");
        e.studentPhone = phone;
        e.answers = arr(b, "answers");
        e.score = intv(b, "score");
        e.objectiveTotal = intv(b, "objectiveTotal");
        e.unanswered = intv(b, "unanswered");
        e.pendingManual = intv(b, "pendingManual");
        e.manualScore = intOrNull(b, "manualScore");
        e.finalScore = intOrNull(b, "finalScore");
        e.feedback = txt(b, "feedback");
        JsonNode ret = b.get("returned");
        e.returned = ret != null && ret.asBoolean(false);
        e.annotations = arr(b, "annotations");
        JsonNode sub = b.get("submittedAt");
        e.submittedAt = sub == null || sub.isNull() ? System.currentTimeMillis() : sub.asLong();
        e.gradedAt = b.get("gradedAt") == null || b.get("gradedAt").isNull() ? null : b.get("gradedAt").asLong();
        repo.save(e);
        return Map.of("ok", true, "id", id);
    }

    @DeleteMapping("/submissions/{id}")
    public Map<String, Object> delete(@PathVariable("id") String id) {
        if (repo.existsById(id)) repo.deleteById(id); // 幂等：不存在也不报错
        return Map.of("ok", true, "id", id);
    }
}
