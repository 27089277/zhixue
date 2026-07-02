package com.zhixue.ai;

import jakarta.annotation.PostConstruct;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

// 试卷向量库：与题目向量库同构。向量存 papers.embedding(VECTOR)，最近邻在应用侧余弦。
@Service
public class PaperVectorStore {
    private final JdbcTemplate jdbc;
    private final EmbeddingService embedding;

    public PaperVectorStore(JdbcTemplate jdbc, EmbeddingService embedding) {
        this.jdbc = jdbc;
        this.embedding = embedding;
    }

    @PostConstruct
    public void init() {
        ensureColumn();
        backfill();
    }

    private void ensureColumn() {
        try {
            Integer exists = jdbc.queryForObject(
                    "SELECT COUNT(*) FROM information_schema.columns " +
                            "WHERE table_schema = DATABASE() AND table_name='papers' AND column_name='embedding'",
                    Integer.class);
            if (exists == null || exists == 0) {
                jdbc.execute("ALTER TABLE papers ADD COLUMN embedding VECTOR(" + EmbeddingService.DIM + ")");
            }
        } catch (Exception e) {
            System.err.println("[PaperVectorStore] ensureColumn failed: " + e.getMessage());
        }
    }

    public void backfill() {
        try {
            List<String> ids = jdbc.queryForList("SELECT id FROM papers WHERE embedding IS NULL", String.class);
            for (String id : ids) reindex(id);
            if (!ids.isEmpty()) System.out.println("[PaperVectorStore] backfilled " + ids.size() + " papers");
        } catch (Exception e) {
            System.err.println("[PaperVectorStore] backfill failed: " + e.getMessage());
        }
    }

    private String textOf(String id) {
        try {
            // 标题权重更高 + 学科/考试类型/地区
            return jdbc.queryForObject(
                    "SELECT CONCAT_WS(' ', title, title, COALESCE(subject,''), COALESCE(exam,''), COALESCE(region,'')) " +
                            "FROM papers WHERE id=?",
                    String.class, id);
        } catch (Exception e) {
            return null;
        }
    }

    public void reindex(String id) {
        try {
            String text = textOf(id);
            if (text == null) return;
            String lit = embedding.toVectorLiteral(embedding.embed(text));
            jdbc.update("UPDATE papers SET embedding = STRING_TO_VECTOR(?) WHERE id=?", lit, id);
        } catch (Exception e) {
            System.err.println("[PaperVectorStore] reindex " + id + " failed: " + e.getMessage());
        }
    }

    public List<String> search(String query, int k) {
        List<String> result = new ArrayList<>();
        try {
            float[] q = embedding.embed(query);
            List<java.util.Map<String, Object>> rows = jdbc.queryForList(
                    "SELECT id, VECTOR_TO_STRING(embedding) AS v FROM papers WHERE embedding IS NOT NULL");
            record Scored(String id, double score) {}
            List<Scored> scored = new ArrayList<>();
            for (var row : rows) {
                String id = (String) row.get("id");
                float[] v = embedding.parseVectorLiteral((String) row.get("v"));
                scored.add(new Scored(id, EmbeddingService.cosine(q, v)));
            }
            scored.sort(Comparator.comparingDouble(Scored::score).reversed());
            if (scored.isEmpty()) return result;
            double top = scored.get(0).score();
            double cut = Math.max(0.15, top * 0.55);
            for (int i = 0; i < Math.min(k, scored.size()); i++) {
                if (scored.get(i).score() >= cut) result.add(scored.get(i).id());
            }
        } catch (Exception e) {
            System.err.println("[PaperVectorStore] search failed: " + e.getMessage());
        }
        return result;
    }
}
