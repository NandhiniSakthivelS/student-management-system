package com.sms.repository;

import com.sms.model.Notice;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoticeRepository extends MongoRepository<Notice, String> {
    List<Notice> findByCategory(String category);
    List<Notice> findByPriority(String priority);
    List<Notice> findAllByOrderByDateDesc();
}
