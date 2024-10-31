import React from 'react';
import { Card } from 'antd';
import { Line } from '@ant-design/charts';

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
  const config = {
    data: revenueData.revenueChartData,
    xField: 'date',
    yField: 'revenue',
    point: {
      size: 5,
      shape: 'diamond',
    },
    label: {
      style: {
        fill: '#aaa',
      },
    },
  };

  return (
    <div className="revenue-statistics">
      <Card title="Thống kê doanh thu" className="stat-card">
        <p>
          <span>Tổng doanh thu:</span>
          <span>${revenueData.totalRevenue.toLocaleString()}</span>
        </p>
        <Line {...config} />
      </Card>
    </div>
  );
};

export default RevenueStatistics; 