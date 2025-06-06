import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import 'chart.js/auto';
import useUserStore from "../../components/UserStore";
import "../../style/Stats.css";

function StatsChart() {
  const [salesData, setSalesData] = useState([]);
  const [purchaseData, setPurchaseData] = useState([]);
  const [bonusData, setBonusData] = useState([]);

  const { user } = useUserStore();

  useEffect(() => {
    axios.get(`http://localhost:5000/api/stats/monthly-sales/${user.id}`).then(res => {
      setSalesData(res.data);
    });
    axios.get(`http://localhost:5000/api/stats/monthly-purchases/${user.id}`).then(res => {
      setPurchaseData(res.data);
    });
    axios.get(`http://localhost:5000/api/stats/monthly-bonuses/${user.id}`).then(res => {
      console.log(res.data)
    setBonusData(res.data);
  });
  }, [user.id]);

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const formatData = (data, type) => {
    return months.map((month) => {
      const entry = data.find(d => new Date(d.month).toLocaleString("en", { month: "short" }) === month);
      return entry ? parseInt(entry[type]) : 0;
    });
  };

  return (
    <div className="chart-container">
      <h3>Earnings in the Last 12 Months</h3>
      <Line
        data={{
          labels: months,
          datasets: [
            {
              label: "Total Earnings",
              data: formatData(salesData, "total_earned"),
              borderColor: "#00b2a9",
              tension: 0.2,
            },
          ],
        }}
        options={{
          plugins: {
            tooltip: {
              callbacks: {
                label: function (context) {
                  const month = context.label;
                  const entry = salesData.find(d => new Date(d.month).toLocaleString("en", { month: "short" }) === month);
                  const itemCount = entry ? entry.items_sold : 0;
                  return `${context.dataset.label}: $${context.formattedValue} (${itemCount} items)`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Earnings ($)",
              }
            }
          }
        }}
      />

      <h3 style={{ marginTop: "40px" }}>Purchases in the Last 12 Months</h3>
      <Line
        data={{
          labels: months,
          datasets: [
            {
              label: "Total Spent",
              data: formatData(purchaseData, "total_spent"),
              borderColor: "#ff6600",
              tension: 0.2,
            },
          ],
        }}
        options={{
          plugins: {
            tooltip: {
              callbacks: {
                label: function (context) {
                  const month = context.label;
                  const entry = purchaseData.find(d => new Date(d.month).toLocaleString("en", { month: "short" }) === month);
                  const itemCount = entry ? entry.items_bought : 0;
                  return `${context.dataset.label}: $${context.formattedValue} (${itemCount} items)`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Amount Spent ($)",
              }
            }
          }
        }}
      />
      <h3 style={{ marginTop: "40px" }}>Bonuses Earned in the Last 12 Months</h3>
<Line
  data={{
    labels: months,
    datasets: [
      {
        label: "Total Bonuses",
        data: formatData(bonusData, "total_bonus"),
        borderColor: "#cc00ff",
        tension: 0.2,
      },
    ],
  }}
  options={{
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            const month = context.label;
            const entry = bonusData.find(d => new Date(d.month).toLocaleString("en", { month: "short" }) === month);
            const bonusAmount = entry ? entry.total_bonus : 0;
            return `${context.dataset.label}: ${bonusAmount} coins`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Bonuses Earned",
        }
      }
    }
  }}
/>

    </div>
  );
}

export default StatsChart;
