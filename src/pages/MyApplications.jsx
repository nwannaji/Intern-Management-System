import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { applicationsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

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
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      console.log('Fetching applications...');
      const response = await applicationsAPI.getMyApplications();
      console.log('Applications API response:', response);
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      
      setApplications(response.data);
      console.log('Applications set successfully:', response.data.length);
    } catch (error) {
      console.error('Full error object:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      toast.error('Failed to fetch applications');
      console.error('Error fetching applications:', error);
    } finally {
      setIsLoading(false);
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

  const handleDeleteApplication = async (applicationId, programName) => {
    // Show confirmation dialog
    const isConfirmed = window.confirm(
      `Are you sure you want to delete your application for "${programName}"? This action cannot be undone.`
    );
    
    if (!isConfirmed) {
      return;
    }

    try {
      setDeletingId(applicationId);
      
      // Show deletion feedback
      toast.info('🗑️ Deleting application...', {
        position: 'top-center',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Delete the application
      await applicationsAPI.deleteApplication(applicationId);
      
      // Remove from local state
      setApplications(applications.filter(app => app.id !== applicationId));
      
      // Show success message
      toast.success(`✅ Application for "${programName}" has been deleted successfully.`, {
        position: 'top-center',
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      console.log(`Application ${applicationId} deleted successfully`);
    } catch (error) {
      console.error('Error deleting application:', error);
      
      // Show specific error message
      let errorMessage = 'Failed to delete application';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(`❌ ${errorMessage}`, {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setDeletingId(null);
    }
  };

  const canDeleteApplication = (status) => {
    // Allow deletion of pending applications only
    // You can modify this logic based on your business requirements
    return status === 'pending';
  };

  const canEditApplication = (status) => {
    // Allow editing of pending applications only
    return status === 'pending';
  };

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
    setEditForm({
      cover_letter: '',
      why_interested: '',
      skills_and_experience: '',
      availability_start_date: ''
    });
  };

  const handleEditFormChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const validateEditForm = () => {
    const errors = [];
    
    if (!editForm.cover_letter || editForm.cover_letter.trim().length < 10) {
      errors.push('Cover letter must be at least 10 characters long');
    }
    
    if (!editForm.why_interested || editForm.why_interested.trim().length < 10) {
      errors.push('Please explain why you are interested in this program (minimum 10 characters)');
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
      errors.forEach(error => {
        toast.error(`❌ ${error}`, {
          position: 'top-center',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      });
      return;
    }

    try {
      // Show saving feedback
      toast.info('💾 Saving changes...', {
        position: 'top-center',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Update the application
      await applicationsAPI.updateApplication(applicationId, editForm);
      
      // Update local state
      setApplications(applications.map(app => 
        app.id === applicationId 
          ? { ...app, ...editForm }
          : app
      ));
      
      // Show success message
      toast.success(`✅ Application for "${programName}" has been updated successfully.`, {
        position: 'top-center',
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Exit edit mode
      handleCancelEdit();
      
      console.log(`Application ${applicationId} updated successfully`);
    } catch (error) {
      console.error('Error updating application:', error);
      
      // Show specific error message
      let errorMessage = 'Failed to update application';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(`❌ ${errorMessage}`, {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
            <p className="mt-2 text-gray-600">
              Track the status of your internship and NYSC applications
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              to="/programs"
              className="text-blue-600 hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium"
            >
              Browse Programs
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

        {applications.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <div className="text-gray-500 mb-4">
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-600 mb-4">
              You haven't submitted any applications yet. Browse available programs and apply today!
            </p>
            <Link
              to="/programs"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
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
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                application.status
                              )}`}
                            >
                              {getStatusText(application.status)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {application.cover_letter}
                          </p>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Link
                              to={`/application/${application.id}`}
                              className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                            >
                              View Details
                            </Link>
                            
                            {application.status === 'approved' && (
                              <span className="text-green-600 text-sm font-medium">
                                🎉 Congratulations! Your application has been approved.
                              </span>
                            )}
                            
                            {application.status === 'rejected' && (
                              <span className="text-red-600 text-sm font-medium">
                                Your application was not selected for this program.
                              </span>
                            )}
                          </div>
                          
                          {/* Action Buttons - Only show for pending applications */}
                          {canEditApplication(application.status) && (
                            <div className="flex items-center space-x-2">
                              {editingId === application.id ? (
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleSaveEdit(application.id, application.program_name)}
                                    className="inline-flex items-center px-3 py-1 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                                  >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Save
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                                  >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleEditApplication(application)}
                                    className="inline-flex items-center px-3 py-1 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                                  >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit
                                  </button>
                                  
                                  <button
                                    onClick={() => handleDeleteApplication(application.id, application.program_name)}
                                    disabled={deletingId === application.id}
                                    className="inline-flex items-center px-3 py-1 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                  >
                                    {deletingId === application.id ? (
                                      <>
                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-2"></div>
                                        Deleting...
                                      </>
                                    ) : (
                                      <>
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Delete
                                      </>
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Edit Form - Show when editing */}
                        {editingId === application.id && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">Edit Application Details</h4>
                            
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Cover Letter *
                                </label>
                                <textarea
                                  name="cover_letter"
                                  rows={3}
                                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                  placeholder="Update your cover letter..."
                                  value={editForm.cover_letter}
                                  onChange={handleEditFormChange}
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Why Interested *
                                </label>
                                <textarea
                                  name="why_interested"
                                  rows={2}
                                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                  placeholder="Update your motivation..."
                                  value={editForm.why_interested}
                                  onChange={handleEditFormChange}
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Skills & Experience *
                                </label>
                                <textarea
                                  name="skills_and_experience"
                                  rows={2}
                                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                  placeholder="Update your skills and experience..."
                                  value={editForm.skills_and_experience}
                                  onChange={handleEditFormChange}
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Availability Start Date *
                                </label>
                                <input
                                  type="date"
                                  name="availability_start_date"
                                  min={new Date().toISOString().split('T')[0]}
                                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                  value={editForm.availability_start_date}
                                  onChange={handleEditFormChange}
                                />
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
    </div>
  );
};

export default MyApplications;
