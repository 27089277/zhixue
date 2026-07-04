package com.zhixue.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

// AI 接口：代理 DeepSeek，失败时返回结构化兜底（fallback=true），保证前端不崩。
@RestController
@RequestMapping("/api/ai")
public class AiController {
    private final DeepSeekService deepseek;
    private final ObjectMapper m;
    private final VectorStore vectorStore;
    private final PaperVectorStore paperVectors;

    public AiController(DeepSeekService deepseek, ObjectMapper m, VectorStore vectorStore, PaperVectorStore paperVectors) {
        this.deepseek = deepseek;
        this.m = m;
        this.vectorStore = vectorStore;
        this.paperVectors = paperVectors;
    }

    // 向量库语义检索题目：返回按相似度排序的题目 id（Top-k）。
    @PostMapping("/search-questions")
    public ObjectNode searchQuestions(@RequestBody Map<String, Object> b) {
        String query = str(b, "query", "");
        int k = intv(b, "k", 20);
        var ids = vectorStore.search(query, k);
        ObjectNode res = m.createObjectNode();
        var arr = res.putArray("ids");
        ids.forEach(arr::add);
        return wrap(res, false);
    }

    // 向量库语义检索试卷：返回按相似度排序的试卷 id。
    @PostMapping("/search-papers")
    public ObjectNode searchPapers(@RequestBody Map<String, Object> b) {
        String query = str(b, "query", "");
        int k = intv(b, "k", 30);
        var ids = paperVectors.search(query, k);
        ObjectNode res = m.createObjectNode();
        var arr = res.putArray("ids");
        ids.forEach(arr::add);
        return wrap(res, false);
    }

    private ObjectNode wrap(JsonNode result, boolean fallback) {
        ObjectNode r = m.createObjectNode();
        r.put("provider", "deepseek");
        r.put("model", "deepseek-chat");
        r.put("fallback", fallback);
        r.set("result", result);
        return r;
    }

    private String str(Map<String, Object> b, String k, String def) {
        Object v = b.get(k);
        return v == null ? def : String.valueOf(v);
    }

    private int intv(Map<String, Object> b, String k, int def) {
        Object v = b.get(k);
        if (v == null) return def;
        try { return (int) Double.parseDouble(String.valueOf(v)); } catch (Exception e) { return def; }
    }

    @PostMapping("/generate-questions")
    public ObjectNode generate(@RequestBody Map<String, Object> b) {
        String subject = str(b, "subject", "数学");
        String point = str(b, "knowledge_point", "综合应用");
        String type = str(b, "question_type", "单选题");
        String difficulty = str(b, "difficulty", "中等");
        int count = intv(b, "count", 6);
        String grade = str(b, "grade", "");   // 学段/年级，如「小学三年级」「初二」；空则不限定
        String notes = str(b, "notes", "");    // 老师/学生的原始一句话要求，用于精确贴合难度与范围
        String forWhom = grade.isEmpty() ? "" : ("面向" + grade + "学生的");
        String sys = "你是资深" + subject + "老师，严格按老师要求出题，题目难度和范围务必贴合指定学段与知识点，只输出 JSON 对象。";
        String user = "请严格生成正好 " + count + " 道" + forWhom + "关于「" + point + "」的" + subject + type + "，难度" + difficulty + "。"
                + (notes.isEmpty() ? "" : ("老师的原话要求：" + notes + "。请完全按此理解难度与范围。"))
                + "特别注意：题目要严格贴合上述学段与知识点，不得超纲复杂化——例如「小学十以内加减法」就只出「3+2=?」「7-4=?」这类简单直白的题；"
                + "必须正好 " + count + " 道，不能多也不能少。返回 JSON：{\"questions\":[{\"stem\":\"题干\",\"type\":\"" + type +
                "\",\"options\":[\"A选项\",\"B选项\",\"C选项\",\"D选项\"],\"standard_answer\":\"答案\",\"analysis\":\"解析\",\"knowledge_points\":[\"" + point +
                "\"],\"score\":4,\"difficulty\":\"" + difficulty + "\"}]}。填空/解答题 options 用空数组。";
        JsonNode r = deepseek.completeJson(sys, user);
        if (r != null && r.has("questions") && r.get("questions").isArray()) {
            // 严格对齐数量：多则裁剪（少则原样返回，前端会提示）
            ArrayNode src = (ArrayNode) r.get("questions");
            if (src.size() > count && r instanceof ObjectNode) {
                ArrayNode trimmed = m.createArrayNode();
                for (int i = 0; i < count; i++) trimmed.add(src.get(i));
                ((ObjectNode) r).set("questions", trimmed);
            }
            return wrap(r, false);
        }
        // DeepSeek 不可用/无返回：不再编造占位题，返回空 + 错误，前端据此提示失败、不入库。
        ObjectNode res = m.createObjectNode();
        res.putArray("questions");
        res.put("error", "AI 暂时不可用，请稍后重试");
        return wrap(res, true);
    }

