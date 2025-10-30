import React from "react";
import { Card, Typography } from "antd";

const { Title } = Typography;

const AuthLayout = ({ children, title }) => {
  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: '#f0f2f5'
    }}>
      <Card style={{ 
        width: '100%',
        maxWidth: 400,
        borderRadius: 8,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
          {title}
        </Title>
        {children}
      </Card>
    </div>
  );
};

export default AuthLayout;
