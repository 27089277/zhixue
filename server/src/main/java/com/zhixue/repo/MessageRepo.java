package com.zhixue.repo;

import com.zhixue.entity.MessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepo extends JpaRepository<MessageEntity, Long> {
    // 学生的全部会话消息（含老师发的与自己回复的）
    List<MessageEntity> findByStudentIdOrderByCreatedAtAsc(Long studentId);
    // 老师的全部会话消息
    List<MessageEntity> findByTeacherPhoneOrderByCreatedAtAsc(String teacherPhone);
    // 未读统计
    long countByStudentIdAndSenderRoleAndReadAtIsNull(Long studentId, String senderRole);
    long countByTeacherPhoneAndSenderRoleAndReadAtIsNull(String teacherPhone, String senderRole);
}
