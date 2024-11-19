package com.koipond.backend.model;

import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "maintenance_requests")
@Getter
@Setter
public class MaintenanceRequest {
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(columnDefinition = "NVARCHAR(36)")
    private String id;

    @ManyToOne
    @JoinColumn(name = "customer_id", columnDefinition = "NVARCHAR(36)")
    private User customer;

    @ManyToOne
    @JoinColumn(name = "project_id", columnDefinition = "NVARCHAR(36)")
    private Project project;

    @ManyToOne
    @JoinColumn(name = "consultant_id", columnDefinition = "NVARCHAR(36)")
    private User consultant;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String attachments;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus requestStatus = RequestStatus.PENDING;

    @Enumerated(EnumType.STRING)
    private MaintenanceStatus maintenanceStatus;

    private BigDecimal agreedPrice;
    private LocalDate scheduledDate;
    private LocalDate startDate;
    private LocalDate completionDate;

    @ManyToOne
    @JoinColumn(name = "assigned_to", columnDefinition = "NVARCHAR(36)")
    private User assignedTo;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String cancellationReason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "maintenance_notes", columnDefinition = "NVARCHAR(MAX)")
    private String maintenanceNotes;

    @Column(name = "maintenance_images", columnDefinition = "NVARCHAR(MAX)")
    private String maintenanceImages;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus paymentStatus = PaymentStatus.UNPAID;
    
    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal depositAmount;  // 50% của agreedPrice
    
    @Column(precision = 10, scale = 2)
    private BigDecimal remainingAmount;  // 50% còn lại

    // Enum definitions
    public enum RequestStatus {
        PENDING, REVIEWING, CONFIRMED, CANCELLED
    }

    public enum MaintenanceStatus {
        ASSIGNED, SCHEDULED, IN_PROGRESS, COMPLETED
    }

    public enum PaymentStatus {
        UNPAID,           // Chưa thanh toán
        DEPOSIT_PAID,     // Đã thanh toán đặt cọc
        FULLY_PAID        // Đã thanh toán đầy đủ
    }
    
    public enum PaymentMethod {
        CASH,            // Thanh toán tiền mặt
        VNPAY           // Thanh toán online qua VNPay
    }

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
