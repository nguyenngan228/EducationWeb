import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import mycontext from '../../../configs/mycontext';
import { authAPI, endpoints } from '../../../configs/APIs';
import './cardAnalytics.css'
import Chart from 'chart.js/auto';


export const AnalystPage = () => {
  const navigate = useNavigate();
  const [user, dispatch] = useContext(mycontext);
  const chartRef = useRef(null);
  const logout = () => {
    dispatch({ type: 'logout' });
    navigate('/login');
  };

  const [revenue, setRevenue] = useState(null);

  const getAnalytics = async () => {
    try {
      let res = await authAPI().get(endpoints['get_analytics']);
      setRevenue(res.data);
    } catch (ex) { console.error(ex); }
  }

  useEffect(() => {
    getAnalytics();
  }, [user.id]);

  useEffect(() => {
    if (revenue !== null) {
      const ctx = document.getElementById('myChart').getContext('2d');

      
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      const colors = revenue.data.map(() => 
        `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.2)`
      );

      chartRef.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: revenue.data.map(item => item.name),
          datasets: [{
            label: 'Revenue',
            data: revenue.data.map(item => item.total),
            borderWidth: 1,
            backgroundColor: colors,
            borderColor: colors.map(color => color.replace('0.2', '1')), // Đổi màu viền cho đồng nhất
          }]
        },
        options: {
          responsive: true, // Để biểu đồ tự điều chỉnh kích thước
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `${context.label}: $${context.raw.toFixed(2)}`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }, [revenue]);
  return (
    <div>
      {revenue === null ? (<div>Loading.....</div>) : (
        <>
          <div className="course-status-container">
            <div className="course-status">
              <div className="status-info">
                <p>Total Revenue</p>
                <h3>${revenue.total_revenue.toFixed(2)}</h3>
              </div>
            </div>
            <div className="course-status">
              <div className="status-info">
                <p>Total Sales</p>
                <h3>{revenue.total_sales}</h3>
              </div>
            </div>
          </div>
        </>
      )}
      <div style={{ width: '80%', height: '400px', margin: 'auto' }}>
        <canvas id="myChart"></canvas>
      </div>
    </div>
  )
};
