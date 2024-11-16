import React from 'react';
import { Card } from 'antd';
import { Line } from '@ant-design/charts';
import './RevenueStatistics.css';
interface RevenueStatisticsProps {
  revenueData: {
    totalRevenue: number;
    revenueChartData: Array<{
      date: string;
      revenue: number;
    }>;
  };
}

const RevenueStatistics: React.FC<RevenueStatisticsProps> = ({ revenueData }) => {
  // Tạo dữ liệu mẫu dựa trên giá trị hiện tại
  const currentRevenue = revenueData.totalRevenue;
  const enhancedData = {
    totalRevenue: currentRevenue,
    revenueChartData: [
      { date: '2024-05', revenue: Math.round(currentRevenue * 0.83) },
      { date: '2024-06', revenue: Math.round(currentRevenue * 0.87) },
      { date: '2024-07', revenue: Math.round(currentRevenue * 0.90) },
      { date: '2024-08', revenue: Math.round(currentRevenue * 0.93) },
      { date: '2024-09', revenue: Math.round(currentRevenue * 0.96) },
      { date: '2024-10', revenue: Math.round(currentRevenue * 0.98) },
      { date: '2024-11', revenue: currentRevenue }
    ]
  };

  const config = {
    data: enhancedData.revenueChartData,
    xField: 'date',
    yField: 'revenue',
    smooth: true,
    point: {
      size: 2,
      shape: 'circle',
      style: {
        stroke: '#00B96B',
        fill: '#fff',
      }
    },
    color: '#00B96B',
    area: {
      style: {
        fill: 'l(270) 0:#ffffff 0.5:#00B96B10 1:#00B96B20',
      }
    },
    line: {
      size: 2,
    },
    yAxis: {
      label: {
        formatter: (v: string) => `$${v}`,
        style: { fontSize: 10 }
      },
    },
    xAxis: {
      label: {
        style: { fontSize: 10 }
      }
    },
    height: 200,
    width: 680,
    padding: [10, 10, 10, 30],
    autoFit: false,
    tooltip: false,
  };

  return (
    <div className="revenue-statistics">
      <Card title="Thống kê doanh thu" className="stat-card">
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: 10,
          height: 30
        }}>
          <span style={{ 
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#00B96B'
          }}>
            {revenueData.totalRevenue.toLocaleString('vi-VN')} VNĐ
          </span>   
        </div>
        <Line {...config} />
      </Card>
    </div>
  );
};

export default RevenueStatistics; 