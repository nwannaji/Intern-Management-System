import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { applicationsAPI, documentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [application, setApplication] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      fetchApplicationDetails();
    }
  }, [id]);

  const fetchApplicationDetails = async () => {
    try {
      setIsLoading(true);
      
      // Fetch application and documents in parallel
      const [applicationResponse, documentsResponse] = await Promise.all([
        applicationsAPI.getApplication(id),
        documentsAPI.getApplicationDocuments(id)
      ]);

      setApplication(applicationResponse.data);
      setDocuments(documentsResponse.data || []);

    } catch (error) {
      console.error('Failed to fetch application details:', error);
      toast.error('Failed to load application details');
      navigate('/my-applications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!isAdmin) return;

    setIsUpdating(true);
    try {
      await applicationsAPI.updateApplication(id, { status: newStatus });
      await fetchApplicationDetails(); // Refresh data
      toast.success(`Application ${newStatus.replace('_', ' ')} successfully`);
    } catch (error) {
      console.error('Failed to update application status:', error);
      toast.error('Failed to update application status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDocumentVerify = async (documentId, isVerified) => {
    if (!isAdmin) return;

    try {
      if (isVerified) {
        await documentsAPI.verifyDocument(documentId);
      } else {
        await documentsAPI.unverifyDocument(documentId);
      }
      await fetchApplicationDetails(); // Refresh data
      toast.success(`Document ${isVerified ? 'verified' : 'unverified'} successfully`);
    } catch (error) {
      console.error('Failed to update document status:', error);
      toast.error('Failed to update document status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      under_review: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pending',
      under_review: 'Under Review',
      approved: 'Approved',
      rejected: 'Rejected',
    };
    return texts[status] || status;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Not Found</h2>
          <button
            onClick={() => navigate('/my-applications')}
            className="text-blue-600 hover:text-blue-500"
          >
            Back to Applications
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(isAdmin ? '/admin' : '/my-applications')}
            className="text-blue-600 hover:text-blue-500 mb-4 inline-flex items-center"
          >
            ← Back to {isAdmin ? 'Admin Dashboard' : 'My Applications'}
          </button>
          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {application.program_name || 'Program Application'}
                </h1>
                <p className="mt-1 text-gray-600">
                  {application.applicant_name || 'Applicant'} • {application.applicant_email || 'Email'}
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    application.status
                  )}`}
                >
                  {getStatusText(application.status)}
                </span>
                <p className="text-sm text-gray-500 mt-1">
                  Submitted: {formatDate(application.submitted_at)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cover Letter */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Cover Letter</h2>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap text-gray-700">
                  {application.cover_letter || 'No cover letter provided'}
                </p>
              </div>
            </div>

            {/* Why Interested */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Why Interested</h2>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap text-gray-700">
                  {application.why_interested || 'No response provided'}
                </p>
              </div>
            </div>

            {/* Skills and Experience */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Skills and Experience</h2>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap text-gray-700">
                  {application.skills_and_experience || 'No response provided'}
                </p>
              </div>
            </div>

            {/* Status History */}
            {application.status_history && application.status_history.length > 0 && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Status History</h2>
                <div className="space-y-3">
                  {application.status_history.map((history) => (
                    <div key={history.id} className="flex items-start space-x-3 pb-3 border-b border-gray-200 last:border-0">
                      <div className="flex-shrink-0">
                        <div className={`w-2 h-2 rounded-full mt-2 ${getStatusColor(history.status).replace('text-', 'bg-')}`}></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">
                            {getStatusText(history.status)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(history.changed_at)}
                          </span>
                        </div>
                        {history.changed_by_name && (
                          <p className="text-xs text-gray-500">
                            by {history.changed_by_name}
                          </p>
                        )}
                        {history.notes && (
                          <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Admin Actions */}
            {isAdmin && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Admin Actions</h2>
                <div className="space-y-3">
                  {application.status !== 'approved' && (
                    <button
                      onClick={() => handleStatusUpdate('approved')}
                      disabled={isUpdating}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Approve Application
                    </button>
                  )}
                  {application.status !== 'rejected' && (
                    <button
                      onClick={() => handleStatusUpdate('rejected')}
                      disabled={isUpdating}
                      className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Reject Application
                    </button>
                  )}
                  {application.status === 'pending' && (
                    <button
                      onClick={() => handleStatusUpdate('under_review')}
                      disabled={isUpdating}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Mark as Under Review
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Documents */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Uploaded Documents</h2>
              
              {documents.length === 0 ? (
                <p className="text-sm text-gray-500">No documents uploaded</p>
              ) : (
                <div className="space-y-3">
                  {documents.map((document) => (
                    <div key={document.id} className="border border-gray-200 rounded-md p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {document.document_type_name || 'Document'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {document.file_name || 'Unknown file'} • {formatFileSize(document.file_size || 0)}
                          </p>
                          <p className="text-xs text-gray-400">
                            Uploaded: {document.uploaded_at ? formatDate(document.uploaded_at) : 'Unknown date'}
                          </p>
                          {document.is_verified && (
                            <p className="text-xs text-green-600 font-medium">
                              ✓ Verified
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {document.file_url && (
                            <a
                              href={document.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-500 text-sm"
                            >
                              View
                            </a>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => handleDocumentVerify(document.id, !document.is_verified)}
                              className={`text-xs px-2 py-1 rounded ${
                                document.is_verified
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                              }`}
                            >
                              {document.is_verified ? 'Verified' : 'Verify'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetail;
