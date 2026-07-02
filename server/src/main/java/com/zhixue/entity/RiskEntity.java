package com.zhixue.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "risks")
public class RiskEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    public String name;
    public String risk;
    public String point;
    public int orderNo;
}
