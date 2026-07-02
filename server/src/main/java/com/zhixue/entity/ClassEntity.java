package com.zhixue.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "classes")
public class ClassEntity {
    @Id
    public String name;
    public Integer count;
    public String owner;
    public Integer rate;
}
