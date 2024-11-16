import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  Card,
  Typography,
  Tag,
  Space,
  Progress,
  Spin,
  Button,
  Empty,
  Switch,
  Modal,
} from "antd";
import { toast } from "react-toastify";
import api from "../../../config/axios";
import moment from "moment";
import { ReloadOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;

const ProjectTasks = () => {
  const [projectInfo, setProjectInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [isPollingEnabled, setIsPollingEnabled] = useState(true);
  const pollingIntervalRef = useRef(null);
  const [isDescriptionModalVisible, setIsDescriptionModalVisible] =
    useState(false);

  useEffect(() => {
    fetchConstructorProject();

    if (isPollingEnabled) {
      pollingIntervalRef.current = setInterval(() => {
        if (document.visibilityState === "visible") {
          fetchConstructorProject(true);
        }
      }, 30000);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [isPollingEnabled]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchConstructorProject(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const togglePolling = () => {
    setIsPollingEnabled((prev) => !prev);
  };

  const fetchConstructorProject = async (isBackgroundRefresh = false) => {
    try {
      if (!isBackgroundRefresh) {
        setLoading(true);
      }
      const response = await api.get("/api/projects/constructor");
      if (
        response.data &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        const activeProject = response.data.find(
          (project) =>
            project.statusName !== "COMPLETED" &&
            project.status !== "PS6" &&
            project.statusName !== "CANCELLED"
        );

        if (activeProject) {
          setProjectInfo(activeProject);
          if (activeProject.id) {
            await fetchProjectTasks(activeProject.id);
          } else {
            console.error("Project ID is missing");
          }
        } else {
          setProjectInfo(null);
          setTasks([]);
        }
      } else {
        console.error("Invalid project data received or no projects available");
        setProjectInfo(null);
        setTasks([]);
      }
    } catch (error) {
      console.error("Error fetching constructor project:", error);
      if (!isBackgroundRefresh) {
        toast.error("Không thể tải thông tin dự án");
      }
    } finally {
      if (!isBackgroundRefresh) {
        setLoading(false);
      }
    }
  };

  const fetchProjectTasks = async (projectId) => {
    try {
      const response = await api.get(
        `/api/projects/${projectId}/project-tasks`
      );
      setTasks(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching project tasks:", error);
      toast.error("Không thể tải danh sách nhiệm vụ");
      setTasks([]);
    }
  };

  const canUpdateTask = (currentIndex) => {
    if (currentIndex === 0) return true;
    const previousTask = tasks[currentIndex - 1];
    return previousTask?.completionPercentage === 100;
  };

  const updateTaskStatus = async (taskId, newPercentage, currentIndex) => {
    try {
      if (
        projectInfo?.statusName === "COMPLETED" ||
        projectInfo?.status === "PS6"
      ) {
        toast.warning("Không thể cập nhật - dự án đã hoàn thành");
        return;
      }

      if (!canUpdateTask(currentIndex)) {
        toast.warning("Vui lòng hoàn thành nhiệm vụ trước đó");
        return;
      }

      let newStatus;
      if (newPercentage === 0) {
        newStatus = "pending";
      } else if (newPercentage < 100) {
        newStatus = "in process";
      } else {
        newStatus = "COMPLETED";
      }

      if (tasks.find((task) => task.id === taskId)?.status === "COMPLETED") {
        toast.warning("Không thể cập nhật nhiệm vụ đã hoàn thành");
        return;
      }

      await api.patch(
        `/api/tasks/${taskId}/status?newStatus=${newStatus}&completionPercentage=${newPercentage}`
      );

      const updatedTasks = tasks.map((task) =>
        task.id === taskId
          ? { ...task, status: newStatus, completionPercentage: newPercentage }
          : task
      );
      setTasks(updatedTasks);

      const totalProgress = updatedTasks.reduce(
        (sum, task) => sum + (task.completionPercentage || 0),
        0
      );
      const averageProgress = totalProgress / updatedTasks.length;
      setProjectInfo((prev) => ({
        ...prev,
        progressPercentage: Math.round(averageProgress),
      }));

      toast.success("Cập nhật nhiệm vụ thành công");
    } catch (error) {
      console.error("Error details:", error.response?.data);
      toast.error(
        `Cập nhật thất bại: ${error.response?.data?.message || error.message}`
      );
    }
  };

  const markTechnicallyCompleted = async () => {
    try {
      if (
        projectInfo?.statusName === "COMPLETED" ||
        projectInfo?.status === "PS6"
      ) {
        toast.warning("Dự án đã được hoàn thành");
        return;
      }

      if (!projectInfo?.id) {
        toast.error("Không tìm thấy ID dự án");
        return;
      }

      const allTasksCompleted = tasks.every(
        (task) => task.completionPercentage === 100
      );
      if (!allTasksCompleted) {
        toast.warning(
          "Tất cả nhiệm vụ phải hoàn thành trước khi đánh dấu dự án hoàn thành kỹ thuật"
        );
        return;
      }

      await api.patch(
        `/api/projects/${projectInfo.id}/mark-technically-completed`
      );
      toast.success("Đã đánh dấu dự án hoàn thành kỹ thuật");
      await fetchConstructorProject();
    } catch (error) {
      console.error("Error marking project as technically completed:", error);
      toast.error("Không thể đánh dấu dự án hoàn thành kỹ thuật");
    }
  };

  const columns = [
    {
      title: "Số thứ tự",
      key: "index",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Project ID",
      dataIndex: "projectId",
      key: "projectId",
      hidden: true,
    },
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      render: (description) => (
        <div dangerouslySetInnerHTML={{ __html: description }} />
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let statusText;
        let color;

        switch (status?.toUpperCase()) {
          case "COMPLETED":
            statusText = "HOÀN THÀNH";
            color = "green";
            break;
          case "IN PROCESS":
            statusText = "ĐANG XỬ LÝ";
            color = "blue";
            break;
          case "PENDING":
            statusText = "CHỜ XỬ LÝ";
            color = "blue";
            break;
          case "TECHNICALLY_COMPLETED":
            statusText = "HOÀN THÀNH KỸ THUẬT";
            color = "green";
            break;
          default:
            statusText = "N/A";
            color = "default";
        }

        return <Tag color={color}>{statusText}</Tag>;
      },
    },
    {
      title: "Phần trăm hoàn thành",
      dataIndex: "completionPercentage",
      key: "completionPercentage",
      render: (percentage, record, index) => (
        <Space>
          <Progress percent={percentage || 0} size="small" />
          {record.status !== "COMPLETED" && (
            <Button
              onClick={() =>
                updateTaskStatus(
                  record.id,
                  Math.min((percentage || 0) + 25, 100),
                  index
                )
              }
              disabled={!canUpdateTask(index)}
            >
              Cập nhật
            </Button>
          )}
        </Space>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) =>
        date ? moment(date).format("DD-MM-YYYY HH:mm:ss") : "N/A",
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date) =>
        date ? moment(date).format("DD-MM-YYYY HH:mm:ss") : "N/A",
    },
  ];

  const renderDescriptionModal = () => (
    <Modal
      title={
        <div
          style={{
            fontSize: "20px",
            fontWeight: "bold",
            color: "#1890ff",
            borderBottom: "2px solid #1890ff",
            paddingBottom: "8px",
            marginBottom: "16px",
          }}
        >
          Chi tiết mô tả
        </div>
      }
      open={isDescriptionModalVisible}
      onCancel={() => setIsDescriptionModalVisible(false)}
      footer={[
        <Button
          key="close"
          onClick={() => setIsDescriptionModalVisible(false)}
          style={{
            borderRadius: "6px",
            fontWeight: "500",
          }}
        >
          Đóng
        </Button>,
      ]}
      width={500}
      style={{
        top: "20%",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
        }}
      >
        <div
          dangerouslySetInnerHTML={{
            __html: projectInfo?.description || "N/A",
          }}
          style={{
            padding: "16px",
            maxHeight: "60vh",
            overflowY: "auto",
            lineHeight: "1.6",
            fontSize: "14px",
          }}
        />
      </div>
    </Modal>
  );

  if (loading) {
    return <Spin size="large" />;
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Title level={2}>Nhiệm vụ dự án</Title>
      </div>

      {projectInfo ? (
        <>
          <Card style={{ marginBottom: 16 }}>
            <Title level={4}>{projectInfo.name || "N/A"}</Title>
            <div>
              Mô tả:{" "}
              <Button
                type="link"
                onClick={() => setIsDescriptionModalVisible(true)}
              >
                Xem chi tiết
              </Button>
            </div>

            {renderDescriptionModal()}

            <Space
              direction="vertical"
              style={{ width: "100%", marginTop: 16 }}
            >
              <Text>Tiến độ chung:</Text>
              <Progress percent={projectInfo.progressPercentage || 0} />
            </Space>

            <Space
              direction="vertical"
              style={{ width: "100%", marginTop: 16 }}
            >
              <Text>
                Trạng thái:{" "}
                {(() => {
                  switch (projectInfo.statusName?.toUpperCase()) {
                    case "COMPLETED":
                      return "HOÀN THÀNH";
                    case "IN_PROGRESS":
                      return "ĐANG XỬ LÝ";
                    case "PENDING":
                      return "CHỜ XỬ LÝ";
                    case "CANCELLED":
                      return "Dự án bị hủy";
                    case "TECHNICALLY_COMPLETED":
                      return "HOÀN THÀNH KỸ THUẬT";
                    default:
                      return projectInfo.statusName || "N/A";
                  }
                })()}
              </Text>

              <Text>
                Ngày bắt đầu:{" "}
                {projectInfo.startDate
                  ? moment(projectInfo.startDate).format("DD-MM-YYYY")
                  : "N/A"}
              </Text>

              <Text>
                Ngày kết thúc:{" "}
                {projectInfo.endDate
                  ? moment(projectInfo.endDate).format("DD-MM-YYYY")
                  : "N/A"}
              </Text>
            </Space>

            {tasks.length > 0 &&
              tasks.every((task) => task.completionPercentage === 100) && (
                <Button
                  type="primary"
                  onClick={markTechnicallyCompleted}
                  style={{ marginTop: 16 }}
                >
                  Đã hoàn thành về mặt kỹ thuật
                </Button>
              )}
          </Card>
          <Table
            columns={columns}
            dataSource={tasks}
            rowKey="id"
            locale={{ emptyText: "No tasks available" }}
          />
        </>
      ) : (
        <Empty description="Không có dự án đang thực hiện" />
      )}
    </div>
  );
};

export default ProjectTasks;
