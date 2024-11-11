import { Component } from "react";
import "./Content.css";
import api from "../../config/axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

export default class Content extends Component {
  constructor(props) {
    super(props);
    this.state = {
      featuredProjects: [],
      blogPosts: [],
    };
  }

  componentDidMount() {
    this.fetchFeaturedProjects();
    this.fetchBlogPosts();
  }

  fetchFeaturedProjects = async () => {
    try {
      const response = await api.get("/api/pond-designs/public");
      if (Array.isArray(response.data)) {
        this.setState({ featuredProjects: response.data.slice(0, 6) });
      } else {
        toast.error("Không tải được các dự án nổi bật!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        this.setState({ featuredProjects: [] });
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Có lỗi khi tải dự án nổi bật!",
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        }
      );
      this.setState({ featuredProjects: [] });
    }
  };

  fetchBlogPosts = async () => {
    try {
      const response = await api.get("/api/blog/posts/approved");
      if (Array.isArray(response.data)) {
        this.setState({ blogPosts: response.data.slice(0, 6) });
      } else {
        toast.error("Không tải được các bài viết!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        this.setState({ blogPosts: [] });
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Có lỗi khi tải các bài viết!",
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        }
      );
      this.setState({ blogPosts: [] });
    }
  };

  render() {
    return (
      <div>
        <div className="container py-5">
          <div className="row align-items-center">
            <div className="col-md-6">
              <div className="position-relative" style={{ height: "300px" }}>
                <img
                  src="https://cayxanhdaiviet.vn/wp-content/uploads/2020/03/thiet-ke-thi-cong-ho-ca-koi.jpg"
                  className="img-fluid w-100 h-100"
                  alt="Koi Pond Experience"
                  style={{ objectFit: "cover" }}
                />
              </div>
            </div>
            <div className="col-md-6">
              <h2 className="mb-4">
                Trải nghiệm không gian thiên nhiên hoàn hảo
              </h2>
              <p className="mb-5">
                Bạn có muốn tạo ra một khu vườn tuyệt vời với hồ cá Koi ngay
                trong không gian sống của mình? Hãy để chúng tôi giúp bạn xây
                dựng một khu vực thư giãn hoàn mỹ, nơi bạn có thể tận hưởng sự
                tươi mới của nước, cây xanh và thiên nhiên. Với các dịch vụ
                chuyên nghiệp về thiết kế, thi công và bảo dưỡng hồ cá Koi,
                chúng tôi cam kết mang đến cho bạn một không gian sống ngoài
                trời đẳng cấp, phù hợp với phong cách và sở thích của bạn.
              </p>
            </div>
          </div>
        </div>

        <div className="container py-5 bg-light">
          <div className="row align-items-center">
            <div className="col-md-6 order-md-2">
              <img
                src="https://storage.googleapis.com/digital-platform/hinh_anh_goi_y_15_mau_thiet_ke_ho_ca_Koi_dep_ai_nhin_cung_me_so_1_c8b8397ee5/hinh_anh_goi_y_15_mau_thiet_ke_ho_ca_Koi_dep_ai_nhin_cung_me_so_1_c8b8397ee5.jpg"
                alt="Koi Pond Design"
                className="img-fluid rounded"
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className="col-md-6 order-md-1">
              <h2 className="mb-4">Thiết kế và xây dựng tiểu cảnh hồ cá Koi</h2>
              <p className="mb-5">
                Tiểu cảnh hồ cá Koi không chỉ là một điểm nhấn trong khu vườn
                của bạn mà còn là biểu tượng của sự thịnh vượng và may mắn.
                Chúng tôi cung cấp dịch vụ thiết kế theo phong cách cá nhân, đảm
                bảo sự hòa hợp giữa hồ cá và các yếu tố thiên nhiên xung quanh.
                Đội ngũ của chúng tôi sẽ tạo ra một không gian sống đầy cảm
                hứng, nơi bạn có thể thư giãn và tận hưởng sự yên bình.
              </p>
            </div>
          </div>
        </div>

        <div className="container py-5">
          <div className="row">
            <div className="col-12">
              <div id="services"></div>
              <h2 className="text-center mb-4">Dịch vụ của chúng tôi</h2>
              <p className="text-center mb-5">
                Cho dù bạn đã sở hữu một hồ cá Koi hay đang muốn nâng cấp không
                gian ngoài trời của mình, chúng tôi sẵn sàng hỗ trợ với các dịch
                vụ thiết kế, thi công và bảo dưỡng chuyên nghiệp.
              </p>

              <div className="row">
                <div className="col-md-6 mb-4">
                  <div className="card h-100 shadow-sm border-0">
                    <div
                      className="position-relative"
                      style={{ height: "300px" }}
                    >
                      <img
                        src="/img/images.jpg"
                        className="card-img-top w-100 h-100"
                        alt="Pond Construction"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <div className="card-body">
                      <h3 className="card-title">
                        Thiết kế thi công hồ cá Koi
                      </h3>
                      <p className="card-text">
                        Chúng tôi cung cấp dịch vụ trọn gói từ thiết kế, thi
                        công đến chăm sóc và bảo dưỡng hồ cá Koi, mang đến không
                        gian sống đẳng cấp và hài hòa với thiên nhiên.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 mb-4">
                  <div className="card h-100 shadow-sm border-0">
                    <div
                      className="position-relative"
                      style={{ height: "300px" }}
                    >
                      <img
                        src="/img/images2.jpg"
                        className="card-img-top w-100 h-100"
                        alt="Pondless Waterfall"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <div className="card-body">
                      <h3 className="card-title">
                        Dọn vệ sinh và bảo dưỡng hồ cá Koi
                      </h3>
                      <p className="card-text">
                        Chúng tôi cung cấp dịch vụ vệ sinh và bảo dưỡng định kỳ,
                        giúp hồ cá Koi của bạn luôn sạch đẹp và đảm bảo môi
                        trường sống lý tưởng cho cá.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container py-5">
          <h2 className="text-center mb-4">Dự án mới nhất</h2>
          <div className="row g-4">
            {this.state.featuredProjects.map((project) => (
              <div key={project.id} className="col-md-4 col-sm-6">
                <Link
                  to={
                    localStorage.getItem("token")
                      ? `/duan/${project.id}`
                      : "/duan"
                  }
                  style={{ textDecoration: "none" }}
                >
                  <div
                    className="card card-duan h-100 position-relative overflow-hidden"
                    style={{ cursor: "pointer" }}
                  >
                    <img
                      src={project.imageUrl}
                      className="card-img-top w-100 h-100"
                      alt={project.name}
                      style={{ objectFit: "cover" }}
                    />
                    <div className="card-img-overlay d-flex flex-column justify-content-end">
                      <h5 className="card-title text-white mb-0">
                        {project.name}
                      </h5>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="container py-5">
          <h2 className="text-center mb-4">Quy trình thực hiện</h2>
          <p className="text-center mb-5">
            Chúng tôi sẽ biến dự án của bạn thành hiện thực, cho phép bạn thư
            giãn và bắt đầu hình dung kết quả cuối cùng. Quy trình đơn giản của
            chúng tôi sẽ biến trải nghiệm xây dựng tiểu cảnh nước của bạn thành
            một hành trình đầy cảm hứng và khó quên.
          </p>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card card-qt h-100 border-0 shadow-sm">
                <div className="card-body text-center ">
                  <img
                    src="https://atlas-content-cdn.pixelsquid.com/stock-images/phone-symbol-logo-w71xA64-600.jpg"
                    alt="Liên hệ"
                    className="card-qt-logo mb-3"
                    style={{ width: "64px" }}
                  />
                  <h3 className="card-title">Liên hệ với chúng tôi</h3>
                  <p className="card-text">
                    Điền vào biểu mẫu và cho chúng tôi biết về tiểu cảnh nước
                    hoặc dịch vụ bạn mong muốn. Chúng tôi sẽ tư vấn qua điện
                    thoại để thảo luận chi tiết về dự án của bạn và trả lời mọi
                    câu hỏi.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card card-qt h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlAKWUbgXHhW9hrmX4ZwfvcRn9zei39LhC_Oq5jJGGUL7pwaR8mxe5Wl-PoHGUJETP-5o&usqp=CAU"
                    alt="Thực hiện"
                    className="card-qt-logo mb-3"
                    style={{ width: "64px" }}
                  />
                  <h3 className="card-title">Chúng tôi bắt tay vào việc</h3>
                  <p className="card-text">
                    Sau khi thống nhất về ý tưởng, chúng tôi sẽ bắt đầu xây
                    dựng, cải tạo hoặc vệ sinh tiểu cảnh nước của bạn. Chúng tôi
                    sẽ tư vấn và cập nhật tiến độ thường xuyên.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card card-qt h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  <img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpCxdsHu0ttWeCExCkATiSmHZ1vIH6SvocEkoL1DntEiVuR9Sqa5WUTqS6cCXQYScWw6E&usqp=CAU"
                    alt="Tận hưởng"
                    className="card-qt-logo mb-3"
                    style={{ width: "64px" }}
                  />
                  <h3 className="card-title">Tận hưởng tiểu cảnh của bạn</h3>
                  <p className="card-text">
                    Toàn bộ không gian ngoài trời của bạn sẽ trở nên sống động.
                    Gia đình và bạn bè có thể tụ họp và tận hưởng lợi ích của
                    thiên nhiên ngay trong sân nhà bạn.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container py-5">
          <h2 className="text-center mb-4">Blog mới nhất</h2>
          <div className="row g-4">
            {this.state.blogPosts.map((post) => (
              <div key={post.id} className="col-md-4">
                <Link
                  to={`/blog/${post.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <div className="card card-duan h-100">
                    <div className="card-image-container">
                      <img
                        src={post.coverImageUrl}
                        className="card-img-top"
                        alt={post.title}
                      />
                    </div>
                    <div className="card-img-overlay d-flex flex-column justify-content-end">
                      <h5 className="card-title text-white mb-0">
                        {post.title}
                      </h5>
                    </div>
                    <div className="date-badge">
                      <span className="day">
                        {new Date(post.publishedAt).getDate()}
                      </span>
                      <span className="month">
                        Th{new Date(post.publishedAt).getMonth() + 1}
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}