    @PostMapping("/assemble-paper")
    public ObjectNode assemble(@RequestBody Map<String, Object> b) {
        String title = str(b, "title", "AI 智能组卷");
        String subject = str(b, "subject", "数学");
        int count = intv(b, "question_count", 12);
        int total = intv(b, "total_score", 100);
        String sys = "你是命题专家，只输出 JSON 对象。";
        String user = "为《" + title + "》(" + subject + ", 共" + count + "题, 满分" + total +
                ") 设计组卷蓝图。返回 JSON：{\"paper\":{\"title\":\"" + title + "\",\"subject\":\"" + subject +
                "\",\"exam_type\":\"测验\",\"total_score\":" + total + ",\"duration_minutes\":45,\"sections\":[\"选择题 6\",\"填空题 4\",\"解答题 2\"]}," +
                "\"blueprint\":[{\"section\":\"选择题\",\"question_type\":\"单选题\",\"count\":6,\"score_each\":4,\"knowledge_points\":[]}]}";
        JsonNode r = deepseek.completeJson(sys, user);
        if (r != null && r.has("blueprint")) return wrap(r, false);
        ObjectNode res = m.createObjectNode();
        ObjectNode paper = res.putObject("paper");
        paper.put("title", title); paper.put("subject", subject); paper.put("exam_type", "测验");
        paper.put("total_score", total); paper.put("duration_minutes", 45);
        ArrayNode secs = paper.putArray("sections");
        secs.add("选择题 6"); secs.add("填空题 4"); secs.add("解答题 2");
        ArrayNode bp = res.putArray("blueprint");
        ObjectNode s1 = bp.addObject(); s1.put("section", "选择题"); s1.put("question_type", "单选题"); s1.put("count", 6); s1.put("score_each", 4);
        ObjectNode s2 = bp.addObject(); s2.put("section", "填空题"); s2.put("question_type", "填空题"); s2.put("count", 4); s2.put("score_each", 5);
        ObjectNode s3 = bp.addObject(); s3.put("section", "解答题"); s3.put("question_type", "解答题"); s3.put("count", 2); s3.put("score_each", 12);
        return wrap(res, true);
    }

    @PostMapping({"/web-import-paper", "/import-paper"})
    public ObjectNode importPaper(@RequestBody Map<String, Object> b) {
        String subject = str(b, "subject", "物理");
        String exam = str(b, "exam_type", "中考真题");
        String region = str(b, "region", "本地");
        int year = intv(b, "year", 2025);
        int count = intv(b, "question_count", 24);
        int total = intv(b, "total_score", 120);
        String title = str(b, "title", year + " " + region + exam + subject + "卷");
        String sys = "你是真题解析专家，只输出 JSON 对象。";
        String user = "解析/生成《" + title + "》的结构化题目。返回 JSON：{\"paper\":{\"title\":\"" + title +
                "\",\"subject\":\"" + subject + "\",\"exam_type\":\"" + exam + "\",\"region\":\"" + region + "\",\"year\":" + year +
                ",\"total_score\":" + total + ",\"duration_minutes\":100,\"sections\":[]}," +
                "\"questions\":[{\"number\":1,\"type\":\"单选题\",\"stem\":\"题干\",\"options\":[\"A\",\"B\",\"C\",\"D\"],\"standard_answer\":\"A\",\"analysis\":\"解析\",\"score\":4,\"knowledge_points\":[]}]}。至少 " + Math.min(count, 8) + " 题。";
        JsonNode r = deepseek.completeJson(sys, user);
        if (r != null && r.has("questions")) return wrap(r, false);
        // DeepSeek 不可用：不编造占位真题，返回空 + 错误，前端提示失败。
        ObjectNode res = m.createObjectNode();
        res.putArray("questions");
        res.put("error", "AI 暂时不可用，请稍后重试");
        return wrap(res, true);
    }

