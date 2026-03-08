package com.sms.repository;

import com.sms.model.Fee;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeeRepository extends MongoRepository<Fee, String> {
    List<Fee> findByStudentId(String studentId);
    List<Fee> findByStatus(String status);
    List<Fee> findByStudentIdAndFeeType(String studentId, String feeType);
}
