import React from 'react';
import { Card, Button, Row, Col, message } from 'antd';
import { FileExcelOutlined, UserOutlined, ProjectOutlined } from '@ant-design/icons';
import { axiosInstance } from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';

const Reports = () => {
  const downloadReport = async (type) => {
    try {
      const response = await axiosInstance.get(
        type === 'tasks' ? API_PATHS.EXPORT_TASKS_REPORT : API_PATHS.EXPORT_USERS_REPORT,
        { responseType: 'blob' }
      );

      // Create a blob from the response data
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });

      // Create a link element and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_report_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      message.success(`${type.charAt(0).toUpperCase() + type.slice(1)} report downloaded successfully!`);
    } catch (error) {
      console.error(`Error downloading ${type} report:`, error);
      message.error(`Failed to download ${type} report. Please try again.`);
    }
  };

  return (
    <div className="reports-container" style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: '24px' }}>Reports</h1>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card
            hoverable
            style={{ height: '100%' }}
            actions={[
              <Button 
                type="primary" 
                icon={<FileExcelOutlined />} 
                onClick={() => downloadReport('tasks')}
              >
                Download Report
              </Button>
            ]}
          >
            <Card.Meta
              avatar={<ProjectOutlined style={{ fontSize: '24px' }} />}
              title="Tasks Report"
              description="Export a detailed report of all tasks including their status, assignments, and progress."
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card
            hoverable
            style={{ height: '100%' }}
            actions={[
              <Button 
                type="primary" 
                icon={<FileExcelOutlined />} 
                onClick={() => downloadReport('users')}
              >
                Download Report
              </Button>
            ]}
          >
            <Card.Meta
              avatar={<UserOutlined style={{ fontSize: '24px' }} />}
              title="Users Report"
              description="Export a detailed report of all users including their task statistics and performance metrics."
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Reports;