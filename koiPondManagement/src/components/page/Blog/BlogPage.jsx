import ListBlog from "../../Share/listblog";
import { Link } from "react-router-dom";
import "./BlogPage.css";

export default function BlogPage() {
  return (
    <div className="blog-container">
      {ListBlog.map((blog) => (
        <div key={blog.id} className="blog-card">
          <Link to={`/blog/${blog.id}`}>
            <img src={blog.img} alt={blog.name} className="blog-image" />
          </Link>
          <div className="blog-content">
            <h2 className="blog-title">{blog.name}</h2>
            <p className="blog-description">{blog.description}</p>
            <p className="blog-date">{blog.date}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
