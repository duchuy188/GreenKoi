package com.koipond.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "projects")
public class Project {
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(columnDefinition = "NVARCHAR(36)")
    private String id;

    // Các trường khác giữ nguyên
    @ManyToOne
    @JoinColumn(name = "customer_id")
    private User customer;

    @ManyToOne
    @JoinColumn(name = "consultant_id")
    private User consultant;

    @ManyToOne
    @JoinColumn(name = "design_id")
    private Design design;

    @ManyToOne
    @JoinColumn(name = "design_request_id", columnDefinition = "NVARCHAR(36)")
    private DesignRequest designRequest;

    @ManyToOne
    @JoinColumn(name = "promotion_id")
    private Promotion promotion;

    private BigDecimal discountedPrice;

    @Column(nullable = false)
    private String name;

    private String description;

    @ManyToOne
    @JoinColumn(name = "status_id")
    private ProjectStatus status;

    @Column(nullable = false)
    private BigDecimal totalPrice;

    @Column(nullable = false)
    private BigDecimal depositAmount;

    @Column(nullable = false)
    private BigDecimal remainingAmount;  // Thêm trường này
    
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate approvalDate;
    private LocalDate completionDate;
    private LocalDate technicalCompletionDate;

    private String address;

    @Column(nullable = false)
    private Integer progressPercentage = 0;

    @Column(columnDefinition = "TEXT")
    private String internalNotes;

    @Column(columnDefinition = "TEXT")
    private String customerFeedback;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus = PaymentStatus.UNPAID;

    private LocalDate estimatedCompletionDate;

    @Column(nullable = false)
    private Integer totalStages = 0;

    @Column(nullable = false)
    private Integer completedStages = 0;

    @Column(name = "is_active")
    private boolean isActive = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @ManyToOne
    @JoinColumn(name = "constructor_id")
    private User constructor;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Task> tasks = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum PaymentStatus {
        UNPAID, DEPOSIT_PAID, FULLY_PAID
    }

    // Thêm helper method để tính remainingAmount
    public void calculateRemainingAmount() {
        if (this.totalPrice != null && this.depositAmount != null) {
            this.remainingAmount = this.totalPrice.subtract(this.depositAmount);
        }
    }
}
