package com.sms.controller;

import com.sms.model.Attendance;
import com.sms.service.AttendanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @GetMapping
    public ResponseEntity<List<Attendance>> getAll() {
        return ResponseEntity.ok(attendanceService.getAllAttendance());
    }

    @GetMapping("/student/{id}")
    public ResponseEntity<List<Attendance>> getByStudent(@PathVariable String id) {
        return ResponseEntity.ok(attendanceService.getAttendanceByStudent(id));
    }

    @PostMapping
    public ResponseEntity<Attendance> mark(@RequestBody Attendance attendance) {
        return ResponseEntity.ok(attendanceService.markAttendance(attendance));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Attendance> update(@PathVariable String id, @RequestBody Attendance data) {
        return attendanceService.updateAttendance(id, data).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/report/{studentId}")
    public ResponseEntity<Map<String, Object>> getReport(@PathVariable String studentId, @RequestParam String course) {
        double pct = attendanceService.getAttendancePercentage(studentId, course);
        return ResponseEntity.ok(Map.of("studentId", studentId, "course", course, "percentage", pct));
    }
}
