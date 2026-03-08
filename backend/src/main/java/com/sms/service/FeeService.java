package com.sms.service;

import com.sms.model.Fee;
import com.sms.repository.FeeRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class FeeService {

    private final FeeRepository feeRepository;

    public FeeService(FeeRepository feeRepository) {
        this.feeRepository = feeRepository;
    }

    public List<Fee> getAllFees() {
        return feeRepository.findAll();
    }

    public List<Fee> getFeesByStudent(String studentId) {
        return feeRepository.findByStudentId(studentId);
    }

    public Fee createFee(Fee fee) {
        double amount = fee.getAmount() != null ? fee.getAmount() : 0.0;
        double paid   = fee.getPaid()   != null ? fee.getPaid()   : 0.0;
        double due    = amount - paid;
        fee.setDue(Math.max(0, due));

        if (due <= 0) {
            fee.setStatus("Paid");
        } else if (paid == 0) {
            LocalDate dueDate = fee.getDueDate();
            if (dueDate != null && dueDate.isBefore(LocalDate.now())) {
                fee.setStatus("Overdue");
            } else {
                fee.setStatus("Pending");
            }
        } else {
            fee.setStatus("Partial");
        }
        return feeRepository.save(fee);
    }

    public Optional<Fee> updateFee(String id, Fee data) {
        return feeRepository.findById(id).map(f -> {
            if (data.getPaid() != null) f.setPaid(data.getPaid());
            if (data.getMethod() != null) f.setMethod(data.getMethod());
            if (data.getTxn() != null) f.setTxn(data.getTxn());
            double amount = f.getAmount() != null ? f.getAmount() : 0.0;
            double paid   = f.getPaid()   != null ? f.getPaid()   : 0.0;
            double due    = amount - paid;
            f.setDue(Math.max(0, due));
            if (due <= 0) f.setStatus("Paid");
            else if (paid == 0) f.setStatus(f.getDueDate() != null && f.getDueDate().isBefore(LocalDate.now()) ? "Overdue" : "Pending");
            else f.setStatus("Partial");
            return feeRepository.save(f);
        });
    }
}
