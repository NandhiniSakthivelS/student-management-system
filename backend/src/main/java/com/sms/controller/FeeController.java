package com.sms.controller;

import com.sms.model.Fee;
import com.sms.service.FeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fees")
public class FeeController {

    private final FeeService feeService;

    public FeeController(FeeService feeService) {
        this.feeService = feeService;
    }

    @GetMapping
    public ResponseEntity<List<Fee>> getAll() {
        return ResponseEntity.ok(feeService.getAllFees());
    }

    @GetMapping("/student/{id}")
    public ResponseEntity<List<Fee>> getByStudent(@PathVariable String id) {
        return ResponseEntity.ok(feeService.getFeesByStudent(id));
    }

    @PostMapping
    public ResponseEntity<Fee> create(@RequestBody Fee fee) {
        return ResponseEntity.ok(feeService.createFee(fee));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody Fee data) {
        return feeService.updateFee(id, data)
                .map(f -> (ResponseEntity<?>) ResponseEntity.ok(f))
                .orElse(ResponseEntity.notFound().build());
    }
}
