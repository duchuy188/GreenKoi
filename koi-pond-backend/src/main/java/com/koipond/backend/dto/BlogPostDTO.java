package com.koipond.backend.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BlogPostDTO {
    private String id;
    private String title;
    private String content;
    private String authorId;
    private String imageUrl;
    private String status;
    private LocalDateTime publishedAt;
    private boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String rejectionReason; // Thêm trường này
}
