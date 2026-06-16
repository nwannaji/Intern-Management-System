import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import { applicationsAPI } from '../services/api';
import { formatDate } from '../utils/formatters';

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

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const fetchApplications = async () => {
    try {
      const response = await applicationsAPI.getApplications();

      let allApplications = response.data;
      if (response.data && response.data.results) {
        allApplications = response.data.results;
      }

      if (!Array.isArray(allApplications)) {
        allApplications = [];
      }

      if (filter !== 'all') {
        allApplications = allApplications.filter(app => app.status === filter);
      }

      setApplications(allApplications);

      const statsData = {
        total: allApplications.length,
        pending: allApplications.filter(app => app.status === 'pending').length,
        under_review: allApplications.filter(app => app.status === 'under_review').length,
        approved: allApplications.filter(app => app.status === 'approved').length,
        rejected: allApplications.filter(app => app.status === 'rejected').length,
      };
      setStats(statsData);
    } catch (error) {
      toast.error('Failed to fetch applications');
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
    }
  };

  if (isLoading) {
    return <Layout><LoadingSpinner /></Layout>;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
            <p className="mt-1 text-sm text-gray-600">Manage internship and NYSC applications</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/admin/reports" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View Reports
            </Link>
            <Link to="/admin/users" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Manage Users
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="bg-white shadow rounded-lg p-5">
            <p className="text-sm font-medium text-gray-500">Total</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-5">
            <p className="text-sm font-medium text-yellow-600">Pending</p>
            <p className="text-3xl font-bold text-yellow-700">{stats.pending}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-5">
            <p className="text-sm font-medium text-blue-600">Under Review</p>
            <p className="text-3xl font-bold text-blue-700">{stats.under_review}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-5">
            <p className="text-sm font-medium text-green-600">Approved</p>
            <p className="text-3xl font-bold text-green-700">{stats.approved}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-5">
            <p className="text-sm font-medium text-red-600">Rejected</p>
            <p className="text-3xl font-bold text-red-700">{stats.rejected}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['all', 'pending', 'under_review', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition ${
                  filter === status
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {status === 'all' ? 'All Applications' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                {status !== 'all' && (
                  <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-100">
                    {stats[status]}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Applications Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter === 'all' ? 'No applications have been submitted yet.' : `No ${filter.replace('_', ' ')} applications found.`}
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
                            <StatusBadge status={application.status} />
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
    </Layout>
  );
};

export default AdminDashboard;