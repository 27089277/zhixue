package com.zhixue.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "app_users")
public class AppUserEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    public String name;
    public String role;
    public String org;
    public String status;
    public String phone;
    public String className;
    public String studentNo;
    public String parentPhone;
    public Integer recentScore;
    public Integer completion;
    public String risk;
    public String weakPoint;
    public LocalDateTime lastLoginAt;
    public int orderNo;
}
