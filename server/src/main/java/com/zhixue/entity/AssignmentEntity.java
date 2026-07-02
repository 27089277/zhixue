package com.zhixue.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "assignments")
public class AssignmentEntity {
    @Id
    public String id;
    public String title;
    public String paperId;
    public String className;
    public String deadline;
    public String status;
    public Long createdAt;
    public String kind;
    public String mode;
    public Integer questionCount;
    public Integer timeLimit;   // 限时分钟，null=不限时
    public Boolean allowRedo;   // 是否允许重做
    public int orderNo;
}
