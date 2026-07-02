package com.zhixue.ai;

import org.springframework.stereotype.Service;

// 本地嵌入：无需外部 key。用字符 uni/bi-gram 的特征哈希（feature hashing）+ L2 归一化，
// 生成固定维向量，适合中文题目的主题相似度检索（如“串并联”能召回相关题）。
@Service
public class EmbeddingService {
    public static final int DIM = 256;

    public float[] embed(String text) {
        float[] v = new float[DIM];
        if (text == null) return v;
        String t = text.replaceAll("\\s+", "");
        if (t.isEmpty()) return v;
        char[] cs = t.toCharArray();
        for (int i = 0; i < cs.length; i++) {
            add(v, String.valueOf(cs[i]));                       // unigram
            if (i + 1 < cs.length) add(v, "" + cs[i] + cs[i + 1]); // bigram
        }
        // L2 归一化
        double norm = 0;
        for (float x : v) norm += x * (double) x;
        norm = Math.sqrt(norm);
        if (norm > 0) for (int i = 0; i < DIM; i++) v[i] /= (float) norm;
        return v;
    }

    private void add(float[] v, String gram) {
        int h = gram.hashCode();
        int bucket = Math.floorMod(h, DIM);
        int sign = Math.floorMod(h >> 16, 2) == 0 ? 1 : -1; // 带符号哈希，降低碰撞偏置
        v[bucket] += sign;
    }

    public static double cosine(float[] a, float[] b) {
        // 两者均已 L2 归一化 → 点积即余弦
        double dot = 0;
        for (int i = 0; i < a.length && i < b.length; i++) dot += a[i] * (double) b[i];
        return dot;
    }

    public String toVectorLiteral(float[] v) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < v.length; i++) {
            if (i > 0) sb.append(',');
            sb.append(v[i]);
        }
        return sb.append(']').toString();
    }

    public float[] parseVectorLiteral(String s) {
        float[] v = new float[DIM];
        if (s == null) return v;
        String body = s.replace("[", "").replace("]", "").trim();
        if (body.isEmpty()) return v;
        String[] parts = body.split(",");
        for (int i = 0; i < parts.length && i < DIM; i++) {
            try { v[i] = Float.parseFloat(parts[i].trim()); } catch (Exception ignore) {}
        }
        return v;
    }
}
