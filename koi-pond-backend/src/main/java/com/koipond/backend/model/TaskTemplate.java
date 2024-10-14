package com.koipond.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "task_templates")
public class TaskTemplate {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String name;
    private String description;
    private Integer orderIndex;

    // Constructors, getters, and setters
}