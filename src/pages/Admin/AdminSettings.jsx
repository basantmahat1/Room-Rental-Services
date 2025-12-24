// src/pages/admin/Settings.jsx
import React from 'react';
import { Typography, Card } from 'antd';
const { Title, Paragraph } = Typography;

const AdminSettings = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Admin Settings</Title>
      <Card>
        <Paragraph>
          This is the Settings page. You can add settings options here such as:
          <ul>
            <li>Site Configuration</li>
            <li>User Roles & Permissions</li>
            <li>Notifications</li>
            <li>Payment Settings</li>
          </ul>
        </Paragraph>
      </Card>
    </div>
  );
};

export default AdminSettings;
