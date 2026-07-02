package com.zhixue.repo;

import com.zhixue.entity.MediaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MediaRepo extends JpaRepository<MediaEntity, String> {
}
