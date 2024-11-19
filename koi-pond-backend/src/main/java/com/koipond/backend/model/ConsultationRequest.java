package com.koipond.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import org.hibernate.annotations.GenericGenerator;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "consultation_requests")
public class ConsultationRequest {
    public enum ConsultationStatus {
        PENDING,           // Mới gửi yêu cầu
        IN_PROGRESS,       // Đang tư vấn
        COMPLETED,         // Hoàn thành tư vấn (cho mẫu có sẵn)
        PROCEED_DESIGN,    // Chuyển sang thiết kế (cho thiết kế riêng)
        CANCELLED         // Hủy yêu cầu
    }

    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(columnDefinition = "NVARCHAR(36)")
    private String id;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private User customer;

    @ManyToOne
    @JoinColumn(name = "consultant_id")
    private User consultant;

    @ManyToOne
    @JoinColumn(name = "design_id")
    private Design design;

    @Column(name = "is_custom_design")
    private boolean customDesign;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ConsultationStatus status = ConsultationStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(columnDefinition = "TEXT")
    private String requirements;

    @Column(name = "preferred_style")
    private String preferredStyle;

    private String dimensions;

    @Column(nullable = false)
    @Min(value = 1000000, message = "Budget must be at least 1,000,000 VND")
    @Max(value = 1000000000, message = "Budget cannot exceed 1,000,000,000 VND")
    private BigDecimal budget;

    @Column(name = "estimated_cost")
    private BigDecimal estimatedCost;

    @Column(name = "consultation_notes", columnDefinition = "TEXT")
    private String consultationNotes;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "reference_images", columnDefinition = "NVARCHAR(MAX)")
    private String referenceImages;

    @Column(name = "consultation_date")
    private LocalDateTime consultationDate;

    @Column(name = "design_request_id")
    private String designRequestId;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}