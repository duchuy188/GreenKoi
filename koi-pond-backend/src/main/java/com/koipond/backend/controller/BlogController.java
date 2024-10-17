package com.koipond.backend.controller;

import com.koipond.backend.dto.BlogPostDTO;
import com.koipond.backend.service.BlogService;
import com.koipond.backend.model.User;
import com.koipond.backend.repository.UserRepository;
import com.koipond.backend.exception.UserNotFoundException;
import com.koipond.backend.exception.BlogPostNotFoundException;
import com.koipond.backend.exception.InvalidBlogPostStateException;
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
    @PreAuthorize("hasAnyRole('MANAGER', 'CONSULTING_STAFF', 'DESIGN_STAFF', 'CONSTRUCTION_STAFF')")
    public ResponseEntity<BlogPostDTO> createDraft(
            @RequestBody BlogPostDTO blogPostDTO,
            Authentication authentication) {
        String username = authentication.getName();
        // Không cần set active ở đây, để BlogService xử lý
        return ResponseEntity.ok(blogService.createDraft(blogPostDTO, username));
    }

    @Operation(summary = "Update a draft", description = "Updates an existing blog post draft")
    @PutMapping("/drafts/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'CONSULTING_STAFF', 'DESIGN_STAFF', 'CONSTRUCTION_STAFF')")
    public ResponseEntity<BlogPostDTO> updateDraft(
            @Parameter(description = "ID of the draft to update") @PathVariable String id,
            @RequestBody BlogPostDTO blogPostDTO) {
        // Không cần set active ở đây
        return ResponseEntity.ok(blogService.updateDraft(id, blogPostDTO));
    }

    @Operation(summary = "Submit a draft for approval", description = "Submits a draft blog post for approval")
    @PostMapping("/drafts/{id}/submit")
    @PreAuthorize("hasAnyRole('MANAGER', 'CONSULTING_STAFF', 'DESIGN_STAFF', 'CONSTRUCTION_STAFF')")
    public ResponseEntity<BlogPostDTO> submitForApproval(
            @Parameter(description = "ID of the draft to submit") @PathVariable String id) {
        return ResponseEntity.ok(blogService.submitForApproval(id));
    }

    @Operation(summary = "Approve a blog post", description = "Approves a submitted blog post")
    @PostMapping("/posts/{id}/approve")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<BlogPostDTO> approveBlogPost(
            @Parameter(description = "ID of the blog post to approve") @PathVariable String id) {
        return ResponseEntity.ok(blogService.approveBlogPost(id));
    }

    @Operation(summary = "Reject a blog post", description = "Rejects a submitted blog post")
    @PostMapping("/posts/{id}/reject")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<BlogPostDTO> rejectBlogPost(
            @PathVariable String id,
            @RequestBody Map<String, String> payload) {
        String reason = payload.get("reason");
        return ResponseEntity.ok(blogService.rejectBlogPost(id, reason));
    }

    @Operation(summary = "Get all pending posts", description = "Retrieves all blog posts pending approval")
    @GetMapping("/posts/pending")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<List<BlogPostDTO>> getAllPendingPosts() {
        return ResponseEntity.ok(blogService.getAllPendingPosts());
    }

    @Operation(summary = "Get all posts by current user", description = "Retrieves all blog posts created by the current user")
    @GetMapping("/posts/my")
    @PreAuthorize("hasAnyRole('MANAGER', 'CONSULTING_STAFF', 'DESIGN_STAFF', 'CONSTRUCTION_STAFF')")
    public ResponseEntity<List<BlogPostDTO>> getMyPosts(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        return ResponseEntity.ok(blogService.getAllPostsByAuthor(user.getId()));
    }

    @Operation(summary = "Get all approved posts", description = "Retrieves all approved and active blog posts for public viewing")
    @GetMapping("/posts/approved")
    public ResponseEntity<List<BlogPostDTO>> getAllApprovedPosts() {
        return ResponseEntity.ok(blogService.getAllApprovedAndActivePosts());
    }

    @Operation(summary = "Get blog post by ID", description = "Retrieves an active blog post by its ID")
    @GetMapping("/posts/{id}")
    public ResponseEntity<BlogPostDTO> getBlogPostById(
            @Parameter(description = "ID of the blog post to retrieve") @PathVariable String id) {
        return ResponseEntity.ok(blogService.getActiveBlogPostById(id));
    }

    @Operation(summary = "Soft delete a draft", description = "Marks a draft blog post as deleted (only for the author)")
    @DeleteMapping("/drafts/{id}")
    @PreAuthorize("hasRole('DESIGN_STAFF')")
    public ResponseEntity<Void> softDeleteDraft(
            @Parameter(description = "ID of the draft to delete") @PathVariable String id,
            Authentication authentication) {
        String username = authentication.getName();
        blogService.softDeleteDraft(id, username);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Soft delete an approved post", description = "Marks an approved blog post as deleted")
    @DeleteMapping("/posts/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<Void> softDeleteApprovedPost(
            @Parameter(description = "ID of the approved post to delete") @PathVariable String id,
            Authentication authentication) {
        String username = authentication.getName();
        blogService.softDeleteApprovedPost(id, username);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get all approved posts for manager", 
               description = "Retrieves all approved blog posts, including both active and inactive (soft-deleted) ones, for manager viewing")
    @GetMapping("/posts/approved/all")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<List<BlogPostDTO>> getAllApprovedPostsForManager() {
        return ResponseEntity.ok(blogService.getAllApprovedPostsForManager());
    }

    @Operation(summary = "Restore a soft-deleted approved post", description = "Restores a soft-deleted approved blog post")
    @PostMapping("/posts/{id}/restore")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<Void> restoreApprovedPost(
            @Parameter(description = "ID of the approved post to restore") @PathVariable String id) {
        blogService.restoreApprovedPost(id);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler({BlogPostNotFoundException.class, InvalidBlogPostStateException.class})
    public ResponseEntity<String> handleBlogExceptions(Exception ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }
}
