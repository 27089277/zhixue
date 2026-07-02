package com.zhixue.entity;

import jakarta.persistence.*;

// 学生答卷与批改结果，真实落库（含手写作答/批注图片的引用与判分）。
@Entity
@Table(name = "submissions")
public class SubmissionEntity {
    @Id
    public String id; // paperId__studentPhone
    public String paperId;
    public String studentName;
    public String studentPhone;
    @Lob @Column(columnDefinition = "LONGTEXT")
    public String answers;      // JSON: { no: { value, savedAt } }
    public int score;
    public int objectiveTotal;
    public int unanswered;
    public int pendingManual;
    public Integer manualScore;
    public Integer finalScore;
    @Column(columnDefinition = "TEXT")
    public String feedback;
    public boolean returned;
    @Lob @Column(columnDefinition = "LONGTEXT")
    public String annotations;  // JSON: { no: 批注图片URL }
    public long submittedAt;
    public Long gradedAt;
}
