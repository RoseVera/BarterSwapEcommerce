import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import 'chart.js/auto';
import useUserStore from "../../components/UserStore";
import "../../style/Stats.css";

function Dashboard() {
  const { user } = useUserStore();
  const [topBidItems, setTopBidItems] = useState([]);
  const [topSellers, setTopSellers] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res1 = await axios.get("http://localhost:5000/api/admin/top-bid-items", { withCredentials: true });
        const res2 = await axios.get("http://localhost:5000/api/admin/top-sellers", { withCredentials: true });
        const res3 = await axios.get("http://localhost:5000/api/admin/monthly-transactions", { withCredentials: true });

        setTopBidItems(res1.data);
        console.log(res1.data)
        setTopSellers(res2.data);
        setMonthlyData(res3.data);
      } catch (err) {
        console.error("Admin dashboard data fetch error", err);
      }
    };

    fetchData();
  }, []);

  const lineChartData = {
    labels: monthlyData.map(d => d.month),
    datasets: [
      {
        label: 'Monthly Transactions',
        data: monthlyData.map(d => d.transactionCount),
        fill: false,
        backgroundColor: '#ff6600',
        borderColor: '#ff6600',
      },
    ],
  };

  return (
    <div className="stats-container">
      <h2 className="stats-title">Admin Dashboard</h2>

      <section className="stats-section">
        <h3>Top 5 Most Bid Items</h3>
        <ul>
          {topBidItems.map((item, index) => (
            <li key={index}>{item.itemName} - {item.bidCount} bids</li>
          ))}
        </ul>
      </section>

      <section className="stats-section">
        <h3>Top Sellers by Transaction Count</h3>
        <ul>
          {topSellers.map((seller, index) => (
            <li key={index}>{seller.username} - {seller.transactionCount} transactions</li>
          ))}
        </ul>
      </section>

      <section className="stats-section">
        <h3>Monthly Transaction Volume</h3>
        <Line data={lineChartData} />
      </section>
    </div>
  );
}

export default Dashboard;
