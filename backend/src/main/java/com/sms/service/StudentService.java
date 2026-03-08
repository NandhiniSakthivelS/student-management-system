package com.sms.service;

import com.sms.model.Student;
import com.sms.repository.StudentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class StudentService {

    private static final Logger log = LoggerFactory.getLogger(StudentService.class);
    private final StudentRepository studentRepository;

    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public Optional<Student> getStudentById(String id) {
        return studentRepository.findById(id);
    }

    public Student createStudent(Student student) {
        if (studentRepository.existsByRollNo(student.getRollNo())) {
            throw new IllegalArgumentException("Student with roll number " + student.getRollNo() + " already exists");
        }
        if (studentRepository.existsByEmail(student.getEmail())) {
            throw new IllegalArgumentException("Student with email " + student.getEmail() + " already exists");
        }
        Student saved = studentRepository.save(student);
        log.info("Created new student: {} with id: {}", saved.getName(), saved.getId());
        return saved;
    }

    public Optional<Student> updateStudent(String id, Student studentData) {
        return studentRepository.findById(id).map(existing -> {
            existing.setName(studentData.getName());
            existing.setEmail(studentData.getEmail());
            existing.setPhone(studentData.getPhone());
            existing.setDept(studentData.getDept());
            existing.setYear(studentData.getYear());
            existing.setGender(studentData.getGender());
            existing.setBloodGroup(studentData.getBloodGroup());
            existing.setDob(studentData.getDob());
            existing.setAddress(studentData.getAddress());
            existing.setGpa(studentData.getGpa());
            existing.setStatus(studentData.getStatus());
            Student updated = studentRepository.save(existing);
            log.info("Updated student: {} with id: {}", updated.getName(), updated.getId());
            return updated;
        });
    }

    public boolean deleteStudent(String id) {
        if (studentRepository.existsById(id)) {
            studentRepository.deleteById(id);
            log.info("Deleted student with id: {}", id);
            return true;
        }
        return false;
    }

    public List<Student> searchStudents(String query) {
        return studentRepository.searchByQuery(query);
    }

    public Map<String, Object> getStudentStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", studentRepository.count());
        stats.put("active", studentRepository.findByStatus("Active").size());
        stats.put("inactive", studentRepository.findByStatus("Inactive").size());
        stats.put("graduated", studentRepository.findByStatus("Graduated").size());
        return stats;
    }
}
