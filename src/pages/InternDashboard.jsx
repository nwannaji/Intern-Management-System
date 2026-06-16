import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { dashboardAPI } from '../services/api';

const InternDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await dashboardAPI.getInternDashboard();
        setData(response.data);
      } catch (error) {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <Layout><LoadingSpinner /></Layout>;

  const stats = [
    { label: 'Pending Tasks', value: data?.pending_tasks || 0, to: '/tasks', color: 'bg-blue-500' },
    { label: 'Overdue Tasks', value: data?.overdue_tasks || 0, to: '/tasks', color: 'bg-red-500' },
    { label: 'Unread Notifications', value: data?.unread_notifications || 0, to: '/notifications', color: 'bg-yellow-500' },
    { label: 'Upcoming Reviews', value: data?.upcoming_reviews || 0, to: '/reviews', color: 'bg-purple-500' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">My Dashboard</h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Link key={stat.label} to={stat.to} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition">
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 ${stat.color} rounded-md p-3`}>
                    <span className="text-white text-lg font-bold">{stat.value}</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Attendance Status */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Today's Status</h3>
          <p className="text-gray-600">
            Attendance: <span className="font-medium capitalize">{(data?.attendance_status || 'not checked in').replace(/_/g, ' ')}</span>
          </p>
          <div className="mt-4 flex gap-3">
            <Link to="/attendance" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
              Go to Attendance
            </Link>
          </div>
        </div>

        {/* Leave Balances */}
        {data?.leave_balances && data.leave_balances.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Leave Balance</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {data.leave_balances.map((lb) => (
                <div key={lb.name} className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">{lb.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{lb.remaining}</p>
                  <p className="text-xs text-gray-400">days remaining</p>
                </div>
              ))}
            </div>
            <Link to="/leave" className="mt-4 inline-block text-blue-600 hover:text-blue-700 text-sm font-medium">
              Manage Leave →
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default InternDashboard;