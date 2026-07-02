package com.zhixue.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "knowledge")
public class KnowledgeEntity {
    @Id
    public String name;
    public Integer mastery;
    public Integer count;
}
