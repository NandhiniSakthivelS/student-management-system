package com.sms.repository;

import com.sms.model.Grade;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GradeRepository extends MongoRepository<Grade, String> {
    List<Grade> findByStudentId(String studentId);
    List<Grade> findBySemester(String semester);
    List<Grade> findBySubject(String subject);
    List<Grade> findByStudentIdAndSemester(String studentId, String semester);
}
