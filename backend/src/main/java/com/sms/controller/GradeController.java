package com.sms.controller;

import com.sms.model.Grade;
import com.sms.service.GradeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/grades")
public class GradeController {

    private final GradeService gradeService;

    public GradeController(GradeService gradeService) {
        this.gradeService = gradeService;
    }

    @GetMapping
    public ResponseEntity<List<Grade>> getAll() {
        return ResponseEntity.ok(gradeService.getAllGrades());
    }

    @GetMapping("/student/{id}")
    public ResponseEntity<List<Grade>> getByStudent(@PathVariable String id) {
        return ResponseEntity.ok(gradeService.getGradesByStudent(id));
    }

    @PostMapping
    public ResponseEntity<Grade> create(@RequestBody Grade grade) {
        return ResponseEntity.ok(gradeService.createGrade(grade));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody Grade data) {
        return gradeService.updateGrade(id, data)
                .map(g -> (ResponseEntity<?>) ResponseEntity.ok(g))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable String id) {
        if (gradeService.deleteGrade(id)) return ResponseEntity.ok(Map.of("message", "Deleted"));
        return ResponseEntity.notFound().build();
    }
}
