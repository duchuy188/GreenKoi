package com.koipond.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.GenericGenerator;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(columnDefinition = "NVARCHAR(36)")
    private String id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, unique = true)
    private String email;

    private String phone;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "role_id")
    private String roleId;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    private String address;

    @Column(name = "firebase_uid")
    private String firebaseUid;

    @Column(name = "has_active_project")
    private boolean hasActiveProject = false;

    @Column(name = "has_active_maintenance")
    private boolean hasActiveMaintenance = false;

    // Các getter và setter đã được tạo bởi annotation @Data của Lombok
    // Nhưng để rõ ràng, chúng ta có thể thêm các phương thức sau:

    public boolean isHasActiveMaintenance() {
        return hasActiveMaintenance;
    }

    public void setHasActiveMaintenance(boolean hasActiveMaintenance) {
        this.hasActiveMaintenance = hasActiveMaintenance;
    }
}
