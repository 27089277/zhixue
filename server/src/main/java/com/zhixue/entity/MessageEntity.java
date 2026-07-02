package com.zhixue.entity;

import jakarta.persistence.*;

// 师生会话消息：一条会话由 (teacherPhone, studentId) 唯一确定，senderRole 标记谁发的。
// 老师发 → 学生读；学生回复 → 老师读。readAt 记录“对方是否已读”。
@Entity
@Table(name = "messages")
public class MessageEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    public String teacherName;
    public String teacherPhone;
    public Long studentId;
    public String studentName;
    public String className;

    public String senderRole; // teacher | student
    public String title;
    @Lob @Column(columnDefinition = "TEXT")
    public String body;
    public long createdAt;
    public Long readAt; // null=对方未读
}
