package com.zhixue.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

// DeepSeek 调用封装（OpenAI 兼容 /chat/completions），强制返回 JSON。
@Service
public class DeepSeekService {
    private final ObjectMapper m;

    @Value("${deepseek.api-key:}")
    private String apiKey;
    @Value("${deepseek.base-url:https://api.deepseek.com}")
    private String baseUrl;
    @Value("${deepseek.model:deepseek-chat}")
    private String model;
    @Value("${deepseek.timeout-seconds:90}")
    private long timeoutSeconds;

    public DeepSeekService(ObjectMapper m) {
        this.m = m;
    }

    public boolean configured() {
        return apiKey != null && !apiKey.isBlank();
    }

    /** 返回模型输出的 JSON 节点；失败或未配置返回 null（调用方走兜底）。 */
    public JsonNode completeJson(String system, String user) {
        if (!configured()) return null;
        try {
            ObjectNode body = m.createObjectNode();
            body.put("model", model);
            body.put("temperature", 0.4);
            ObjectNode fmt = body.putObject("response_format");
            fmt.put("type", "json_object");
            var messages = body.putArray("messages");
            messages.addObject().put("role", "system").put("content", system);
            messages.addObject().put("role", "user").put("content", user);

            String url = baseUrl.replaceAll("/+$", "") + "/chat/completions";
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(15)).build();
            HttpRequest req = HttpRequest.newBuilder(URI.create(url))
                    .timeout(Duration.ofSeconds(timeoutSeconds))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(m.writeValueAsString(body)))
                    .build();
            HttpResponse<String> resp = client.send(req, HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode() / 100 != 2) return null;
            JsonNode root = m.readTree(resp.body());
            String content = root.path("choices").path(0).path("message").path("content").asText("");
            if (content.isBlank()) return null;
            return m.readTree(content);
        } catch (Exception e) {
            return null;
        }
    }
}
