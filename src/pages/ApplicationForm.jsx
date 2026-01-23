import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { programsAPI, applicationsAPI, documentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ApplicationForm = () => {
  const { programId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [program, setProgram] = useState(null);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({});

  const [formData, setFormData] = useState({
    program: programId,
    cover_letter: '',
    why_interested: '',
    skills_and_experience: '',
    availability_start_date: '',
  });

  useEffect(() => {
    fetchProgram();
    fetchDocumentTypes();
  }, [programId]);

  const fetchProgram = async () => {
    try {
      const response = await programsAPI.getProgram(programId);
      setProgram(response.data);
    } catch (error) {
      toast.error('Failed to fetch program details');
      console.error('Error fetching program:', error);
      navigate('/programs');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDocumentTypes = async () => {
    try {
      const response = await documentsAPI.getDocumentTypes();
      setDocumentTypes(response.data);
    } catch (error) {
      // If authentication fails, provide fallback document types
      console.log('Using fallback document types due to authentication requirement');
      const fallbackTypes = [
        { id: 1, name: 'Resume/CV', description: 'Your current resume or CV', is_required: true },
        { id: 2, name: 'Cover Letter', description: 'Cover letter for the application', is_required: false },
        { id: 3, name: 'Academic Transcripts', description: 'Latest academic transcripts', is_required: false },
        { id: 4, name: 'ID Document', description: 'Government-issued ID', is_required: true },
        { id: 5, name: 'Letter of Recommendation', description: 'Professional recommendation', is_required: false },
        { id: 6, name: 'Portfolio', description: 'Work portfolio or projects', is_required: false },
      ];
      setDocumentTypes(fallbackTypes);
      console.error('Error fetching document types (using fallback):', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (documentTypeId, file) => {
    setUploadedFiles({
      ...uploadedFiles,
      [documentTypeId]: file,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Check if user has already applied to this program
      const myApplicationsResponse = await applicationsAPI.getMyApplications();
      const alreadyApplied = myApplicationsResponse.data.some(app => app.program === parseInt(programId));
      
      if (alreadyApplied) {
        toast.error('You have already applied to this program');
        setIsSubmitting(false);
        return;
      }

      // Submit application first
      console.log('Submitting application with data:', formData);
      const applicationResponse = await applicationsAPI.createApplication(formData);
      const application = applicationResponse.data;

      // Upload documents
      const uploadPromises = Object.entries(uploadedFiles).map(
        async ([documentTypeId, file]) => {
          if (file) {
            const formData = new FormData();
            formData.append('document_type', documentTypeId);
            formData.append('file', file);
            formData.append('application_id', application.id);

            return documentsAPI.uploadDocument(formData);
          }
        }
      );

      await Promise.all(uploadPromises.filter(Boolean));

      toast.success('Application submitted successfully!');
      navigate('/my-applications');
    } catch (error) {
      toast.error('Failed to submit application');
      console.error('Error submitting application:', error);
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

  if (!program) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Program Not Found</h2>
          <button
            onClick={() => navigate('/programs')}
            className="text-blue-600 hover:text-blue-500"
          >
            Back to Programs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              Apply for {program.name}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              {program.program_type === 'IT' ? 'Industrial Training' : 'NYSC'} Program
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Name</p>
                    <p className="text-sm text-gray-900">{user?.first_name} {user?.last_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Email</p>
                    <p className="text-sm text-gray-900">{user?.email}</p>
                  </div>
                  {user?.phone_number && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Phone</p>
                      <p className="text-sm text-gray-900">{user.phone_number}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Application Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Application Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="cover_letter" className="block text-sm font-medium text-gray-700">
                    Cover Letter *
                  </label>
                  <textarea
                    id="cover_letter"
                    name="cover_letter"
                    rows={6}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Write your cover letter explaining why you're interested in this program..."
                    value={formData.cover_letter}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label htmlFor="why_interested" className="block text-sm font-medium text-gray-700">
                    Why are you interested in this program? *
                  </label>
                  <textarea
                    id="why_interested"
                    name="why_interested"
                    rows={4}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Explain your motivation for applying to this specific program..."
                    value={formData.why_interested}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label htmlFor="skills_and_experience" className="block text-sm font-medium text-gray-700">
                    Skills and Experience *
                  </label>
                  <textarea
                    id="skills_and_experience"
                    name="skills_and_experience"
                    rows={4}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Describe your relevant skills, experience, and qualifications..."
                    value={formData.skills_and_experience}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label htmlFor="availability_start_date" className="block text-sm font-medium text-gray-700">
                    Available Start Date *
                  </label>
                  <input
                    type="date"
                    id="availability_start_date"
                    name="availability_start_date"
                    required
                    min={program.start_date}
                    max={program.end_date}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.availability_start_date}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Document Upload */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Required Documents</h3>
              <div className="space-y-4">
                {documentTypes.map((docType) => (
                  <div key={docType.id} className="border border-gray-200 rounded-md p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-900">
                          {docType.name} {docType.is_required && <span className="text-red-500">*</span>}
                        </label>
                        <p className="text-sm text-gray-600 mt-1">{docType.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Max size: 5MB | 
                          Allowed: PDF, DOC, DOCX, JPG, JPEG, PNG
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <input
                        type="file"
                        id={`document_${docType.id}`}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"  // Default allowed extensions
                        onChange={(e) => handleFileChange(docType.id, e.target.files[0])}
                        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-md cursor-pointer bg-gray-50 focus:outline-none focus:border-blue-500"
                      />
                      {uploadedFiles[docType.id] && (
                        <div className="mt-2 text-sm text-green-600">
                          ✓ {uploadedFiles[docType.id].name} ({formatFileSize(uploadedFiles[docType.id].size)})
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/programs')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </div>
                ) : (
                  'Submit Application'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;
