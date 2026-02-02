import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { programsAPI, applicationsAPI, documentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ApplicationForm = () => {
  const { programId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State management
  const [program, setProgram] = useState(null);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingApplication, setExistingApplication] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [dragOver, setDragOver] = useState({});
  const [formData, setFormData] = useState({
    program: programId,
    cover_letter: '',
    why_interested: '',
    skills_and_experience: '',
    availability_start_date: '',
  });

  // File validation constants
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];
  const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
  ];

  useEffect(() => {
    initializeForm();
  }, [programId]);

  const initializeForm = async () => {
    try {
      await Promise.all([
        fetchProgram(),
        fetchDocumentTypes(),
        checkExistingApplication()
      ]);
    } catch (error) {
      console.error('Failed to initialize form:', error);
      toast.error('Failed to load application form');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProgram = async () => {
    try {
      const response = await programsAPI.getProgram(programId);
      setProgram(response.data);
    } catch (error) {
      console.error('Failed to fetch program:', error);
      toast.error('Failed to load program details');
      navigate('/programs');
    }
  };

  const fetchDocumentTypes = async () => {
    try {
      const response = await documentsAPI.getDocumentTypes();
      const types = Array.isArray(response.data) ? response.data : [];
      setDocumentTypes(types);
      
      console.log('Loaded document types:', types); // Debug log
      
      if (types.length === 0) {
        console.warn('No document types available');
        toast.warning('No document types configured');
      }
    } catch (error) {
      console.error('Failed to fetch document types:', error);
      toast.error('Failed to load document requirements');
    }
  };

  const checkExistingApplication = async () => {
    try {
      const response = await applicationsAPI.getMyApplications();
      const applications = response.data.results || response.data;
      
      const existingApp = applications.find(app => 
        app.program === parseInt(programId) && 
        ['pending', 'approved', 'under_review'].includes(app.status)
      );
      
      if (existingApp) {
        setExistingApplication(existingApp);
        toast.error('You have already applied to this program', {
          position: 'top-center',
          autoClose: 5000,
        });
        navigate('/my-applications');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to check existing applications:', error);
      return false;
    }
  };

  const validateFile = (file, documentType) => {
    const errors = [];

    // Check file size
    if (file.size > (documentType?.max_file_size || MAX_FILE_SIZE)) {
      errors.push(`File size exceeds limit of ${formatFileSize(documentType?.max_file_size || MAX_FILE_SIZE)}`);
    }

    // Check file extension
    const extension = file.name.split('.').pop().toLowerCase();
    const allowedExtensions = documentType?.allowed_extensions?.split(',') || ALLOWED_EXTENSIONS;
    
    if (!allowedExtensions.includes(extension)) {
      errors.push(`File type .${extension} not allowed. Allowed: ${allowedExtensions.join(', ')}`);
    }

    // Check MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      errors.push(`Invalid file format`);
    }

    return errors;
  };

  const handleMultipleFileChange = (event) => {
    const files = Array.from(event.target.files);
    
    // Only process the first file if multiple are selected
    const fileToProcess = files[0];
    if (!fileToProcess) return;
    
    // Clear any existing uploads first
    setUploadedFiles({});
    
    // Find the best matching document type based on file name
    let matchedDocType = null;
    
    // Try to match by filename patterns
    const fileName = fileToProcess.name.toLowerCase();
    if (fileName.includes('recommendation') || fileName.includes('school') || fileName.includes('it')) {
      matchedDocType = documentTypes.find(dt => dt.name.toLowerCase().includes('school'));
    } else if (fileName.includes('nysc') || fileName.includes('orientation') || fileName.includes('camp')) {
      matchedDocType = documentTypes.find(dt => dt.name.toLowerCase().includes('nysc'));
    }
    
    // If no match found, use the first available document type
    if (!matchedDocType && documentTypes.length > 0) {
      matchedDocType = documentTypes[0];
      console.log(`No filename match for ${fileToProcess.name}, using first available document type: ${matchedDocType.name}`);
    }
    
    // If still no match found and document types are empty, show a more helpful error
    if (!matchedDocType) {
      if (documentTypes.length === 0) {
        toast.error(`Document types are still loading. Please try again in a moment.`, {
          autoClose: 5000,
        });
      } else {
        toast.error(`Unable to categorize ${fileToProcess.name}. Please ensure it's a School Recommendation Letter or NYSC Orientation Camp Letter.`, {
          autoClose: 5000,
        });
      }
      return;
    }
    
    // Validate and upload the file
    const errors = validateFile(fileToProcess, matchedDocType);
    if (errors.length === 0) {
      setUploadedFiles({ [matchedDocType.id]: fileToProcess });
      toast.success(`${fileToProcess.name} assigned to ${matchedDocType.name}`);
    } else {
      errors.forEach(error => toast.error(`${fileToProcess.name}: ${error}`));
    }
    
    // Reset the input value to allow selecting the same files again
    event.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(prev => ({ ...prev, global: true }));
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(prev => ({ ...prev, global: false }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(prev => ({ ...prev, global: false }));

    const files = Array.from(e.dataTransfer.files);
    // Only process the first file
    const fileToProcess = files[0];
    if (!fileToProcess) return;
    
    const event = { target: { files: [fileToProcess] } };
    handleMultipleFileChange(event);
  };

  const removeFile = (documentTypeId) => {
    setUploadedFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[documentTypeId];
      return newFiles;
    });
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.cover_letter.trim()) {
      errors.cover_letter = 'Cover letter is required';
    }

    if (!formData.why_interested.trim()) {
      errors.why_interested = 'Why interested field is required';
    }

    if (!formData.skills_and_experience.trim()) {
      errors.skills_and_experience = 'Skills and experience field is required';
    }

    if (!formData.availability_start_date) {
      errors.availability_start_date = 'Availability start date is required';
    }

    // Check that at least one document is uploaded (but not both)
    const uploadedDocTypes = Object.keys(uploadedFiles);
    if (uploadedDocTypes.length === 0) {
      errors.document_required = 'At least one document is required (Recommendation Letter OR NYSC Letter)';
    } else if (uploadedDocTypes.length > 1) {
      errors.document_required = 'Only one document is allowed (either Recommendation Letter OR NYSC Letter, not both)';
    }

    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const uploadDocument = async (documentTypeId, file, applicationId) => {
    try {
      const formData = new FormData();
      formData.append('application_id', applicationId);
      formData.append('document_type', documentTypeId);
      formData.append('file', file);

      const response = await documentsAPI.uploadDocument(formData);
      return response.data;
    } catch (error) {
      console.error(`Failed to upload document ${documentTypeId}:`, error);
      
      // Extract specific error message
      let errorMessage = 'Failed to upload document';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Check for file-specific errors
        if (errorData.file) {
          errorMessage = Array.isArray(errorData.file) ? errorData.file[0] : errorData.file;
        }
        // Check for non-field errors
        else if (errorData.non_field_errors) {
          errorMessage = Array.isArray(errorData.non_field_errors) ? errorData.non_field_errors[0] : errorData.non_field_errors;
        }
        // Check for detail field
        else if (errorData.detail) {
          errorMessage = errorData.detail;
        }
        // Check for message field
        else if (errorData.message) {
          errorMessage = errorData.message;
        }
        // If it's a string, use it directly
        else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      }
      
      throw new Error(errorMessage);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      Object.values(errors).forEach(error => toast.error(error));
      return;
    }

    setIsSubmitting(true);

    try {
      // Create application first
      const applicationData = {
        program: formData.program,
        cover_letter: formData.cover_letter,
        why_interested: formData.why_interested,
        skills_and_experience: formData.skills_and_experience,
        availability_start_date: formData.availability_start_date,
      };

      const applicationResponse = await applicationsAPI.createApplication(applicationData);
      const application = applicationResponse.data;

      toast.success('Application submitted successfully!');

      // Upload documents if any
      if (Object.keys(uploadedFiles).length > 0) {
        toast.info('Uploading documents...', { position: 'top-center' });

        const uploadPromises = Object.entries(uploadedFiles).map(
          async ([documentTypeId, file]) => {
            try {
              await uploadDocument(documentTypeId, file, application.id);
              toast.success(`${file.name} uploaded successfully`);
            } catch (error) {
              toast.error(`Failed to upload ${file.name}: ${error.message}`);
              throw error;
            }
          }
        );

        await Promise.all(uploadPromises);
        toast.success('All documents uploaded successfully!');
      }

      // Redirect to applications
      setTimeout(() => {
        navigate('/my-applications');
      }, 2000);

    } catch (error) {
      console.error('Application submission failed:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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

  if (existingApplication) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Already Submitted</h2>
          <p className="text-gray-600 mb-6">You have already applied to this program.</p>
          <button
            onClick={() => navigate('/my-applications')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            View My Applications
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Apply to {program?.title || 'Program'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={`${user?.first_name || ''} ${user?.last_name || ''}`}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Application Details Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Application Details</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Letter *
                  </label>
                  <textarea
                    name="cover_letter"
                    value={formData.cover_letter}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tell us about yourself and why you're interested in this program..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Why are you interested in this program? *
                  </label>
                  <textarea
                    name="why_interested"
                    value={formData.why_interested}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="What specifically interests you about this program?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills and Experience *
                  </label>
                  <textarea
                    name="skills_and_experience"
                    value={formData.skills_and_experience}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe your relevant skills and experience..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability Start Date *
                  </label>
                  <input
                    type="date"
                    name="availability_start_date"
                    value={formData.availability_start_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Documents Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Documents</h2>
              
              {/* Document Types Loading/Error Status */}
              {documentTypes.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-yellow-800">
                      {isLoading ? 'Loading document requirements...' : 'Document requirements are being configured. You can still upload your document.'}
                    </p>
                    {!isLoading && (
                      <button
                        type="button"
                        onClick={fetchDocumentTypes}
                        className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                      >
                        Reload Document Types
                      </button>
                    )}
                  </div>
                </div>
              )}
                
              {/* Single Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors mb-6 ${
                  dragOver.global
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="space-y-4">
                  <div className="text-gray-400">
                    <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <label className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-500 font-medium">
                        Browse Files
                      </span>
                      <span className="text-gray-600"> or drag and drop</span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleMultipleFileChange}
                        multiple
                        accept={ALLOWED_EXTENSIONS.join(',')}
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      Supported formats: {ALLOWED_EXTENSIONS.join(', ')} • Max size: {formatFileSize(MAX_FILE_SIZE)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Document Requirements Info - Only show if document types are loaded */}
              {documentTypes.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-medium text-blue-900 mb-3">Document Requirements:</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                    <p className="text-sm font-medium text-yellow-800 mb-1">
                      ⚠️ Important: Only ONE document is required
                    </p>
                    <p className="text-xs text-yellow-700">
                      Please upload EITHER a School Recommendation Letter OR an NYSC Orientation Camp Letter, but not both.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-3 border border-blue-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">Option 1: School Recommendation Letter</h4>
                      <div className="text-sm text-gray-700">
                        Recommendation letter from your school supporting your application
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Max size: 5MB • Formats: PDF, DOC, DOCX, JPG, JPEG, PNG
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 border border-blue-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">Option 2: NYSC Orientation Camp Letter</h4>
                      <div className="text-sm text-gray-700">
                        Letter showing completion of 3 weeks NYSC orientation camp
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Max size: 5MB • Formats: PDF, DOC, DOCX, JPG, JPEG, PNG
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-blue-200">
                    <p className="text-xs text-blue-700">
                      <strong>Note:</strong> The system will automatically assign your document to the correct category based on the filename.
                      If you upload a new document, it will replace the previous one.
                    </p>
                  </div>
                </div>
              )}

              {/* Uploaded Files List */}
              {Object.keys(uploadedFiles).length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-gray-900">Uploaded Document</h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800 mb-2">
                      ✅ Document uploaded successfully. You can replace it by uploading a new file.
                    </p>
                  </div>
                  {Object.entries(uploadedFiles).map(([documentTypeId, file]) => {
                    const docType = documentTypes.find(dt => dt.id === parseInt(documentTypeId));
                    return (
                      <div key={documentTypeId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-3">
                          <div className="text-blue-600">
                            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(file.size)} • Type: {docType?.name || 'Unknown'}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(documentTypeId)}
                          className="text-red-600 hover:text-red-500"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/programs')}
                className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;
