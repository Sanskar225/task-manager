import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Progress,
  List,
  Tag,
  Typography,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import moment from "moment";

const { Title } = Typography;

const priorityColors = {
  low: "blue",
  medium: "orange",
  high: "red",
};

const UserDashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
    completionRate: 0,
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [tasksResponse] = await Promise.all([
        axiosInstance.get(API_PATHS.TASKS),
      ]);

      const userTasks = tasksResponse.data;
      const total = userTasks.length;
      const completed = userTasks.filter(
        (t) => t.status === "completed"
      ).length;
      const pending = userTasks.filter((t) => t.status === "pending").length;
      const inProgress = userTasks.filter(
        (t) => t.status === "in-progress"
      ).length;
      const completionRate = total > 0 ? (completed / total) * 100 : 0;

      setStats({
        total,
        completed,
        pending,
        inProgress,
        completionRate: Math.round(completionRate),
      });

      // Get recent tasks (last 5)
      const sortedTasks = userTasks
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentTasks(sortedTasks);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2}>My Dashboard</Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Tasks"
              value={stats.total}
              prefix={<RiseOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Completed"
              value={stats.completed}
              prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="In Progress"
              value={stats.inProgress}
              prefix={<SyncOutlined spin style={{ color: "#1890ff" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending"
              value={stats.pending}
              prefix={<ClockCircleOutlined style={{ color: "#faad14" }} />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
        <Col xs={24} md={12}>
          <Card title="Completion Rate">
            <Progress
              type="circle"
              percent={stats.completionRate}
              format={(percent) => `${percent}%`}
              width={120}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            title="Recent Tasks"
            extra={<Link to="/user/my-tasks">View All</Link>}
          >
            <List
              loading={loading}
              dataSource={recentTasks}
              renderItem={(task) => (
                <List.Item
                  extra={
                    <Tag color={priorityColors[task.priority]}>
                      {task.priority.toUpperCase()}
                    </Tag>
                  }
                >
                  <List.Item.Meta
                    title={
                      <Link to={`/user/task/${task._id}`}>{task.title}</Link>
                    }
                    description={`Due: ${moment(task.dueDate).format(
                      "MMM DD, YYYY"
                    )}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UserDashboard;
