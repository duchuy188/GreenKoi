package com.koipond.backend.model;

import jakarta.persistence.*;
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
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private User customer;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne
    @JoinColumn(name = "consultant_id")
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
    @JoinColumn(name = "assigned_to")
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

    // Enum definitions
    public enum RequestStatus {
        PENDING, REVIEWING, CONFIRMED, CANCELLED
    }

    public enum MaintenanceStatus {
        ASSIGNED, SCHEDULED, IN_PROGRESS, COMPLETED
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