    // 真·GenAI 从题库选题：把候选题交给 DeepSeek 语义筛选，返回命中的编号。
    @PostMapping("/select-from-bank")
    public ObjectNode selectFromBank(@RequestBody Map<String, Object> b) {
        String query = str(b, "query", "");
        Object cand = b.get("candidates");
        String candJson;
        try {
            candJson = m.writeValueAsString(cand);
        } catch (Exception e) {
            candJson = "[]";
        }
        String sys = "你是资深命题老师，从给定题库候选中挑选最符合需求的题目，只输出 JSON。";
        String user = "需求：" + query + "\n候选题目（JSON，每项含 id 和 text）：" + candJson +
                "\n请只返回符合需求的题目：{\"ids\":[命中的 id 数组]}。若无匹配返回 {\"ids\":[]}。";
        JsonNode r = deepseek.completeJson(sys, user);
        if (r != null && r.has("ids")) return wrap(r, false);
        // 兜底：返回空，前端会退回本地匹配
        ObjectNode res = m.createObjectNode();
        res.putArray("ids");
        return wrap(res, true);
    }

    @PostMapping("/analyze")
    public ObjectNode analyze(@RequestBody Map<String, Object> b) {
        String scene = str(b, "scene", "当前模块");
        String question = str(b, "question", "");
        Object ctx = b.get("context");
        String ctxJson = "";
        if (ctx != null) {
            try { ctxJson = m.writeValueAsString(ctx); } catch (Exception ignore) {}
        }
        String sys = "你是资深教学分析助手，基于给定数据做学情分析，只输出 JSON 对象，建议要具体、可执行。";
        String user = "针对「" + scene + "」给出分析。"
                + (question.isBlank() ? "" : "\n分析要求：" + question)
                + (ctxJson.isBlank() ? "" : "\n数据（JSON）：" + ctxJson)
                + "\n返回 JSON：{\"summary\":\"一句话结论\",\"insights\":[{\"title\":\"建议\",\"detail\":\"...\",\"priority\":\"高\"}],\"actions\":[{\"label\":\"动作\",\"target_module\":\"homework\",\"reason\":\"...\"}],\"risks\":[{\"name\":\"风险\",\"reason\":\"...\",\"suggestion\":\"...\"}]}";
        JsonNode r = deepseek.completeJson(sys, user);
        if (r != null && r.has("summary")) return wrap(r, false);
        ObjectNode res = m.createObjectNode();
        res.put("summary", scene + " AI 分析已生成");
        ArrayNode ins = res.putArray("insights");
        ObjectNode i1 = ins.addObject(); i1.put("title", "重点建议"); i1.put("detail", "优先处理待批主观题并提醒未提交学生。"); i1.put("priority", "高");
        ArrayNode acts = res.putArray("actions");
        ObjectNode a1 = acts.addObject(); a1.put("label", "推送个性化练习"); a1.put("target_module", "homework"); a1.put("reason", "针对薄弱知识点补练");
        ArrayNode rk = res.putArray("risks");
        ObjectNode r1 = rk.addObject(); r1.put("name", "数据需复核"); r1.put("reason", "当前为原型数据"); r1.put("suggestion", "接入正式库后再自动执行");
        return wrap(res, true);
    }
}
