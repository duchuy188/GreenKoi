package com.koipond.backend.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;

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
    private String coverImageUrl; 
    private String status;
    private LocalDateTime publishedAt;
    
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private boolean active;  
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String rejectionReason; 

    // Constructor không bao gồm trường active
    public BlogPostDTO(String id, String title, String content, String authorId, 
                       String coverImageUrl, String status, LocalDateTime publishedAt, 
                       LocalDateTime createdAt, LocalDateTime updatedAt, String rejectionReason) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.authorId = authorId;
        this.coverImageUrl = coverImageUrl;
        this.status = status;
        this.publishedAt = publishedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.rejectionReason = rejectionReason;
    }
}
