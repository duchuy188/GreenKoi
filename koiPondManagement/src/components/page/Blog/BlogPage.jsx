import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../config/axios";
import "./BlogPage.css";

export default function BlogPage() {
  const [posts, setPosts] = useState([]);

  const fetchApprovedBlogPosts = async () => {
    try {
      const response = await api.get("/api/blog/posts/approved");
      if (Array.isArray(response.data)) {
        setPosts(response.data);
      } else {
        toast.error("Không tải được các bài viết đã phê duyệt.");
        setPosts([]);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Có lỗi khi tải các bài viết đã được phê duyệt."
      );
      setPosts([]);
    }
  };

  useEffect(() => {
    fetchApprovedBlogPosts();
  }, []);

  return (
    <div className="project-gallery">
      {posts.map((post) => (
        <Link to={`/blog/${post.id}`} key={post.id} className="project-card">
          <div className="project-image-container">
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="project-image"
            />
            <div className="project-overlay">
              <h2 className="project-title" style={{ color: "white" }}>
                {post.title}
              </h2>
              <p className="project-published-at">
                {new Date(post.publishedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
