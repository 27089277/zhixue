package com.zhixue.web;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

public final class JsonUtil {
    private JsonUtil() {}

    // 把存库的 JSON 文本解析成节点，供响应直接嵌入数组/对象。
    public static JsonNode parse(ObjectMapper m, String text, boolean array) {
        try {
            if (text == null || text.isBlank()) {
                return array ? m.createArrayNode() : m.createObjectNode();
            }
            return m.readTree(text);
        } catch (Exception e) {
            return array ? m.createArrayNode() : m.createObjectNode();
        }
    }
}
