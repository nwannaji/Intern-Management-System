import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { programsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ApplyPage = () => {
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [dragOver, setDragOver] = useState({});
  const [fileErrors, setFileErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Supported file formats and their MIME types
  const SUPPORTED_FORMATS = {
    'PDF': { mime: 'application/pdf', ext: ['.pdf'] },
    'DOC': { mime: 'application/msword', ext: ['.doc'] },
    'DOCX': { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', ext: ['.docx'] },
    'JPG': { mime: 'image/jpeg', ext: ['.jpg', '.jpeg'] },
    'JPEG': { mime: 'image/jpeg', ext: ['.jpg', '.jpeg'] },
    'PNG': { mime: 'image/png', ext: ['.png'] },
    'TXT': { mime: 'text/plain', ext: ['.txt'] },
    'RTF': { mime: 'application/rtf', ext: ['.rtf'] },
    'XLS': { mime: 'application/vnd.ms-excel', ext: ['.xls'] },
    'XLSX': { mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', ext: ['.xlsx'] },
    'PPT': { mime: 'application/vnd.ms-powerpoint', ext: ['.ppt'] },
    'PPTX': { mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', ext: ['.pptx'] }
  };

  const getAllowedExtensions = () => {
    return Object.values(SUPPORTED_FORMATS).flatMap(format => format.ext).join(',');
  };

  const getAllowedFormats = () => {
    return Object.keys(SUPPORTED_FORMATS).join(', ');
  };

  const [formData, setFormData] = useState({
    program: '',
    cover_letter: '',
    why_interested: '',
    skills_and_experience: '',
    availability_start_date: '',
  });

  useEffect(() => {
    fetchPrograms();
    fetchDocumentTypes();
  }, []);

  const fetchPrograms = async () => {
    try {
      const response = await programsAPI.getPrograms();
      let programsData = response.data;
      if (response.data && response.data.results) {
        programsData = response.data.results;
      }
      
      // Filter out expired programs
      const activePrograms = Array.isArray(programsData) 
        ? programsData.filter(program => {
            const deadline = new Date(program.application_deadline);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return deadline >= today && program.is_active;
          })
        : [];
      
      setPrograms(activePrograms);
    } catch (error) {
      toast.error('Failed to fetch programs');
      console.error('Error fetching programs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDocumentTypes = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/document-types/');
      const data = await response.json();
      setDocumentTypes(data);
    } catch (error) {
      // Fallback document types
      const fallbackTypes = [
        { id: 1, name: 'Resume/CV', description: 'Your current resume or CV', is_required: true },
        { id: 2, name: 'Cover Letter', description: 'Cover letter for the application', is_required: false },
        { id: 3, name: 'Academic Transcripts', description: 'Latest academic transcripts', is_required: false },
        { id: 4, name: 'ID Document', description: 'Government-issued ID', is_required: true },
        { id: 5, name: 'Letter of Recommendation', description: 'Professional recommendation', is_required: false },
        { id: 6, name: 'Portfolio', description: 'Work portfolio or projects', is_required: false },
      ];
      setDocumentTypes(fallbackTypes);
    }
  };

  const validateFile = (file, documentTypeId) => {
    const docType = documentTypes.find(dt => dt.id === parseInt(documentTypeId));
    const errors = [];

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      errors.push(`File size must be less than 5MB. Current size: ${formatFileSize(file.size)}`);
    }

    // Check file format
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    const allowedExtensions = Object.values(SUPPORTED_FORMATS).flatMap(format => format.ext);
    
    if (!allowedExtensions.includes(fileExtension)) {
      errors.push(`File format not supported. Allowed formats: ${getAllowedFormats()}`);
    }

    // Check MIME type
    const allowedMimeTypes = Object.values(SUPPORTED_FORMATS).map(format => format.mime);
    if (!allowedMimeTypes.includes(file.type)) {
      errors.push(`File type not supported. Please upload a valid file.`);
    }

    // Check for required documents
    if (docType?.is_required && !file) {
      errors.push(`${docType.name} is required.`);
    }

    return errors;
  };

  const handleFileChange = (documentTypeId, file) => {
    if (!file) {
      setUploadedFiles(prev => ({ ...prev, [documentTypeId]: null }));
      setFileErrors(prev => ({ ...prev, [documentTypeId]: [] }));
      return;
    }

    const errors = validateFile(file, documentTypeId);
    
    if (errors.length > 0) {
      setFileErrors(prev => ({ ...prev, [documentTypeId]: errors }));
      setUploadedFiles(prev => ({ ...prev, [documentTypeId]: null }));
      errors.forEach(error => toast.error(error));
      return;
    }

    setFileErrors(prev => ({ ...prev, [documentTypeId]: [] }));
    setUploadedFiles(prev => ({ ...prev, [documentTypeId]: file }));
    toast.success(`${file.name} uploaded successfully!`);
  };

  const handleDragOver = (e, documentTypeId) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(prev => ({ ...prev, [documentTypeId]: true }));
  };

  const handleDragLeave = (e, documentTypeId) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(prev => ({ ...prev, [documentTypeId]: false }));
  };

  const handleDrop = (e, documentTypeId) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(prev => ({ ...prev, [documentTypeId]: false }));

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileChange(documentTypeId, files[0]);
    }
  };

  const removeFile = (documentTypeId) => {
    setUploadedFiles(prev => ({ ...prev, [documentTypeId]: null }));
    setFileErrors(prev => ({ ...prev, [documentTypeId]: [] }));
    toast.info('File removed');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProgramSelect = (program) => {
    setSelectedProgram(program);
    setFormData(prev => ({ ...prev, program: program.id }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedProgram) {
      toast.error('Please select a program to apply for');
      return;
    }

    setIsSubmitting(true);

    try {
      // Validate required documents
      const requiredDocTypes = documentTypes.filter(dt => dt.is_required);
      const missingDocuments = requiredDocTypes.filter(docType => !uploadedFiles[docType.id]);
      
      if (missingDocuments.length > 0) {
        toast.error(`Please upload all required documents: ${missingDocuments.map(dt => dt.name).join(', ')}`);
        return;
      }

      // Navigate to the specific application form with pre-filled data
      navigate(`/apply/${selectedProgram.id}`, { 
        state: { 
          formData, 
          uploadedFiles,
          documentTypes 
        } 
      });
    } catch (error) {
      toast.error('Failed to proceed with application');
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Apply for a Program
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Select a program and upload your documents to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Program Selection */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Select a Program</h2>
            
            {programs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No active programs available at the moment.</p>
                <button
                  type="button"
                  onClick={() => navigate('/programs')}
                  className="mt-4 text-blue-600 hover:text-blue-500 font-medium"
                >
                  View All Programs
                </button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {programs.map((program) => (
                  <div
                    key={program.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                      selectedProgram?.id === program.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleProgramSelect(program)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{program.name}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        program.program_type === 'IT' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {program.program_type === 'IT' ? 'IT' : 'NYSC'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{program.description}</p>
                    <div className="text-xs text-gray-500">
                      <p>Duration: {program.duration_months} months</p>
                      <p>Deadline: {new Date(program.application_deadline).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Application Details */}
          {selectedProgram && (
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Application Details for {selectedProgram.name}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="cover_letter" className="block text-sm font-medium text-gray-700">
                    Cover Letter *
                  </label>
                  <textarea
                    id="cover_letter"
                    name="cover_letter"
                    rows={4}
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
                    min={selectedProgram.start_date}
                    max={selectedProgram.end_date}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.availability_start_date}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Document Upload */}
          {selectedProgram && (
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Upload Documents
                <span className="text-sm text-gray-500 ml-2">
                  (Supported formats: {getAllowedFormats()})
                </span>
              </h2>
              <div className="space-y-4">
                {documentTypes.map((docType) => (
                  <div key={docType.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-900">
                          {docType.name} {docType.is_required && <span className="text-red-500">*</span>}
                        </label>
                        <p className="text-sm text-gray-600 mt-1">{docType.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Max size: 5MB | Multiple formats supported
                        </p>
                      </div>
                    </div>
                    
                    <div
                      className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        dragOver[docType.id]
                          ? 'border-blue-500 bg-blue-50'
                          : uploadedFiles[docType.id]
                          ? 'border-green-500 bg-green-50'
                          : fileErrors[docType.id]?.length > 0
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onDragOver={(e) => handleDragOver(e, docType.id)}
                      onDragLeave={(e) => handleDragLeave(e, docType.id)}
                      onDrop={(e) => handleDrop(e, docType.id)}
                    >
                      <input
                        type="file"
                        id={`document_${docType.id}`}
                        accept={getAllowedExtensions()}
                        onChange={(e) => handleFileChange(docType.id, e.target.files[0])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      
                      {!uploadedFiles[docType.id] ? (
                        <div className="space-y-4">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <div className="text-sm text-gray-600">
                            <p className="font-medium">Drag and drop your file here, or</p>
                            <p className="text-xs">PDF, DOC, DOCX, JPG, PNG, and more</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => document.getElementById(`document_${docType.id}`).click()}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                          >
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              />
                            </svg>
                            Browse Files
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <svg
                            className="mx-auto h-12 w-12 text-green-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <div className="text-sm">
                            <p className="font-medium text-green-700">
                              {uploadedFiles[docType.id].name}
                            </p>
                            <p className="text-xs text-green-600">
                              {formatFileSize(uploadedFiles[docType.id].size)}
                            </p>
                          </div>
                          <div className="flex justify-center space-x-2">
                            <button
                              type="button"
                              onClick={() => document.getElementById(`document_${docType.id}`).click()}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Change File
                            </button>
                            <button
                              type="button"
                              onClick={() => removeFile(docType.id)}
                              className="text-xs text-red-600 hover:text-red-800 font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {fileErrors[docType.id]?.length > 0 && (
                      <div className="mt-3 text-xs text-red-600">
                        {fileErrors[docType.id].map((error, index) => (
                          <p key={index} className="flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            {error}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          {selectedProgram && (
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
                className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  'Continue to Submit Application'
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ApplyPage;
