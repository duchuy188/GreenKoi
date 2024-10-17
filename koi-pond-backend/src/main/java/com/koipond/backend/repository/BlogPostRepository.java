package com.koipond.backend.repository;

import com.koipond.backend.model.BlogPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BlogPostRepository extends JpaRepository<BlogPost, String> {
    
    // Phương thức để tìm tất cả các bài viết có trạng thái và còn hoạt động
    List<BlogPost> findByStatusAndIsActiveTrue(BlogPost.BlogPostStatus status);

    // Phương thức để tìm tất cả các bài viết của một người dùng và còn hoạt động
    List<BlogPost> findByAuthorIdAndIsActiveTrue(String authorId);

    // Phương thức để tìm một bài viết theo ID và còn hoạt động
    Optional<BlogPost> findByIdAndIsActiveTrue(String id);

    // Phương thức để tìm tất cả các bài viết còn hoạt động
    List<BlogPost> findByIsActiveTrue();

    // Giữ lại các phương thức cũ để tương thích ngược (nếu cần)
    List<BlogPost> findByStatus(BlogPost.BlogPostStatus status);
    List<BlogPost> findByAuthorId(String authorId);
}
