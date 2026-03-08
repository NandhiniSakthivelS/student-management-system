package com.sms.service;

import com.sms.model.Grade;
import com.sms.repository.GradeRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class GradeService {

    private final GradeRepository gradeRepository;

    public GradeService(GradeRepository gradeRepository) {
        this.gradeRepository = gradeRepository;
    }

    public List<Grade> getAllGrades() {
        return gradeRepository.findAll();
    }

    public List<Grade> getGradesByStudent(String studentId) {
        return gradeRepository.findByStudentId(studentId);
    }

    public Grade createGrade(Grade grade) {
        if (grade.getMarks() != null && grade.getMaxMarks() != null) {
            double pct = (double) grade.getMarks() / grade.getMaxMarks() * 100;
            if (pct >= 90) { grade.setGrade("O"); grade.setGpaPoints(10.0); }
            else if (pct >= 80) { grade.setGrade("A+"); grade.setGpaPoints(9.0); }
            else if (pct >= 70) { grade.setGrade("A");  grade.setGpaPoints(8.0); }
            else if (pct >= 60) { grade.setGrade("B+"); grade.setGpaPoints(7.0); }
            else if (pct >= 50) { grade.setGrade("B");  grade.setGpaPoints(6.0); }
            else if (pct >= 40) { grade.setGrade("C");  grade.setGpaPoints(5.0); }
            else                { grade.setGrade("F");  grade.setGpaPoints(0.0); }
        }
        return gradeRepository.save(grade);
    }

    public Optional<Grade> updateGrade(String id, Grade data) {
        return gradeRepository.findById(id).map(g -> {
            g.setMarks(data.getMarks());
            g.setMaxMarks(data.getMaxMarks());
            g.setSubject(data.getSubject());
            g.setSemester(data.getSemester());
            g.setExam(data.getExam());
            return gradeRepository.save(g);
        });
    }

    public boolean deleteGrade(String id) {
        if (gradeRepository.existsById(id)) {
            gradeRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
