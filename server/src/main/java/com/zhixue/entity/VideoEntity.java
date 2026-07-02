package com.zhixue.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "videos")
public class VideoEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    public String name;
    public String size;
    public Integer progress;
    public String status;
    public String owner;
    public String source;
    public String paperTitle;
    public String point;
    public int orderNo;
}
