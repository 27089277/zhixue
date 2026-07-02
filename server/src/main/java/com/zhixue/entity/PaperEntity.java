package com.zhixue.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "papers")
public class PaperEntity {
    @Id
    public String id;
    public String title;
    public String exam;
    public String subject;
    public String stage;
    public String grade;
    public String region;
    public Integer year;
    public Integer duration;
    public Integer score;
    public Integer questions;
    public Integer progress;
    public String difficulty;
    public String visibility;
    public String owner;
    public String source;

    @Column(columnDefinition = "TEXT")
    public String sections;   // JSON array
    @Column(columnDefinition = "TEXT")
    public String tags;       // JSON array
    @Column(columnDefinition = "TEXT")
    public String sharedWith; // JSON array
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    public String items;      // JSON array of paper items
}
