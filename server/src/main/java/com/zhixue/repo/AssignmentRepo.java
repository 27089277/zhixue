package com.zhixue.repo;

import com.zhixue.entity.AssignmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssignmentRepo extends JpaRepository<AssignmentEntity, String> {}
