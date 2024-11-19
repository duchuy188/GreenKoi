package com.koipond.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "designs")
public class Design {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
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
    private boolean active = true;

    @Enumerated(EnumType.STRING)
    private DesignStatus status = DesignStatus.PENDING_APPROVAL;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public enum DesignStatus {
        PENDING_APPROVAL, APPROVED, REJECTED, ARCHIVED, CANCELLED
    }

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    @Column(name = "is_public", nullable = false)
    private boolean isPublic = false;

    @Column(name = "is_custom", nullable = false)
    private boolean isCustom = false;

    @Column(name = "customer_approved_public")
    private Boolean customerApprovedPublic;

    @Column(name = "customer_approval_date")
    private LocalDateTime customerApprovalDate;

    @ManyToOne
    @JoinColumn(name = "reference_design_id")
    private Design referenceDesign;

    @OneToOne
    @JoinColumn(name = "design_request_id")
    private DesignRequest designRequest;

    public boolean isPublic() {
        return isPublic;
    }

    public void setPublic(boolean isPublic) {
        this.isPublic = isPublic;
    }

    public boolean isCustom() {
        return isCustom;
    }

    public void setCustom(boolean isCustom) {
        this.isCustom = isCustom;
    }

    public Boolean getCustomerApprovedPublic() {
        return customerApprovedPublic;
    }

    public void setCustomerApprovedPublic(Boolean customerApprovedPublic) {
        this.customerApprovedPublic = customerApprovedPublic;
    }

    public LocalDateTime getCustomerApprovalDate() {
        return customerApprovalDate;
    }

    public void setCustomerApprovalDate(LocalDateTime customerApprovalDate) {
        this.customerApprovalDate = customerApprovalDate;
    }

    public Design getReferenceDesign() {
        return referenceDesign;
    }

    public void setReferenceDesign(Design referenceDesign) {
        this.referenceDesign = referenceDesign;
    }

    public DesignRequest getDesignRequest() {
        return designRequest;
    }

    public void setDesignRequest(DesignRequest designRequest) {
        this.designRequest = designRequest;
    }
}
