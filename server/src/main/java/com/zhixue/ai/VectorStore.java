package com.zhixue.ai;

import jakarta.annotation.PostConstruct;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

// 题目向量库：向量存 MySQL 原生 VECTOR 列（STRING_TO_VECTOR/VECTOR_TO_STRING），
// 最近邻检索在应用侧用余弦（MySQL Community 无 DISTANCE 函数）。
@Service
public class VectorStore {
    private final JdbcTemplate jdbc;
    private final EmbeddingService embedding;

    public VectorStore(JdbcTemplate jdbc, EmbeddingService embedding) {
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
                            "WHERE table_schema = DATABASE() AND table_name='questions' AND column_name='embedding'",
                    Integer.class);
            if (exists == null || exists == 0) {
                jdbc.execute("ALTER TABLE questions ADD COLUMN embedding VECTOR(" + EmbeddingService.DIM + ")");
            }
        } catch (Exception e) {
            // 建列失败不致命，检索会返回空、前端走本地兜底
            System.err.println("[VectorStore] ensureColumn failed: " + e.getMessage());
        }
    }

    // 为尚无向量的题目补算向量
    public void backfill() {
        try {
            List<Long> ids = jdbc.queryForList(
                    "SELECT id FROM questions WHERE embedding IS NULL", Long.class);
            for (Long id : ids) reindex(id);
            if (!ids.isEmpty()) System.out.println("[VectorStore] backfilled " + ids.size() + " questions");
        } catch (Exception e) {
            System.err.println("[VectorStore] backfill failed: " + e.getMessage());
        }
    }

    private String textOf(Long id) {
        try {
            // 只用知识点+题干做向量：聚焦“内容”，避免“物理/初中”这类学科词让所有同科题都相似
            return jdbc.queryForObject(
                    "SELECT CONCAT_WS(' ', COALESCE(point,''), COALESCE(point,''), COALESCE(title,'')) " +
                            "FROM questions WHERE id=?",
                    String.class, id);
        } catch (Exception e) {
            return null;
        }
    }

    // 重新计算并写入某题向量
    public void reindex(Long id) {
        try {
            String text = textOf(id);
            if (text == null) return;
            String lit = embedding.toVectorLiteral(embedding.embed(text));
            jdbc.update("UPDATE questions SET embedding = STRING_TO_VECTOR(?) WHERE id=?", lit, id);
        } catch (Exception e) {
            System.err.println("[VectorStore] reindex " + id + " failed: " + e.getMessage());
        }
    }

    public void delete(Long id) {
        // 行随题目删除即可，无需额外处理
    }

    // 向量近邻检索：返回按相似度排序的题目 id（Top-k）
    public List<Long> search(String query, int k) {
        List<Long> result = new ArrayList<>();
        try {
            float[] q = embedding.embed(query);
            List<java.util.Map<String, Object>> rows = jdbc.queryForList(
                    "SELECT id, VECTOR_TO_STRING(embedding) AS v FROM questions WHERE embedding IS NOT NULL");
            record Scored(long id, double score) {}
            List<Scored> scored = new ArrayList<>();
            for (var row : rows) {
                long id = ((Number) row.get("id")).longValue();
                float[] v = embedding.parseVectorLiteral((String) row.get("v"));
                scored.add(new Scored(id, EmbeddingService.cosine(q, v)));
            }
            scored.sort(Comparator.comparingDouble(Scored::score).reversed());
            if (scored.isEmpty()) return result;
            double top = scored.get(0).score();
            // 相对阈值：只保留与最相关题接近的（避免把全部同科题都带出来）
            double cut = Math.max(0.15, top * 0.55);
            for (int i = 0; i < Math.min(k, scored.size()); i++) {
                if (scored.get(i).score() >= cut) result.add(scored.get(i).id());
            }
        } catch (Exception e) {
            System.err.println("[VectorStore] search failed: " + e.getMessage());
        }
        return result;
    }
}
