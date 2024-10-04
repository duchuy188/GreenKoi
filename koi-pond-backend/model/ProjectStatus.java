package com.koipond.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "project_statuses")
public class ProjectStatus {
    @Id
    private String id;

    @Column(nullable = false, unique = true)
    private String name;

    private String description;

    @Column(name = "is_active")
    private boolean isActive = true;

    // Các trường khác nếu cần
}