import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { applicationsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    under_review: 0,
    approved: 0,
    rejected: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { logout } = useAuth();

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const fetchApplications = async () => {
    try {
      console.log('Fetching applications...');
      const response = await applicationsAPI.getApplications();
      console.log('Applications API Response:', response.data);
      
      // Handle different response formats
      let allApplications = response.data;
      if (response.data && response.data.results) {
        allApplications = response.data.results;
      }
      
      console.log('Processed applications:', allApplications);
      
      // Ensure it's an array
      if (!Array.isArray(allApplications)) {
        console.error('Expected array but got:', typeof allApplications, allApplications);
        allApplications = [];
      }
      
      console.log('Final applications array:', allApplications);
      console.log('Applications length:', allApplications.length);
      
      if (filter !== 'all') {
        allApplications = allApplications.filter(app => app.status === filter);
      }
      
      setApplications(allApplications);
      
      // Calculate stats
      const statsData = {
        total: allApplications.length,
        pending: allApplications.filter(app => app.status === 'pending').length,
        under_review: allApplications.filter(app => app.status === 'under_review').length,
        approved: allApplications.filter(app => app.status === 'approved').length,
        rejected: allApplications.filter(app => app.status === 'rejected').length,
      };
      setStats(statsData);
      console.log('Stats:', statsData);
    } catch (error) {
      toast.error('Failed to fetch applications');
      console.error('Error fetching applications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      await applicationsAPI.updateApplication(applicationId, { status: newStatus });
      await fetchApplications();
      toast.success(`Application ${newStatus} successfully`);
    } catch (error) {
      toast.error('Failed to update application status');
      console.error('Error updating application:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'under_review':
        return 'Under Review';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Manage internship and NYSC applications
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Link
                  to="/programs"
                  className="text-blue-600 hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Manage Programs
                </Link>
                <Link
                  to="/"
                  className="text-blue-600 hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Back to Home
                </Link>
                <button
                  onClick={() => {
                    logout();
                    toast.success('Logged out successfully!');
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-medium">{stats.total}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total</dt>
                    <dd className="text-lg font-medium text-gray-900">Applications</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 font-medium">{stats.pending}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                    <dd className="text-lg font-medium text-gray-900">Review</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium">{stats.under_review}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Under</dt>
                    <dd className="text-lg font-medium text-gray-900">Review</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-medium">{stats.approved}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Approved</dt>
                    <dd className="text-lg font-medium text-gray-900">Applications</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 font-medium">{stats.rejected}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Rejected</dt>
                    <dd className="text-lg font-medium text-gray-900">Applications</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {['all', 'pending', 'under_review', 'approved', 'rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    filter === status
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {status === 'all' ? 'All Applications' : getStatusText(status)}
                  {status !== 'all' && (
                    <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-100">
                      {stats[status]}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter === 'all' ? 'No applications have been submitted yet.' : `No ${getStatusText(filter)} applications found.`}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {applications.map((application) => (
                <li key={application.id}>
                  <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 truncate">
                              {application.program_name}
                            </h3>
                            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                              <span>{application.applicant_name}</span>
                              <span>•</span>
                              <span>{application.applicant_email}</span>
                              <span>•</span>
                              <span>Applied {formatDate(application.submitted_at)}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                application.status
                              )}`}
                            >
                              {getStatusText(application.status)}
                            </span>
                            <div className="flex space-x-2">
                              {application.status === 'pending' && (
                                <button
                                  onClick={() => handleStatusUpdate(application.id, 'under_review')}
                                  className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                                >
                                  Review
                                </button>
                              )}
                              {application.status === 'under_review' && (
                                <>
                                  <button
                                    onClick={() => handleStatusUpdate(application.id, 'approved')}
                                    className="text-green-600 hover:text-green-500 text-sm font-medium"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleStatusUpdate(application.id, 'rejected')}
                                    className="text-red-600 hover:text-red-500 text-sm font-medium"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              <Link
                                to={`/application/${application.id}`}
                                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                              >
                                View Details
                              </Link>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {application.cover_letter}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
