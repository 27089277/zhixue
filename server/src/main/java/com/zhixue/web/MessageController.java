package com.zhixue.web;

import com.fasterxml.jackson.databind.JsonNode;
import com.zhixue.entity.AppUserEntity;
import com.zhixue.entity.MessageEntity;
import com.zhixue.repo.ClassRepo;
import com.zhixue.repo.MessageRepo;
import com.zhixue.repo.UserRepo;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

// 师生双向会话：范围校验全在服务端。老师只能与自己班级学生会话；学生只能读/回复自己的会话。
@RestController
@RequestMapping("/api")
public class MessageController {
    private final UserRepo users;
    private final ClassRepo classes;
    private final MessageRepo messages;

    public MessageController(UserRepo users, ClassRepo classes, MessageRepo messages) {
        this.users = users;
        this.classes = classes;
        this.messages = messages;
    }

    // 老师给学生发消息（新消息或追加到会话）
    @PostMapping("/teacher/students/{studentId}/messages")
    public Map<String, Object> teacherSend(
            @RequestHeader("X-User-Phone") String phone,
            @PathVariable Long studentId,
            @RequestBody JsonNode body
    ) {
        AppUserEntity teacher = requireTeacher(phone);
        AppUserEntity student = users.findById(studentId)
                .filter(u -> "学生".equals(u.role))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "学生不存在"));
        requireOwnedClass(teacher, student.className);
        String content = text(body, "body", "");
        if (content.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "消息内容不能为空");
        MessageEntity m = base(teacher, student, "teacher");
        m.title = text(body, "title", "老师消息");
        m.body = content;
        messages.save(m);
        return Map.of("ok", true, "id", m.id);
    }

    // 老师查看自己的会话（按学生分组）
    @GetMapping("/teacher/conversations")
    public List<Map<String, Object>> teacherConversations(@RequestHeader("X-User-Phone") String phone) {
        AppUserEntity teacher = requireTeacher(phone);
        List<MessageEntity> all = messages.findByTeacherPhoneOrderByCreatedAtAsc(teacher.phone);
        Map<Long, List<MessageEntity>> byStudent = new LinkedHashMap<>();
        for (MessageEntity m : all) byStudent.computeIfAbsent(m.studentId, k -> new ArrayList<>()).add(m);
        List<Map<String, Object>> out = new ArrayList<>();
        byStudent.forEach((sid, list) -> {
            MessageEntity last = list.get(list.size() - 1);
            long unread = list.stream().filter(x -> "student".equals(x.senderRole) && x.readAt == null).count();
            Map<String, Object> conv = new LinkedHashMap<>();
            conv.put("studentId", sid);
            conv.put("studentName", last.studentName);
            conv.put("className", last.className);
            conv.put("lastTitle", last.title);
            conv.put("lastBody", last.body);
            conv.put("lastAt", last.createdAt);
            conv.put("unread", unread);
            conv.put("messages", list.stream().map(this::node).toList());
            out.add(conv);
        });
        // 未读多的靠前
        out.sort((a, b) -> Long.compare((long) b.get("lastAt"), (long) a.get("lastAt")));
        return out;
    }

    // 老师回复某学生（追加会话）
    @PostMapping("/teacher/students/{studentId}/reply")
    public Map<String, Object> teacherReply(
            @RequestHeader("X-User-Phone") String phone,
            @PathVariable Long studentId,
            @RequestBody JsonNode body
    ) {
        return teacherSend(phone, studentId, body);
    }

    // 老师标记该学生发来的消息为已读
    @PostMapping("/teacher/students/{studentId}/read")
    public Map<String, Object> teacherRead(
            @RequestHeader("X-User-Phone") String phone,
            @PathVariable Long studentId
    ) {
        AppUserEntity teacher = requireTeacher(phone);
        messages.findByTeacherPhoneOrderByCreatedAtAsc(teacher.phone).stream()
                .filter(m -> studentId.equals(m.studentId) && "student".equals(m.senderRole) && m.readAt == null)
                .forEach(m -> { m.readAt = System.currentTimeMillis(); messages.save(m); });
        return Map.of("ok", true);
    }

    @GetMapping("/teacher/unread")
    public Map<String, Object> teacherUnread(@RequestHeader("X-User-Phone") String phone) {
        AppUserEntity teacher = requireTeacher(phone);
        return Map.of("unread", messages.countByTeacherPhoneAndSenderRoleAndReadAtIsNull(teacher.phone, "student"));
    }

    // 学生收件箱（整条时间线）
    @GetMapping("/student/messages")
    public List<Map<String, Object>> inbox(@RequestHeader("X-User-Phone") String phone) {
        AppUserEntity student = requireStudent(phone);
        return messages.findByStudentIdOrderByCreatedAtAsc(student.id).stream().map(this::node).toList();
    }

    // 学生回复老师（沿用该会话最近的老师）
    @PostMapping("/student/messages/reply")
    public Map<String, Object> studentReply(
            @RequestHeader("X-User-Phone") String phone,
            @RequestBody JsonNode body
    ) {
        AppUserEntity student = requireStudent(phone);
        List<MessageEntity> list = messages.findByStudentIdOrderByCreatedAtAsc(student.id);
        if (list.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "还没有可回复的会话");
        MessageEntity ref = list.get(list.size() - 1);
        String content = text(body, "body", "");
        if (content.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "回复内容不能为空");
        MessageEntity m = new MessageEntity();
        m.teacherName = ref.teacherName;
        m.teacherPhone = ref.teacherPhone;
        m.studentId = student.id;
        m.studentName = student.name;
        m.className = student.className;
        m.senderRole = "student";
        m.title = "学生回复";
        m.body = content;
        m.createdAt = System.currentTimeMillis();
        messages.save(m);
        return Map.of("ok", true, "id", m.id);
    }

    // 学生标记老师发来的消息为已读
    @PostMapping("/student/messages/read")
    public Map<String, Object> studentReadAll(@RequestHeader("X-User-Phone") String phone) {
        AppUserEntity student = requireStudent(phone);
        messages.findByStudentIdOrderByCreatedAtAsc(student.id).stream()
                .filter(m -> "teacher".equals(m.senderRole) && m.readAt == null)
                .forEach(m -> { m.readAt = System.currentTimeMillis(); messages.save(m); });
        return Map.of("ok", true);
    }

    @GetMapping("/student/unread")
    public Map<String, Object> studentUnread(@RequestHeader("X-User-Phone") String phone) {
        AppUserEntity student = requireStudent(phone);
        return Map.of("unread", messages.countByStudentIdAndSenderRoleAndReadAtIsNull(student.id, "teacher"));
    }

    private MessageEntity base(AppUserEntity teacher, AppUserEntity student, String senderRole) {
        MessageEntity m = new MessageEntity();
        m.teacherName = teacher.name;
        m.teacherPhone = teacher.phone;
        m.studentId = student.id;
        m.studentName = student.name;
        m.className = student.className;
        m.senderRole = senderRole;
        m.createdAt = System.currentTimeMillis();
        return m;
    }

    private AppUserEntity requireTeacher(String phone) {
        return users.findByPhone(phone)
                .filter(u -> "启用".equals(u.status) && "教师".equals(u.role))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "教师身份无效"));
    }

    private AppUserEntity requireStudent(String phone) {
        return users.findByPhone(phone)
                .filter(u -> "学生".equals(u.role))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "学生身份无效"));
    }

    private void requireOwnedClass(AppUserEntity teacher, String className) {
        classes.findById(className)
                .filter(c -> teacher.name.equals(c.owner))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "无权访问该班级"));
    }

    private String text(JsonNode n, String k, String fallback) {
        JsonNode v = n.get(k);
        return v == null || v.isNull() ? fallback : v.asText();
    }

    private Map<String, Object> node(MessageEntity m) {
        Map<String, Object> node = new LinkedHashMap<>();
        node.put("id", m.id);
        node.put("senderRole", m.senderRole);
        node.put("teacherName", m.teacherName);
        node.put("studentName", m.studentName);
        node.put("className", m.className);
        node.put("title", m.title);
        node.put("body", m.body);
        node.put("createdAt", m.createdAt);
        node.put("read", m.readAt != null);
        return node;
    }
}
