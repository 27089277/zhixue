package com.zhixue.repo;

import com.zhixue.entity.SubmissionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubmissionRepo extends JpaRepository<SubmissionEntity, String> {
}
