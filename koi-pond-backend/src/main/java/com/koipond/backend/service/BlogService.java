package com.koipond.backend.service;

import com.koipond.backend.dto.BlogPostDTO;
import com.koipond.backend.model.BlogPost;
import com.koipond.backend.model.User;
import com.koipond.backend.model.BlogCategory;
import com.koipond.backend.repository.BlogPostRepository;
import com.koipond.backend.repository.UserRepository;
import com.koipond.backend.repository.BlogCategoryRepository;
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
    private final BlogCategoryRepository blogCategoryRepository;

    public BlogService(BlogPostRepository blogPostRepository, UserRepository userRepository, BlogCategoryRepository blogCategoryRepository) {
        this.blogPostRepository = blogPostRepository;
        this.userRepository = userRepository;
        this.blogCategoryRepository = blogCategoryRepository;
    }

    @Transactional
    public BlogPostDTO createDraft(BlogPostDTO blogPostDTO, String username) {
        logger.info("Creating draft blog post for author: {}", username);
        
        User author = userRepository.findByUsername(username)
            .orElseThrow(() -> new UserNotFoundException("User not found with username: " + username));
        
        // Sử dụng danh mục mặc định
        BlogCategory defaultCategory = blogCategoryRepository.findOrCreateDefaultCategory();

        BlogPost blogPost = new BlogPost();
        blogPost.setTitle(blogPostDTO.getTitle());
        blogPost.setContent(blogPostDTO.getContent());
        blogPost.setAuthor(author);
        blogPost.setCategory(defaultCategory);
        blogPost.setStatus(BlogPost.BlogPostStatus.DRAFT);
        blogPost.setCreatedAt(LocalDateTime.now());
        blogPost.setUpdatedAt(LocalDateTime.now());
        blogPost.setImageUrl(blogPostDTO.getImageUrl());
        blogPost.setActive(true);

        BlogPost savedBlogPost = blogPostRepository.save(blogPost);
        logger.info("Draft blog post created with ID: {}", savedBlogPost.getId());
        return convertToDTO(savedBlogPost);
    }

    @Transactional
    public BlogPostDTO updateDraft(String id, BlogPostDTO blogPostDTO) {
        logger.info("Updating draft blog post with ID: {}", id);
        BlogPost existingPost = blogPostRepository.findById(id)
                .orElseThrow(() -> new BlogPostNotFoundException("Blog post not found with ID: " + id));

        if (existingPost.getStatus() != BlogPost.BlogPostStatus.DRAFT) {
            throw new InvalidBlogPostStateException("Only drafts can be updated");
        }

        updateBlogPostFields(existingPost, blogPostDTO);
        existingPost.setUpdatedAt(LocalDateTime.now());
        BlogPost updatedPost = blogPostRepository.save(existingPost);
        logger.info("Draft blog post updated successfully");
        return convertToDTO(updatedPost);
    }

    @Transactional
    public BlogPostDTO submitForApproval(String id) {
        logger.info("Submitting blog post for approval, ID: {}", id);
        BlogPost blogPost = blogPostRepository.findById(id)
                .orElseThrow(() -> new BlogPostNotFoundException("Blog post not found with ID: " + id));

        if (blogPost.getStatus() != BlogPost.BlogPostStatus.DRAFT) {
            throw new InvalidBlogPostStateException("Only drafts can be submitted for approval");
        }

        blogPost.setStatus(BlogPost.BlogPostStatus.PENDING_APPROVAL);
        blogPost.setUpdatedAt(LocalDateTime.now());
        BlogPost updatedPost = blogPostRepository.save(blogPost);
        logger.info("Blog post submitted for approval successfully");
        return convertToDTO(updatedPost);
    }

    @Transactional
    public BlogPostDTO approveBlogPost(String id) {
        logger.info("Approving blog post with ID: {}", id);
        BlogPost blogPost = blogPostRepository.findById(id)
                .orElseThrow(() -> new BlogPostNotFoundException("Blog post not found with ID: " + id));

        if (blogPost.getStatus() != BlogPost.BlogPostStatus.PENDING_APPROVAL) {
            throw new InvalidBlogPostStateException("Only pending posts can be approved");
        }

        blogPost.setStatus(BlogPost.BlogPostStatus.APPROVED);
        blogPost.setPublishedAt(LocalDateTime.now());
        blogPost.setUpdatedAt(LocalDateTime.now());
        BlogPost updatedPost = blogPostRepository.save(blogPost);
        logger.info("Blog post approved successfully");
        return convertToDTO(updatedPost);
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

    @Transactional
    public void updateNullStatusToDraft() {
        logger.info("Updating blog posts with null status to DRAFT");
        List<BlogPost> postsWithNullStatus = blogPostRepository.findByStatusIsNull();
        for (BlogPost post : postsWithNullStatus) {
            post.setStatus(BlogPost.BlogPostStatus.DRAFT);
            post.setUpdatedAt(LocalDateTime.now());
        }
        blogPostRepository.saveAll(postsWithNullStatus);
        logger.info("{} blog posts updated from null status to DRAFT", postsWithNullStatus.size());
    }

    // Helper methods
    private void updateBlogPostFields(BlogPost existingPost, BlogPostDTO blogPostDTO) {
        existingPost.setTitle(blogPostDTO.getTitle());
        existingPost.setContent(blogPostDTO.getContent());
        existingPost.setImageUrl(blogPostDTO.getImageUrl());
        // Không cần cập nhật category vì chúng ta sử dụng category mặc định
    }

    private BlogPostDTO convertToDTO(BlogPost entity) {
        BlogPostDTO dto = new BlogPostDTO();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setContent(entity.getContent());
        dto.setAuthorId(entity.getAuthor().getId());
        dto.setImageUrl(entity.getImageUrl());
        dto.setStatus(entity.getStatus().name());
        dto.setPublishedAt(entity.getPublishedAt());
        dto.setActive(entity.isActive());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        dto.setRejectionReason(entity.getRejectionReason()); // Thêm dòng này
        return dto;
    }

    public List<BlogPostDTO> getAllPendingPosts() {
        logger.info("Fetching all pending blog posts");
        List<BlogPost> pendingPosts = blogPostRepository.findByStatus(BlogPost.BlogPostStatus.PENDING_APPROVAL);
        return pendingPosts.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<BlogPostDTO> getAllPostsByAuthor(String authorId) {
        logger.info("Fetching all blog posts for author: {}", authorId);
        List<BlogPost> authorPosts = blogPostRepository.findByAuthorId(authorId);
        return authorPosts.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
}
