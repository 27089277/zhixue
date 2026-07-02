package com.zhixue.repo;

import com.zhixue.entity.PaperEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaperRepo extends JpaRepository<PaperEntity, String> {}
