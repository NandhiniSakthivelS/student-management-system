package com.sms.service;

import com.sms.model.Attendance;
import com.sms.repository.AttendanceRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;

    public AttendanceService(AttendanceRepository attendanceRepository) {
        this.attendanceRepository = attendanceRepository;
    }

    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }

    public List<Attendance> getAttendanceByStudent(String studentId) {
        return attendanceRepository.findByStudentId(studentId);
    }

    public Attendance markAttendance(Attendance attendance) {
        return attendanceRepository.save(attendance);
    }

    public Optional<Attendance> updateAttendance(String id, Attendance data) {
        return attendanceRepository.findById(id).map(a -> {
            a.setStatus(data.getStatus());
            return attendanceRepository.save(a);
        });
    }

    public double getAttendancePercentage(String studentId, String course) {
        List<Attendance> all = attendanceRepository.findByStudentIdAndCourse(studentId, course);
        if (all.isEmpty()) return 0.0;
        long present = attendanceRepository.countByStudentIdAndCourseAndStatus(studentId, course, "Present");
        return (double) present / all.size() * 100;
    }
}
