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
    fetchApplication();
    fetchDocuments();
  }, [id]);

  const fetchApplication = async () => {
    try {
      const response = await applicationsAPI.getApplication(id);
      setApplication(response.data);
    } catch (error) {
      toast.error('Failed to fetch application details');
      console.error('Error fetching application:', error);
      navigate('/my-applications');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      console.log(`Fetching documents for application ${id}...`);
      console.log('Full API URL:', `http://localhost:8000/api/documents/?application=${id}`);
      
      const response = await documentsAPI.getApplicationDocuments(id);
      console.log('Documents API response:', response);
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      console.log('Response data:', response.data);
      console.log('Response data type:', typeof response.data);
      console.log('Is array?', Array.isArray(response.data));
      
      // Check if it's a paginated response
      if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        console.log('Response appears to be paginated. Keys:', Object.keys(response.data));
        if (response.data.results) {
          console.log('Found results array in paginated response:', response.data.results);
          console.log('Results count:', response.data.results.length);
          setDocuments(response.data.results);
          return;
        }
      }
      
      // Ensure documents is always an array
      let documentsData = response.data;
      if (Array.isArray(documentsData)) {
        console.log('Setting documents array:', documentsData);
        console.log('Documents count:', documentsData.length);
        documentsData.forEach((doc, index) => {
          console.log(`Document ${index + 1}:`, {
            id: doc.id,
            application: doc.application,
            document_type: doc.document_type,
            document_type_name: doc.document_type_name,
            file_name: doc.file_name,
            file_url: doc.file_url,
            file_size: doc.file_size,
            uploaded_at: doc.uploaded_at,
            is_verified: doc.is_verified
          });
        });
        setDocuments(documentsData);
      } else {
        console.warn('Documents response is not an array:', documentsData);
        console.warn('Type of documentsData:', typeof documentsData);
        console.warn('Keys of documentsData:', Object.keys(documentsData || {}));
        setDocuments([]);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      console.error('Error config:', error.config);
      setDocuments([]);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    setIsUpdating(true);
    try {
      await applicationsAPI.updateApplication(id, { status: newStatus });
      await fetchApplication();
      toast.success(`Application ${newStatus} successfully`);
    } catch (error) {
      toast.error('Failed to update application status');
      console.error('Error updating application:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDocumentVerify = async (documentId, isVerified) => {
    try {
      if (isVerified) {
        await documentsAPI.verifyDocument(documentId);
      } else {
        await documentsAPI.unverifyDocument(documentId);
      }
      await fetchDocuments();
      toast.success(`Document ${isVerified ? 'verified' : 'unverified'} successfully`);
    } catch (error) {
      toast.error('Failed to update document status');
      console.error('Error updating document:', error);
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
                  {application.program_name}
                </h1>
                <p className="mt-1 text-gray-600">
                  {application.applicant_name} • {application.applicant_email}
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
          {/* Application Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cover Letter */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Cover Letter</h2>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap text-gray-700">
                  {application.cover_letter}
                </p>
              </div>
            </div>

            {/* Why Interested */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Why Interested</h2>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap text-gray-700">
                  {application.why_interested}
                </p>
              </div>
            </div>

            {/* Skills and Experience */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Skills and Experience</h2>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap text-gray-700">
                  {application.skills_and_experience}
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
            {/* Application Info */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Application Information</h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Program Type</dt>
                  <dd className="text-sm text-gray-900">
                    {application.program_type === 'IT' ? 'Industrial Training' : 'NYSC'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Availability Start Date</dt>
                  <dd className="text-sm text-gray-900">
                    {new Date(application.availability_start_date).toLocaleDateString()}
                  </dd>
                </div>
                {application.reviewed_at && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Reviewed On</dt>
                    <dd className="text-sm text-gray-900">
                      {formatDate(application.reviewed_at)}
                    </dd>
                  </div>
                )}
                {application.admin_notes && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Admin Notes</dt>
                    <dd className="text-sm text-gray-900">
                      {application.admin_notes}
                    </dd>
                  </div>
                )}
              </dl>

              {/* Admin Actions */}
              {isAdmin && (
                <div className="mt-6 space-y-2">
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
              )}
            </div>

            {/* Documents */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Uploaded Documents</h2>
              
              {/* Debug: Show documents state */}
              <div className="mb-4 p-3 bg-gray-50 rounded text-xs">
                <p><strong>Debug Info:</strong></p>
                <p>Documents state type: {typeof documents}</p>
                <p>Documents state: {JSON.stringify(documents)}</p>
                <p>Documents length: {documents?.length || 0}</p>
                <p>Is array: {Array.isArray(documents)}</p>
              </div>
              
              {documents && documents.length === 0 ? (
                <p className="text-sm text-gray-500">No documents uploaded</p>
              ) : (
                <div className="space-y-3">
                  {documents && documents.map((document) => (
                    <div key={document.id} className="border border-gray-200 rounded-md p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {document.document_type_name || 'Unknown Document Type'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {document.file_name || 'Unknown File'} • {formatFileSize(document.file_size || 0)}
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
