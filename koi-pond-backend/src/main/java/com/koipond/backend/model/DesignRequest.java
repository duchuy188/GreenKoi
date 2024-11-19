package com.koipond.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.core.type.TypeReference;
import org.hibernate.annotations.GenericGenerator;

@Data
@Entity
@Table(name = "design_requests")
public class DesignRequest {
    public enum DesignRequestStatus {
        PENDING,        // Chờ thiết kế
        IN_PROGRESS,    // Đang thiết kế
        COMPLETED,      // Hoàn thành thiết kế
        IN_REVIEW,      // Đang được đánh giá
        PENDING_CUSTOMER_APPROVAL,  // Chờ khách duyệt
        APPROVED,       // Khách duyệt
        REJECTED,       // Khách từ chối
        CANCELLED      // Hủy yêu cầu
    }

    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(columnDefinition = "NVARCHAR(36)")
    private String id;

    @ManyToOne
    @JoinColumn(name = "consultation_id")
    private ConsultationRequest consultation;

    @ManyToOne
    @JoinColumn(name = "designer_id")
    private User designer;

    @ManyToOne
    @JoinColumn(name = "design_id")
    private Design design;

    @Column(name = "design_files", columnDefinition = "NVARCHAR(MAX)")
    private String designFiles = "[]";

    @Column(name = "design_notes", columnDefinition = "NVARCHAR(MAX)")
    private String designNotes;

    @Column(name = "estimated_cost")
    private BigDecimal estimatedCost;

    @Column(name = "rejection_reason", columnDefinition = "NVARCHAR(MAX)")
    private String rejectionReason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DesignRequestStatus status = DesignRequestStatus.PENDING;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Transient
    private List<String> designFilesList = new ArrayList<>();

    @Column(name = "review_date")
    private LocalDateTime reviewDate;

    @ManyToOne
    @JoinColumn(name = "reviewer_id")
    private User reviewer;

    @Column(name = "review_notes", columnDefinition = "NVARCHAR(MAX)")
    private String reviewNotes;

    @Column(name = "revision_count")
    private int revisionCount = 0;

    @PostLoad
    private void onLoad() {
        try {
            if (designFiles != null && !designFiles.isEmpty()) {
                designFilesList = new ObjectMapper().readValue(designFiles, 
                    new TypeReference<List<String>>() {});
            }
        } catch (Exception e) {
            designFilesList = new ArrayList<>();
        }
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        
        try {
            this.designFiles = new ObjectMapper().writeValueAsString(designFilesList);
        } catch (Exception e) {
            this.designFiles = "[]";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        
        try {
            this.designFiles = new ObjectMapper().writeValueAsString(designFilesList);
        } catch (Exception e) {
            this.designFiles = "[]";
        }
    }
}
