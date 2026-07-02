package com.zhixue.web;

import com.zhixue.entity.AppUserEntity;
import com.zhixue.entity.ClassEntity;
import com.zhixue.repo.ClassRepo;
import com.zhixue.repo.UserRepo;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

// 教师班级学生目录：所有范围判断都在服务端完成，教师没有学生删除/转班接口。
@RestController
@RequestMapping("/api/teacher")
public class TeacherStudentController {
    private final UserRepo users;
    private final ClassRepo classes;

    public TeacherStudentController(UserRepo users, ClassRepo classes) {
        this.users = users;
        this.classes = classes;
    }

    @GetMapping("/classes")
    public List<Map<String, Object>> classes(@RequestHeader("X-User-Phone") String phone) {
        AppUserEntity teacher = requireTeacher(phone);
        return classes.findByOwnerOrderByNameAsc(teacher.name).stream().map(this::classNode).toList();
    }

    @GetMapping("/classes/{className}/students")
    public List<Map<String, Object>> students(
            @RequestHeader("X-User-Phone") String phone,
            @PathVariable String className
    ) {
        AppUserEntity teacher = requireTeacher(phone);
        requireOwnedClass(teacher, className);
        return users.findByRoleAndClassNameOrderByNameAsc("学生", className)
                .stream().map(this::studentNode).toList();
    }

    @GetMapping("/students/{studentId}")
    public Map<String, Object> student(
            @RequestHeader("X-User-Phone") String phone,
            @PathVariable Long studentId
    ) {
        AppUserEntity teacher = requireTeacher(phone);
        AppUserEntity student = users.findById(studentId)
                .filter(item -> "学生".equals(item.role))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "学生不存在"));
        requireOwnedClass(teacher, student.className);
        return studentNode(student);
    }

    private AppUserEntity requireTeacher(String phone) {
        return users.findByPhone(phone)
                .filter(item -> "启用".equals(item.status) && "教师".equals(item.role))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "教师身份无效"));
    }

    private ClassEntity requireOwnedClass(AppUserEntity teacher, String className) {
        return classes.findById(className)
                .filter(item -> teacher.name.equals(item.owner))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "无权访问该班级"));
    }

    private Map<String, Object> classNode(ClassEntity item) {
        Map<String, Object> node = new LinkedHashMap<>();
        int count = users.findByRoleAndClassNameOrderByNameAsc("学生", item.name).size();
        node.put("name", item.name);
        node.put("count", count);
        node.put("owner", item.owner);
        node.put("rate", item.rate == null ? 0 : item.rate);
        return node;
    }

    private Map<String, Object> studentNode(AppUserEntity item) {
        Map<String, Object> node = new LinkedHashMap<>();
        node.put("id", String.valueOf(item.id));
        node.put("name", item.name);
        node.put("className", item.className);
        node.put("studentNo", value(item.studentNo));
        node.put("phone", maskPhone(item.phone));
        node.put("parentPhone", maskPhone(item.parentPhone));
        node.put("score", item.recentScore == null ? "--" : item.recentScore);
        node.put("completion", item.completion == null ? 0 : item.completion);
        node.put("weakPoint", value(item.weakPoint));
        node.put("risk", value(item.risk, "正常"));
        node.put("account", value(item.status, "启用"));
        node.put("lastLogin", item.lastLoginAt == null ? "暂无记录" : item.lastLoginAt.toString());
        return node;
    }

    private String maskPhone(String phone) {
        if (phone == null || phone.length() < 7) return "未登记";
        return phone.substring(0, 3) + "****" + phone.substring(phone.length() - 4);
    }

    private String value(String text) {
        return value(text, "未登记");
    }

    private String value(String text, String fallback) {
        return text == null || text.isBlank() ? fallback : text;
    }
}
