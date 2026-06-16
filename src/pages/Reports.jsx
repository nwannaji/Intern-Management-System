import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { dashboardAPI } from '../services/api';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await dashboardAPI.getAdminReports();
        setData(response.data);
      } catch (error) {
        toast.error('Failed to load reports');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return <Layout><LoadingSpinner /></Layout>;

  const appStats = data?.application_stats || {};
  const attStats = data?.attendance_stats || {};
  const perfDist = data?.performance_distribution || {};
  const leaveStats = data?.leave_stats || {};

  const applicationChart = {
    labels: ['Pending', 'Under Review', 'Approved', 'Rejected'],
    datasets: [{
      data: [appStats.pending, appStats.under_review, appStats.approved, appStats.rejected],
      backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#ef4444'],
    }]
  };

  const attendanceChart = {
    labels: ['Present', 'Absent', 'Late'],
    datasets: [{
      label: 'Attendance (Last 30 Days)',
      data: [attStats.present, attStats.absent, attStats.late],
      backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
    }]
  };

  const performanceChart = {
    labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
    datasets: [{
      label: 'Number of Reviews',
      data: [perfDist['1'] || 0, perfDist['2'] || 0, perfDist['3'] || 0, perfDist['4'] || 0, perfDist['5'] || 0],
      backgroundColor: ['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#10b981'],
    }]
  };

  const leaveChart = {
    labels: ['Approved', 'Rejected', 'Pending'],
    datasets: [{
      label: 'Leave Requests (This Year)',
      data: [leaveStats.approved, leaveStats.rejected, leaveStats.pending],
      backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
    }]
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white shadow rounded-lg p-5">
            <p className="text-sm text-gray-500">Total Applications</p>
            <p className="text-3xl font-bold text-gray-900">{appStats.total || 0}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-5">
            <p className="text-sm text-gray-500">Attendance Records</p>
            <p className="text-3xl font-bold text-gray-900">{attStats.total_records || 0}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-5">
            <p className="text-sm text-gray-500">Total Reviews</p>
            <p className="text-3xl font-bold text-gray-900">{Object.values(perfDist).reduce((a,b) => a+b, 0)}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-5">
            <p className="text-sm text-gray-500">Leave Requests</p>
            <p className="text-3xl font-bold text-gray-900">{leaveStats.total_requests || 0}</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Application Status</h3>
            <div className="max-w-xs mx-auto"><Pie data={applicationChart} /></div>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Attendance (Last 30 Days)</h3>
            <Bar data={attendanceChart} options={{ responsive: true }} />
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Distribution</h3>
            <Bar data={performanceChart} options={{ responsive: true }} />
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Leave Requests</h3>
            <div className="max-w-xs mx-auto"><Pie data={leaveChart} /></div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;