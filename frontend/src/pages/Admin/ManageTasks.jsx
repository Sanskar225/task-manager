import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Tag,
  Space,
  Button,
  Popconfirm,
  message,
  Card,
  Progress,
  Select,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import moment from "moment";

const { Option } = Select;

const statusColors = {
  pending: "#faad14",
  "in-progress": "#1890ff",
  completed: "#52c41a",
};

const priorityColors = {
  low: "blue",
  medium: "orange",
  high: "red",
};

const ManageTasks = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(API_PATHS.TASKS);
      setTasks(response.data);
    } catch (error) {
      message.error("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(API_PATHS.TASK_BY_ID(id));
      message.success("Task deleted successfully");
      fetchTasks();
    } catch (error) {
      message.error("Failed to delete task");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await axiosInstance.patch(API_PATHS.UPDATE_TASK_STATUS(id), { status });
      message.success("Task status updated successfully");
      fetchTasks();
    } catch (error) {
      message.error("Failed to update task status");
    }
  };

  const filteredTasks =
    statusFilter === "all"
      ? tasks
      : tasks.filter((task) => task.status === statusFilter);

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: 200,
      ellipsis: true,
    },
    {
      title: "Assigned To",
      dataIndex: "assignedTo",
      key: "assignedTo",
      render: (assignedTo) => assignedTo?.name || "Unassigned",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <Select
          value={status}
          style={{ width: 120 }}
          onChange={(value) => handleStatusChange(record._id, value)}
        >
          <Option value="pending">
            <ClockCircleOutlined /> Pending
          </Option>
          <Option value="in-progress">
            <ExclamationCircleOutlined /> In Progress
          </Option>
          <Option value="completed">
            <CheckCircleOutlined /> Completed
          </Option>
        </Select>
      ),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (priority) => (
        <Tag
          color={priorityColors[priority]}
          style={{ textTransform: "capitalize" }}
        >
          {priority}
        </Tag>
      ),
    },
    {
      title: "Progress",
      dataIndex: "progress",
      key: "progress",
      render: (progress) => <Progress percent={progress} size="small" />,
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (date) => moment(date).format("MMM DD, YYYY"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/tasks/${record._id}/edit`)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this task?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Card
        title="Manage Tasks"
        extra={
          <Space>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 150 }}
            >
              <Option value="all">All Status</Option>
              <Option value="pending">Pending</Option>
              <Option value="in-progress">In Progress</Option>
              <Option value="completed">Completed</Option>
            </Select>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/admin/create-task")}
            >
              Create Task
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredTasks}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} tasks`,
          }}
        />
      </Card>
    </div>
  );
};

export default ManageTasks;
