import { useEffect, useState } from "react";
import axios from "../../../../../config/axios";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "./UserStatistics.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const UserStatistics = () => {
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    customerCount: 0,
    constructorCount: 0,
    consultantCount: 0,
    designerCount: 0,
  });

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const response = await axios.get("/api/dashboard/user-stats");
        setUserStats(response.data);
      } catch (error) {
        console.error("Error fetching user statistics:", error);
      }
    };

    fetchUserStats();
  }, []);

  const chartData = {
    labels: ["Khách hàng", "Nhà thầu", "Tư vấn viên", "Thiết kế"],
    datasets: [
      {
        data: [
          userStats.customerCount,
          userStats.constructorCount,
          userStats.consultantCount,
          userStats.designerCount,
        ],
        backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56", "#4BC0C0"],
        borderWidth: 1,
        borderColor: "white",
        cutout: "70%",
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: "right",
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 10,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return ` ${context.label}: ${context.raw}`;
          },
        },
      },
    },
    maintainAspectRatio: false,
    layout: {
      padding: 10,
    },
  };

  return (
    <div className="user-statistics-card">
      <div className="chart-wrapper">
        <div className="total-count">
          <span className="count-value" style={{ fontSize: "24px" }}>
            {userStats.totalUsers}
          </span>
          <span className="count-label" style={{ fontSize: "16px" }}>
            Sessions
          </span>
        </div>
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
};

export default UserStatistics;
