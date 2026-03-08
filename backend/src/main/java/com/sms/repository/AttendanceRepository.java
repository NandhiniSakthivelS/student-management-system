package com.sms.repository;

import com.sms.model.Attendance;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceRepository extends MongoRepository<Attendance, String> {
    List<Attendance> findByStudentId(String studentId);
    List<Attendance> findByDate(LocalDate date);
    List<Attendance> findByCourse(String course);
    List<Attendance> findByStudentIdAndCourse(String studentId, String course);
    long countByStudentIdAndCourseAndStatus(String studentId, String course, String status);
}
