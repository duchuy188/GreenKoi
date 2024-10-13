package com.koipond.backend.repository;

import com.koipond.backend.model.BlogCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BlogCategoryRepository extends JpaRepository<BlogCategory, String> {
    BlogCategory findByName(String name);

    default BlogCategory findOrCreateDefaultCategory() {
        BlogCategory defaultCategory = findByName("Default");
        if (defaultCategory == null) {
            defaultCategory = new BlogCategory("Default", "Default category for all blog posts");
            save(defaultCategory);
        }
        return defaultCategory;
    }
}
