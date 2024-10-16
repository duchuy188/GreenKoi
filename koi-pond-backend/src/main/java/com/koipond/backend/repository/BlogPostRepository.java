package com.koipond.backend.repository;

import com.koipond.backend.model.BlogPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BlogPostRepository extends JpaRepository<BlogPost, String> {
    
   
    // Phương thức để tìm tất cả các bài viết có trạng thái
    List<BlogPost> findByStatus(BlogPost.BlogPostStatus status);

    // Phương thức để tìm tất cả các bài viết của một người dùng
    List<BlogPost> findByAuthorId(String authorId);

   
}
