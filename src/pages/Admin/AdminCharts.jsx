import React from 'react';
import { Card, Row, Col, Statistic, Space, Typography } from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  DollarOutlined, 
  CalendarOutlined,
  ArrowUpOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { Line, Column } from '@ant-design/charts';

const { Title, Text } = Typography;

const AdminCharts = () => {
  // Active Users Multi-line Chart Data
  const activeUsersData = [
    { month: 'Feb', type: 'Traffic', value: 350 },
    { month: 'Mar', type: 'Traffic', value: 280 },
    { month: 'Apr', type: 'Traffic', value: 320 },
    { month: 'May', type: 'Traffic', value: 380 },
    { month: 'Jun', type: 'Traffic', value: 420 },
    { month: 'Jul', type: 'Traffic', value: 480 },
    { month: 'Aug', type: 'Traffic', value: 440 },
    { month: 'Sep', type: 'Traffic', value: 460 },
    { month: 'Oct', type: 'Traffic', value: 520 },
    
    { month: 'Feb', type: 'Sales', value: 280 },
    { month: 'Mar', type: 'Sales', value: 250 },
    { month: 'Apr', type: 'Sales', value: 290 },
    { month: 'May', type: 'Sales', value: 340 },
    { month: 'Jun', type: 'Sales', value: 320 },
    { month: 'Jul', type: 'Sales', value: 380 },
    { month: 'Aug', type: 'Sales', value: 420 },
    { month: 'Sep', type: 'Sales', value: 400 },
    { month: 'Oct', type: 'Sales', value: 480 },
  ];

  const activeUsersConfig = {
    data: activeUsersData,
    xField: 'month',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
    color: ['#1890ff', '#52c41a'],
    lineStyle: {
      lineWidth: 3,
    },
    point: {
      size: 0,
    },
    xAxis: {
      label: {
        style: {
          fill: '#999',
          fontSize: 12,
        },
      },
      line: {
        style: {
          stroke: '#e8e8e8',
        },
      },
    },
    yAxis: {
      label: {
        style: {
          fill: '#999',
          fontSize: 12,
        },
      },
      grid: {
        line: {
          style: {
            stroke: '#f0f0f0',
            lineDash: [4, 4],
          },
        },
      },
    },
    legend: {
      position: 'top-right',
      offsetY: -5,
    },
  };

  // Monthly Revenue Bar Chart
  const monthlyRevenueData = [
    { month: 'Feb', revenue: 85 },
    { month: 'Mar', revenue: 45 },
    { month: 'Apr', revenue: 68 },
    { month: 'May', revenue: 92 },
    { month: 'Jun', revenue: 78 },
    { month: 'Jul', revenue: 115 },
    { month: 'Aug', revenue: 68 },
    { month: 'Sep', revenue: 95 },
    { month: 'Oct', revenue: 120 },
  ];

  const revenueBarConfig = {
    data: monthlyRevenueData,
    xField: 'month',
    yField: 'revenue',
    color: '#1890ff',
    columnStyle: {
      radius: [6, 6, 0, 0],
    },
    xAxis: {
      label: {
        style: {
          fill: '#fff',
          fontSize: 11,
        },
      },
      line: null,
      tickLine: null,
    },
    yAxis: false,
    label: false,
    animation: {
      appear: {
        animation: 'scale-in-y',
        duration: 800,
      },
    },
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Top Section - Two Charts Side by Side */}
      <Row gutter={[24, 24]}>
        {/* Active Users Chart */}
        <Col xs={24} lg={16}>
          <Card 
            bordered={false}
            style={{ 
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            <div style={{ marginBottom: '16px' }}>
              <Title level={4} style={{ margin: 0, fontWeight: 600 }}>
                Active Users
              </Title>
              <Space size={16} style={{ marginTop: '8px' }}>
                <Text type="secondary">
                  <span style={{ 
                    display: 'inline-block', 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    background: '#1890ff',
                    marginRight: '6px'
                  }}></span>
                  Traffic
                </Text>
                <Text type="secondary">
                  <span style={{ 
                    display: 'inline-block', 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    background: '#52c41a',
                    marginRight: '6px'
                  }}></span>
                  Sales
                </Text>
              </Space>
            </div>
            <Line {...activeUsersConfig} height={280} />
          </Card>
        </Col>

        {/* Monthly Revenue Bar Chart */}
        <Col xs={24} lg={8}>
          <Card 
            bordered={false}
            style={{ 
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              color: '#fff'
            }}
          >
            <Title level={4} style={{ margin: 0, color: '#fff', fontWeight: 600 }}>
              Top
            </Title>
            <Column {...revenueBarConfig} height={320} />
          </Card>
        </Col>
      </Row>

      {/* Statistics Cards Row */}
      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={12} sm={6}>
          <Card 
            bordered={false}
            style={{ 
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              textAlign: 'center'
            }}
          >
            <UserOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: '12px' }} />
            <Statistic
              value="3.6K"
              valueStyle={{ 
                fontSize: '28px', 
                fontWeight: 'bold',
                color: '#262626'
              }}
            />
            <Text type="secondary" style={{ fontSize: '13px' }}>Users</Text>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card 
            bordered={false}
            style={{ 
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              textAlign: 'center'
            }}
          >
            <TeamOutlined style={{ fontSize: '32px', color: '#52c41a', marginBottom: '12px' }} />
            <Statistic
              value="2m"
              valueStyle={{ 
                fontSize: '28px', 
                fontWeight: 'bold',
                color: '#262626'
              }}
            />
            <Text type="secondary" style={{ fontSize: '13px' }}>Clicks</Text>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card 
            bordered={false}
            style={{ 
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              textAlign: 'center'
            }}
          >
            <DollarOutlined style={{ fontSize: '32px', color: '#faad14', marginBottom: '12px' }} />
            <Statistic
              value="$772"
              valueStyle={{ 
                fontSize: '28px', 
                fontWeight: 'bold',
                color: '#262626'
              }}
            />
            <Text type="secondary" style={{ fontSize: '13px' }}>Sales</Text>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card 
            bordered={false}
            style={{ 
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              textAlign: 'center'
            }}
          >
            <TrophyOutlined style={{ fontSize: '32px', color: '#f5222d', marginBottom: '12px' }} />
            <Statistic
              value="82"
              valueStyle={{ 
                fontSize: '28px', 
                fontWeight: 'bold',
                color: '#262626'
              }}
            />
            <Text type="secondary" style={{ fontSize: '13px' }}>Items</Text>
          </Card>
        </Col>
      </Row>

      {/* Additional Dashboard Section */}
      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24} md={12}>
          <Card
            bordered={false}
            style={{ 
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            <Title level={4} style={{ marginBottom: '20px' }}>Recent Activity</Title>
            <Space direction="vertical" style={{ width: '100%' }} size={16}>
              {[
                { name: 'John Doe', action: 'Listed new property', time: '10 min ago', color: '#1890ff' },
                { name: 'Jane Smith', action: 'Completed booking', time: '25 min ago', color: '#52c41a' },
                { name: 'Mike Johnson', action: 'Updated profile', time: '1 hour ago', color: '#faad14' },
                { name: 'Sarah Wilson', action: 'Added review', time: '2 hours ago', color: '#722ed1' },
              ].map((activity, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '6px', 
                    height: '6px', 
                    borderRadius: '50%', 
                    background: activity.color,
                    flexShrink: 0
                  }}></div>
                  <div style={{ flex: 1 }}>
                    <Text strong>{activity.name}</Text>
                    <Text type="secondary" style={{ marginLeft: '8px', fontSize: '13px' }}>
                      {activity.action}
                    </Text>
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>{activity.time}</Text>
                    </div>
                  </div>
                </div>
              ))}
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            bordered={false}
            style={{ 
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            <Title level={4} style={{ marginBottom: '20px' }}>Performance Metrics</Title>
            <Space direction="vertical" style={{ width: '100%' }} size={20}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <Text>User Satisfaction</Text>
                  <Text strong>92%</Text>
                </div>
                <div style={{ 
                  height: '8px', 
                  background: '#f0f0f0', 
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    height: '100%', 
                    width: '92%', 
                    background: 'linear-gradient(90deg, #52c41a 0%, #73d13d 100%)',
                    borderRadius: '4px'
                  }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <Text>System Uptime</Text>
                  <Text strong>99.9%</Text>
                </div>
                <div style={{ 
                  height: '8px', 
                  background: '#f0f0f0', 
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    height: '100%', 
                    width: '99.9%', 
                    background: 'linear-gradient(90deg, #1890ff 0%, #40a9ff 100%)',
                    borderRadius: '4px'
                  }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <Text>Conversion Rate</Text>
                  <Text strong>68%</Text>
                </div>
                <div style={{ 
                  height: '8px', 
                  background: '#f0f0f0', 
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    height: '100%', 
                    width: '68%', 
                    background: 'linear-gradient(90deg, #722ed1 0%, #9254de 100%)',
                    borderRadius: '4px'
                  }}></div>
                </div>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminCharts;