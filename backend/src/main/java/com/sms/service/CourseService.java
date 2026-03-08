package com.sms.service;

import com.sms.model.Course;
import com.sms.repository.CourseRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CourseService {

    private final CourseRepository courseRepository;

    public CourseService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public Optional<Course> getCourseById(String id) {
        return courseRepository.findById(id);
    }

    public Course createCourse(Course course) {
        if (courseRepository.existsByCode(course.getCode())) {
            throw new IllegalArgumentException("Course with code " + course.getCode() + " already exists");
        }
        return courseRepository.save(course);
    }

    public Optional<Course> updateCourse(String id, Course courseData) {
        return courseRepository.findById(id).map(existing -> {
            existing.setName(courseData.getName());
            existing.setDept(courseData.getDept());
            existing.setCredits(courseData.getCredits());
            existing.setInstructor(courseData.getInstructor());
            existing.setStudents(courseData.getStudents());
            existing.setSchedule(courseData.getSchedule());
            existing.setRoom(courseData.getRoom());
            existing.setType(courseData.getType());
            return courseRepository.save(existing);
        });
    }

    public boolean deleteCourse(String id) {
        if (courseRepository.existsById(id)) {
            courseRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
