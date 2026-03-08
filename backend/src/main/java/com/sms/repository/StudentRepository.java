package com.sms.repository;

import com.sms.model.Student;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends MongoRepository<Student, String> {

    Optional<Student> findByRollNo(String rollNo);
    Optional<Student> findByEmail(String email);
    List<Student> findByDept(String dept);
    List<Student> findByYear(String year);
    List<Student> findByStatus(String status);

    @Query("{ $or: [ { 'name': { $regex: ?0, $options: 'i' } }, { 'rollNo': { $regex: ?0, $options: 'i' } }, { 'email': { $regex: ?0, $options: 'i' } } ] }")
    List<Student> searchByQuery(String query);

    boolean existsByRollNo(String rollNo);
    boolean existsByEmail(String email);
}
