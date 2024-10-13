package com.koipond.backend.controller;

import com.koipond.backend.dto.BlogPostDTO;
import com.koipond.backend.service.BlogService;
import com.koipond.backend.model.User;
import com.koipond.backend.repository.UserRepository;
import com.koipond.backend.exception.UserNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/blog")
@Tag(name = "Blog Controller", description = "API endpoints for managing blog posts")
public class BlogController {

    private final BlogService blogService;
    private final UserRepository userRepository;

    public BlogController(BlogService blogService, UserRepository userRepository) {
        this.blogService = blogService;
        this.userRepository = userRepository;
    }

    @Operation(summary = "Create a new draft", description = "Creates a new blog post draft")
    @PostMapping("/drafts")
    public ResponseEntity<BlogPostDTO> createDraft(
            @RequestBody BlogPostDTO blogPostDTO,
            Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(blogService.createDraft(blogPostDTO, username));
    }

    @Operation(summary = "Update a draft", description = "Updates an existing blog post draft")
    @PutMapping("/drafts/{id}")
    public ResponseEntity<BlogPostDTO> updateDraft(
            @Parameter(description = "ID of the draft to update") @PathVariable String id,
            @RequestBody BlogPostDTO blogPostDTO) {
        return ResponseEntity.ok(blogService.updateDraft(id, blogPostDTO));
    }

    @Operation(summary = "Submit a draft for approval", description = "Submits a draft blog post for approval")
    @PostMapping("/drafts/{id}/submit")
    public ResponseEntity<BlogPostDTO> submitForApproval(
            @Parameter(description = "ID of the draft to submit") @PathVariable String id) {
        return ResponseEntity.ok(blogService.submitForApproval(id));
    }

    @Operation(summary = "Approve a blog post", description = "Approves a submitted blog post")
    @PostMapping("/posts/{id}/approve")
    public ResponseEntity<BlogPostDTO> approveBlogPost(
            @Parameter(description = "ID of the blog post to approve") @PathVariable String id) {
        return ResponseEntity.ok(blogService.approveBlogPost(id));
    }

    @Operation(summary = "Reject a blog post", description = "Rejects a submitted blog post")
    @PostMapping("/posts/{id}/reject")
    public ResponseEntity<BlogPostDTO> rejectBlogPost(
            @PathVariable String id,
            @RequestBody Map<String, String> payload) {
        String reason = payload.get("reason");
        return ResponseEntity.ok(blogService.rejectBlogPost(id, reason));
    }

    @Operation(summary = "Update null status to draft", description = "Updates all blog posts with null status to draft status")
    @PostMapping("/update-null-status")
    public ResponseEntity<String> updateNullStatus() {
        blogService.updateNullStatusToDraft();
        return ResponseEntity.ok("Updated all null status to DRAFT");
    }

    @Operation(summary = "Get all pending posts", description = "Retrieves all blog posts pending approval")
    @GetMapping("/posts/pending")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<List<BlogPostDTO>> getAllPendingPosts() {
        return ResponseEntity.ok(blogService.getAllPendingPosts());
    }

    @Operation(summary = "Get all posts by current user", description = "Retrieves all blog posts created by the current user")
    @GetMapping("/posts/my")
    public ResponseEntity<List<BlogPostDTO>> getMyPosts(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        return ResponseEntity.ok(blogService.getAllPostsByAuthor(user.getId()));
    }
}
