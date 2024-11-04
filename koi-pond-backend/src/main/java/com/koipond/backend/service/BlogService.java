package com.koipond.backend.service;

import com.koipond.backend.dto.BlogPostDTO;
import com.koipond.backend.model.BlogPost;
import com.koipond.backend.model.User;
import com.koipond.backend.repository.BlogPostRepository;
import com.koipond.backend.repository.UserRepository;
import com.koipond.backend.exception.BlogPostNotFoundException;
import com.koipond.backend.exception.InvalidBlogPostStateException;
import com.koipond.backend.exception.UserNotFoundException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BlogService {
    private static final Logger logger = LoggerFactory.getLogger(BlogService.class);

    private final BlogPostRepository blogPostRepository;
    private final UserRepository userRepository;

    public BlogService(BlogPostRepository blogPostRepository, UserRepository userRepository) {
        this.blogPostRepository = blogPostRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public BlogPostDTO createDraft(BlogPostDTO blogPostDTO, String username) {
        synchronized (username.intern()) {
            logger.info("Creating draft blog post for author: {}", username);
            
            User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found with username: " + username));

            BlogPost blogPost = new BlogPost();
            updateBlogPostFields(blogPost, blogPostDTO);
            blogPost.setAuthor(author);
            blogPost.setStatus(BlogPost.BlogPostStatus.DRAFT);
            blogPost.setCreatedAt(LocalDateTime.now());
            blogPost.setUpdatedAt(LocalDateTime.now());
            blogPost.setActive(true);

            BlogPost savedBlogPost = blogPostRepository.save(blogPost);
            logger.info("Draft blog post created with ID: {}", savedBlogPost.getId());
            return convertToDTO(savedBlogPost);
        }
    }

    @Transactional
    public BlogPostDTO updateDraft(String id, BlogPostDTO blogPostDTO) {
        synchronized (id.intern()) {
            logger.info("Updating draft blog post with ID: {}", id);
            BlogPost existingPost = blogPostRepository.findById(id)
                    .orElseThrow(() -> new BlogPostNotFoundException("Blog post not found with ID: " + id));

            validateBlogPostState(existingPost, "update", BlogPost.BlogPostStatus.DRAFT);

            updateBlogPostFields(existingPost, blogPostDTO);
            existingPost.setUpdatedAt(LocalDateTime.now());
            BlogPost updatedPost = blogPostRepository.save(existingPost);
            logger.info("Draft blog post updated successfully");
            return convertToDTO(updatedPost);
        }
    }

    @Transactional
    public BlogPostDTO submitForApproval(String id) {
        synchronized (id.intern()) {
            logger.info("Submitting blog post for approval, ID: {}", id);
            BlogPost blogPost = blogPostRepository.findById(id)
                    .orElseThrow(() -> new BlogPostNotFoundException("Blog post not found with ID: " + id));

            validateBlogPostState(blogPost, "submit", BlogPost.BlogPostStatus.DRAFT);

            blogPost.setStatus(BlogPost.BlogPostStatus.PENDING_APPROVAL);
            blogPost.setUpdatedAt(LocalDateTime.now());
            BlogPost updatedPost = blogPostRepository.save(blogPost);
            logger.info("Blog post submitted for approval successfully");
            return convertToDTO(updatedPost);
        }
    }

    @Transactional
    public BlogPostDTO approveBlogPost(String id) {
        synchronized (id.intern()) {
            logger.info("Approving blog post with ID: {}", id);
            BlogPost blogPost = blogPostRepository.findById(id)
                    .orElseThrow(() -> new BlogPostNotFoundException("Blog post not found with ID: " + id));

            validateBlogPostState(blogPost, "approve", BlogPost.BlogPostStatus.PENDING_APPROVAL);

            blogPost.setStatus(BlogPost.BlogPostStatus.APPROVED);
            blogPost.setPublishedAt(LocalDateTime.now());
            blogPost.setUpdatedAt(LocalDateTime.now());
            BlogPost updatedPost = blogPostRepository.save(blogPost);
            logger.info("Blog post approved successfully");
            return convertToDTO(updatedPost);
        }
    }

    @Transactional
    public BlogPostDTO rejectBlogPost(String id, String reason) {
        logger.info("Rejecting blog post with ID: {}", id);
        BlogPost blogPost = blogPostRepository.findById(id)
                .orElseThrow(() -> new BlogPostNotFoundException("Blog post not found with ID: " + id));

        if (blogPost.getStatus() != BlogPost.BlogPostStatus.PENDING_APPROVAL) {
            throw new InvalidBlogPostStateException("Only pending posts can be rejected");
        }

        blogPost.setStatus(BlogPost.BlogPostStatus.REJECTED);
        blogPost.setRejectionReason(reason);
        blogPost.setUpdatedAt(LocalDateTime.now());
        BlogPost updatedPost = blogPostRepository.save(blogPost);
        logger.info("Blog post rejected successfully");
        return convertToDTO(updatedPost);
    }

   

    // Helper methods
    private void updateBlogPostFields(BlogPost existingPost, BlogPostDTO blogPostDTO) {
        existingPost.setTitle(blogPostDTO.getTitle());
        existingPost.setContent(blogPostDTO.getContent());
        existingPost.setCoverImageUrl(blogPostDTO.getCoverImageUrl());
    }

    private BlogPostDTO convertToDTO(BlogPost entity) {
        BlogPostDTO dto = new BlogPostDTO();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setContent(entity.getContent());
        dto.setAuthorId(entity.getAuthor().getId());
        dto.setCoverImageUrl(entity.getCoverImageUrl());
        dto.setStatus(entity.getStatus().name());
        
        if (entity.getStatus() == BlogPost.BlogPostStatus.APPROVED) {
            dto.setPublishedAt(entity.getPublishedAt());
        } else {
            dto.setPublishedAt(null);
        }
        
        dto.setActive(entity.isActive());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        dto.setRejectionReason(entity.getRejectionReason());
        return dto;
    }

    public List<BlogPostDTO> getAllPendingPosts() {
        logger.info("Fetching all pending and active blog posts");
        List<BlogPost> pendingPosts = blogPostRepository.findByStatusAndIsActiveTrue(BlogPost.BlogPostStatus.PENDING_APPROVAL);
        return pendingPosts.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<BlogPostDTO> getAllPostsByAuthor(String authorId) {
        logger.info("Fetching all active blog posts for author: {}", authorId);
        List<BlogPost> authorPosts = blogPostRepository.findByAuthorIdAndIsActiveTrue(authorId);
        return authorPosts.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<BlogPostDTO> getAllApprovedPosts() {
        logger.info("Fetching all approved and active blog posts");
        List<BlogPost> approvedPosts = blogPostRepository.findByStatusAndIsActiveTrue(BlogPost.BlogPostStatus.APPROVED);
        return approvedPosts.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public BlogPostDTO getBlogPostById(String id) {
        logger.info("Fetching active blog post with ID: {}", id);
        BlogPost blogPost = blogPostRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new BlogPostNotFoundException("Active blog post not found with ID: " + id));
        return convertToDTO(blogPost);
    }

    @Transactional
    public void softDeleteDraft(String id, String username) {
        synchronized (id.intern()) {
            logger.info("Soft deleting draft blog post with ID: {} by user: {}", id, username);
            BlogPost draft = blogPostRepository.findById(id)
                    .orElseThrow(() -> new BlogPostNotFoundException("Draft not found with ID: " + id));

            validateBlogPostState(draft, "delete", BlogPost.BlogPostStatus.DRAFT);

            if (!draft.getAuthor().getUsername().equals(username)) {
                throw new InvalidBlogPostStateException("You can only delete your own drafts");
            }

            draft.setActive(false);
            draft.setUpdatedAt(LocalDateTime.now());
            blogPostRepository.save(draft);
            logger.info("Draft blog post soft deleted successfully");
        }
    }

    @Transactional
    public void softDeleteApprovedPost(String id, String username) {
        logger.info("Soft deleting approved blog post with ID: {} by user: {}", id, username);
        BlogPost post = blogPostRepository.findById(id)
                .orElseThrow(() -> new BlogPostNotFoundException("Blog post not found with ID: " + id));

        if (post.getStatus() != BlogPost.BlogPostStatus.APPROVED) {
            throw new InvalidBlogPostStateException("Only approved posts can be deleted");
        }

        // Assuming only managers can delete approved posts, so no need to check the author

        post.setActive(false);
        post.setUpdatedAt(LocalDateTime.now());
        blogPostRepository.save(post);
        logger.info("Approved blog post soft deleted successfully");
    }

    public List<BlogPostDTO> getAllApprovedAndActivePosts() {
        logger.info("Fetching all approved and active blog posts");
        List<BlogPost> approvedPosts = blogPostRepository.findByStatusAndIsActiveTrue(BlogPost.BlogPostStatus.APPROVED);
        return approvedPosts.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public BlogPostDTO getActiveBlogPostById(String id) {
        logger.info("Fetching active blog post with ID: {}", id);
        BlogPost blogPost = blogPostRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new BlogPostNotFoundException("Active blog post not found with ID: " + id));
        return convertToDTO(blogPost);
    }

    public List<BlogPostDTO> getAllApprovedPostsForManager() {
        logger.info("Fetching all approved blog posts for manager, including both active and inactive ones");
        List<BlogPost> approvedPosts = blogPostRepository.findAllByStatus(BlogPost.BlogPostStatus.APPROVED);
        return approvedPosts.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Transactional
    public void restoreApprovedPost(String id) {
        logger.info("Restoring soft-deleted approved blog post with ID: {}", id);
        BlogPost post = blogPostRepository.findById(id)
                .orElseThrow(() -> new BlogPostNotFoundException("Blog post not found with ID: " + id));

        if (post.getStatus() != BlogPost.BlogPostStatus.APPROVED) {
            throw new InvalidBlogPostStateException("Only approved posts can be restored");
        }

        if (post.isActive()) {
            throw new InvalidBlogPostStateException("This post is already active");
        }

        post.setActive(true);
        post.setUpdatedAt(LocalDateTime.now());
        blogPostRepository.save(post);
        logger.info("Approved blog post restored successfully");
    }

    private void validateBlogPostState(BlogPost post, String action, BlogPost.BlogPostStatus requiredStatus) {
        if (post.getStatus() != requiredStatus) {
            String message = String.format("Cannot %s blog post. Required status: %s, Current status: %s",
                action, requiredStatus, post.getStatus());
            logger.warn(message);
            throw new InvalidBlogPostStateException(message);
        }
        
        if (!post.isActive()) {
            String message = String.format("Cannot %s inactive blog post", action);
            logger.warn(message);
            throw new InvalidBlogPostStateException(message);
        }
    }
}
