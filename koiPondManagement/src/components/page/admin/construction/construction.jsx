import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Typography,
  Tag,
  Space,
  Progress,
  Spin,
  Button,
} from "antd";
import { toast } from "react-toastify";
import api from "../../../config/axios";
import moment from "moment";

const { Text, Title } = Typography;

const ProjectTasks = () => {
  const [projectInfo, setProjectInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchConstructorProject();
  }, []);

  const fetchConstructorProject = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/projects/constructor");
      if (
        response.data &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        const project = response.data[0];
        setProjectInfo(project);
        if (project.id) {
          await fetchProjectTasks(project.id);
        } else {
          console.error("Project ID is missing");
        }
      } else {
        console.error("Invalid project data received or no projects available");
      }
    } catch (error) {
      console.error("Error fetching constructor project:", error);
      toast.error("Không thể tải thông tin dự án");
    } finally {
      setLoading(false);
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

      if (projectInfo && projectInfo.id) {
        await fetchProjectTasks(projectInfo.id);
      }

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

  if (loading) {
    return <Spin size="large" />;
  }

  return (
    <div>
      <Title level={2}>Nhiệm vụ dự án</Title>
      {projectInfo && (
        <Card style={{ marginBottom: 16 }}>
          <Title level={4}>{projectInfo.name || "N/A"}</Title>
          <div>
            Mô tả:{" "}
            <span
              dangerouslySetInnerHTML={{
                __html: projectInfo.description || "N/A",
              }}
            />
          </div>
          <Space direction="vertical" style={{ width: "100%", marginTop: 16 }}>
            <Text>Tiến độ chung:</Text>
            <Progress percent={projectInfo.progressPercentage || 0} />
          </Space>

          <Space direction="vertical" style={{ width: "100%", marginTop: 16 }}>
            <Text>Trạng thái: {projectInfo.statusName || "N/A"}</Text>

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
                Mark as Technically Completed
              </Button>
            )}
        </Card>
      )}
      <Table
        columns={columns}
        dataSource={tasks}
        rowKey="id"
        locale={{ emptyText: "No tasks available" }}
      />
    </div>
  );
};

export default ProjectTasks;
