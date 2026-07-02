package com.zhixue.repo;

import com.zhixue.entity.KnowledgeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface KnowledgeRepo extends JpaRepository<KnowledgeEntity, String> {}
