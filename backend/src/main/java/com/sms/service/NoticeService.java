package com.sms.service;

import com.sms.model.Notice;
import com.sms.repository.NoticeRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NoticeService {

    private final NoticeRepository noticeRepository;

    public NoticeService(NoticeRepository noticeRepository) {
        this.noticeRepository = noticeRepository;
    }

    public List<Notice> getAllNotices() {
        return noticeRepository.findAllByOrderByDateDesc();
    }

    public Notice createNotice(Notice notice) {
        if (notice.getDate() == null) {
            notice.setDate(LocalDateTime.now());
        }
        return noticeRepository.save(notice);
    }

    public boolean deleteNotice(String id) {
        if (noticeRepository.existsById(id)) {
            noticeRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
