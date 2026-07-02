package com.zhixue.repo;

import com.zhixue.entity.AppUserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepo extends JpaRepository<AppUserEntity, Long> {
    Optional<AppUserEntity> findByPhone(String phone);
    List<AppUserEntity> findByRoleAndClassNameOrderByNameAsc(String role, String className);
}
