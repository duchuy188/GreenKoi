package com.koipond.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "blog_posts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BlogPost {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "cover_image_url")
    private String coverImageUrl;

    @Enumerated(EnumType.STRING)
    private BlogPostStatus status;

    private LocalDateTime publishedAt;

    private boolean isActive;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String rejectionReason;

    public enum BlogPostStatus {
        DRAFT, PENDING_APPROVAL, APPROVED, REJECTED
    }

    // Constructors, getters, and setters
}
