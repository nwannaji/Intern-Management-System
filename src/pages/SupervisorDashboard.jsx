import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { dashboardAPI, leaveAPI } from '../services/api';

const SupervisorDashboard = () => {
  const [data, setData] = useState(null);
  const [pendingLeaveCount, setPendingLeaveCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await dashboardAPI.getSupervisorDashboard();
        setData(response.data);
      } catch (error) {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    const fetchPendingLeave = async () => {
      try {
        const response = await leaveAPI.getLeaveRequests();
        const requests = Array.isArray(response.data) ? response.data : response.data?.results || [];
        setPendingLeaveCount(requests.filter(r => r.status === 'pending').length);
      } catch (error) {
        // Leave count is non-critical
      }
    };
    fetchDashboard();
    fetchPendingLeave();
  }, []);

  if (loading) return <Layout><LoadingSpinner /></Layout>;

  const taskStats = data?.task_stats || {};

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Supervisor Dashboard</h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white shadow rounded-lg p-5">
            <p className="text-sm font-medium text-gray-500">Assigned Interns</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{data?.assigned_interns_count || 0}</p>
          </div>
          <Link to="/reviews" className="bg-white shadow rounded-lg p-5 hover:shadow-md transition">
            <p className="text-sm font-medium text-gray-500">Pending Reviews</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">{data?.pending_reviews || 0}</p>
          </Link>
          <Link to="/leave" className="bg-white shadow rounded-lg p-5 hover:shadow-md transition">
            <p className="text-sm font-medium text-gray-500">Pending Leave Requests</p>
            <p className="text-3xl font-bold text-amber-600 mt-1">{pendingLeaveCount}</p>
          </Link>
          <div className="bg-white shadow rounded-lg p-5">
            <p className="text-sm font-medium text-gray-500">Today Present</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{data?.attendance_summary?.present || 0}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-5">
            <p className="text-sm font-medium text-gray-500">Today Absent</p>
            <p className="text-3xl font-bold text-red-600 mt-1">{data?.attendance_summary?.absent || 0}</p>
          </div>
        </div>

        {/* Task Overview */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Task Overview</h3>
            <Link to="/tasks" className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">To Do</p>
              <p className="text-2xl font-bold text-gray-700">{taskStats.todo || 0}</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-700">{taskStats.in_progress || 0}</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600">Completed</p>
              <p className="text-2xl font-bold text-green-700">{taskStats.completed || 0}</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600">Overdue</p>
              <p className="text-2xl font-bold text-red-700">{taskStats.overdue || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SupervisorDashboard;