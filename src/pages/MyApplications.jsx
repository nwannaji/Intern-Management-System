import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import { applicationsAPI } from '../services/api';
import { formatDate } from '../utils/formatters';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    cover_letter: '',
    why_interested: '',
    skills_and_experience: '',
    availability_start_date: ''
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await applicationsAPI.getMyApplications();
      setApplications(response.data);
    } catch (error) {
      toast.error('Failed to fetch applications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteApplication = async (applicationId, programName) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to delete your application for "${programName}"? This action cannot be undone.`
    );
    if (!isConfirmed) return;

    try {
      setDeletingId(applicationId);
      await applicationsAPI.deleteApplication(applicationId);
      setApplications(applications.filter(app => app.id !== applicationId));
      toast.success(`Application for "${programName}" has been deleted.`);
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to delete application';
      toast.error(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  const canDeleteApplication = (status) => status === 'pending';
  const canEditApplication = (status) => status === 'pending';

  const handleEditApplication = (application) => {
    setEditingId(application.id);
    setEditForm({
      cover_letter: application.cover_letter || '',
      why_interested: application.why_interested || '',
      skills_and_experience: application.skills_and_experience || '',
      availability_start_date: application.availability_start_date || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ cover_letter: '', why_interested: '', skills_and_experience: '', availability_start_date: '' });
  };

  const handleEditFormChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const validateEditForm = () => {
    const errors = [];
    if (!editForm.cover_letter || editForm.cover_letter.trim().length < 10) {
      errors.push('Cover letter must be at least 10 characters long');
    }
    if (!editForm.why_interested || editForm.why_interested.trim().length < 10) {
      errors.push('Please explain why you are interested (minimum 10 characters)');
    }
    if (!editForm.skills_and_experience || editForm.skills_and_experience.trim().length < 10) {
      errors.push('Please describe your skills and experience (minimum 10 characters)');
    }
    if (!editForm.availability_start_date) {
      errors.push('Please provide your availability start date');
    } else {
      const startDate = new Date(editForm.availability_start_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (startDate < today) {
        errors.push('Availability start date cannot be in the past');
      }
    }
    return errors;
  };

  const handleSaveEdit = async (applicationId, programName) => {
    const errors = validateEditForm();
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    try {
      await applicationsAPI.updateApplication(applicationId, editForm);
      setApplications(applications.map(app =>
        app.id === applicationId ? { ...app, ...editForm } : app
      ));
      toast.success(`Application for "${programName}" updated.`);
      handleCancelEdit();
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to update application';
      toast.error(errorMessage);
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
            <h2 className="text-2xl font-bold text-gray-900">My Applications</h2>
            <p className="mt-1 text-sm text-gray-600">Track the status of your internship and NYSC applications</p>
          </div>
          <Link to="/programs" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
            Browse Programs
          </Link>
        </div>

        {applications.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-600 mb-4">Browse available programs and apply today!</p>
            <Link to="/programs" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
              Browse Programs
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {applications.map((application) => (
                <li key={application.id}>
                  <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {application.program_name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Applied on {formatDate(application.submitted_at)}
                            </p>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <StatusBadge status={application.status} />
                          </div>
                        </div>

                        <div className="mt-2">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {application.cover_letter}
                          </p>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Link to={`/application/${application.id}`} className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                              View Details
                            </Link>
                            {application.status === 'approved' && (
                              <span className="text-green-600 text-sm font-medium">Congratulations! Your application has been approved.</span>
                            )}
                            {application.status === 'rejected' && (
                              <span className="text-red-600 text-sm font-medium">Your application was not selected for this program.</span>
                            )}
                          </div>

                          {canEditApplication(application.status) && (
                            <div className="flex items-center space-x-2">
                              {editingId === application.id ? (
                                <>
                                  <button onClick={() => handleSaveEdit(application.id, application.program_name)}
                                    className="px-3 py-1 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 transition">
                                    Save
                                  </button>
                                  <button onClick={handleCancelEdit}
                                    className="px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100 transition">
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => handleEditApplication(application)}
                                    className="px-3 py-1 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 transition">
                                    Edit
                                  </button>
                                  <button onClick={() => handleDeleteApplication(application.id, application.program_name)}
                                    disabled={deletingId === application.id}
                                    className="px-3 py-1 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50 transition">
                                    {deletingId === application.id ? 'Deleting...' : 'Delete'}
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>

                        {editingId === application.id && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">Edit Application Details</h4>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Letter *</label>
                                <textarea name="cover_letter" rows={3}
                                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                  value={editForm.cover_letter} onChange={handleEditFormChange} />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Why Interested *</label>
                                <textarea name="why_interested" rows={2}
                                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                  value={editForm.why_interested} onChange={handleEditFormChange} />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Skills & Experience *</label>
                                <textarea name="skills_and_experience" rows={2}
                                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                  value={editForm.skills_and_experience} onChange={handleEditFormChange} />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Availability Start Date *</label>
                                <input type="date" name="availability_start_date"
                                  min={new Date().toISOString().split('T')[0]}
                                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                  value={editForm.availability_start_date} onChange={handleEditFormChange} />
                              </div>
                            </div>
                          </div>
                        )}

                        {application.reviewed_at && (
                          <div className="mt-2 text-xs text-gray-500">
                            Reviewed on {formatDate(application.reviewed_at)}
                            {application.reviewed_by_name && ` by ${application.reviewed_by_name}`}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyApplications;