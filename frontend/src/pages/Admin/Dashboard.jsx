import React from "react";
import { Card, Row, Col, Statistic } from "antd";
import { Link } from "react-router-dom";
import {
  UserOutlined,
  ProjectOutlined,
  FileExcelOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard" style={{ padding: "24px" }}>
      <h1 style={{ marginBottom: "24px" }}>Admin Dashboard</h1>

      <Row gutter={[16, 16]}>
        {/* Quick Access Cards */}
        <Col xs={24} md={6}>
          <Link to="/admin/users">
            <Card hoverable>
              <Statistic
                title="Manage Users"
                prefix={<UserOutlined />}
                value="Users"
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Link>
        </Col>
        <Col xs={24} md={6}>
          <Link to="/admin/tasks">
            <Card hoverable>
              <Statistic
                title="Manage Tasks"
                prefix={<ProjectOutlined />}
                value="Tasks"
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Link>
        </Col>
        <Col xs={24} md={6}>
          <Link to="/admin/reports">
            <Card hoverable>
              <Statistic
                title="View Reports"
                prefix={<FileExcelOutlined />}
                value="Reports"
                valueStyle={{ color: "#722ed1" }}
              />
            </Card>
          </Link>
        </Col>
        <Col xs={24} md={6}>
          <Link to="/admin/tasks?status=pending">
            <Card hoverable>
              <Statistic
                title="Pending Tasks"
                prefix={<ClockCircleOutlined />}
                value="View"
                valueStyle={{ color: "#fa8c16" }}
              />
            </Card>
          </Link>
        </Col>
      </Row>

      {/* Additional dashboard content can be added here */}
    </div>
  );
};

export default AdminDashboard;
