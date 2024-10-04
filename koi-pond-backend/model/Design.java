package com.koipond.backend.model;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Entity
@Table(name = "designs")
public class Design {
    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    private String description;

    private String imageUrl;

    @Column(nullable = false)
    private BigDecimal basePrice;

    private String shape;

    private String dimensions;

    private String features;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "is_active")
    private boolean isActive = true;

    // Các trường khác nếu cần
}