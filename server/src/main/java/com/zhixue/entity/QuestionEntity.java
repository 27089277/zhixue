package com.zhixue.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "questions")
public class QuestionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(columnDefinition = "TEXT")
    public String title;
    public String type;
    public String point;
    public String source;
    public String visibility;
    public String owner;
    public String origin;
    public String subject;
    public String stage;
    public String grade;
    public String difficulty;
    public String paperId;
    public String paperTitle;
    @Column(columnDefinition = "TEXT")
    public String answer;
    @Column(columnDefinition = "TEXT")
    public String analysis;
    @Column(columnDefinition = "TEXT")
    public String choices;     // JSON array
    @Column(columnDefinition = "TEXT")
    public String sharedWith;  // JSON array
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    public String images;      // JSON array（题目配图，base64 data URL）
    public String videoName;   // 讲解视频文件名
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    public String videoUrl;    // 讲解视频链接或小文件 data URL

    public int orderNo; // 保持插入顺序
}
