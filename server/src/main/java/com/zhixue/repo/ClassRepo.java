package com.zhixue.repo;

import com.zhixue.entity.ClassEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClassRepo extends JpaRepository<ClassEntity, String> {
    List<ClassEntity> findByOwnerOrderByNameAsc(String owner);
}
