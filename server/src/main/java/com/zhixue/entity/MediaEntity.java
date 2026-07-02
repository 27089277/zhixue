package com.zhixue.entity;

import jakarta.persistence.*;

// 媒体元数据：文件二进制存磁盘（对象存储），关系库只存元数据 + 存储路径。
@Entity
@Table(name = "media")
public class MediaEntity {
    @Id
    public String id;          // UUID
    public String filename;    // 原始文件名
    public String contentType; // MIME
    public long size;          // 字节
    public String storagePath; // 磁盘路径
    public long createdAt;
}
