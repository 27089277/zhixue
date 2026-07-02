package com.zhixue.repo;

import com.zhixue.entity.VideoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VideoRepo extends JpaRepository<VideoEntity, Long> {}
