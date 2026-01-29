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
  const [documentTypes, setDocumentTypes] = useState([
    { id: 1, name: 'Application Document', description: 'Your application document (resume, CV, or portfolio)', is_required: true }
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCheckedDuplicates, setHasCheckedDuplicates] = useState(false);
  const [existingApplication, setExistingApplication] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [uploadedDocuments, setUploadedDocuments] = useState([]); // Store successfully uploaded documents
  const [dragOver, setDragOver] = useState({});
  const [fileErrors, setFileErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});

  // Supported file formats and their MIME types
  const SUPPORTED_FORMATS = {
    'PDF': { mime: 'application/pdf', ext: ['.pdf'] },
    'DOC': { mime: 'application/msword', ext: ['.doc'] },
    'DOCX': { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', ext: ['.docx'] },
    'JPG': { mime: 'image/jpeg', ext: ['.jpg', '.jpeg'] },
    'JPEG': { mime: 'image/jpeg', ext: ['.jpg', '.jpeg'] },
    'PNG': { mime: 'image/png', ext: ['.png'] }
  };

  const getAllowedExtensions = () => {
    return Object.values(SUPPORTED_FORMATS).flatMap(format => format.ext).join(',');
  };

  const getAllowedFormats = () => {
    return Object.keys(SUPPORTED_FORMATS).join(', ');
  };

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
    checkExistingApplication();
  }, [programId]);

  const checkExistingApplication = async () => {
    try {
      console.log('Checking existing applications for program:', programId);
      const response = await applicationsAPI.getMyApplications();
      
      // Handle paginated response
      const applications = response.data.results || response.data;
      console.log('My applications response:', applications);
      
      const existingApp = applications.find(app => 
        app.program === parseInt(programId) && 
        ['pending', 'approved', 'under_review'].includes(app.status)
      );
      
      console.log('Existing application found:', existingApp);
      setExistingApplication(existingApp);
      setHasCheckedDuplicates(true);
      
      if (existingApp) {
        console.log('Duplicate application detected, redirecting...');
        toast.error('🚫 Duplicate submission detected! You have already applied to this program.', {
          position: 'top-center',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        navigate('/my-applications');
        return true; // Return true to indicate duplicate found
      } else {
        console.log('No existing application found, proceeding...');
        return false; // Return false to indicate no duplicate
      }
    } catch (error) {
      console.log('Could not check existing applications:', error);
      setHasCheckedDuplicates(true);
      return false; // Assume no duplicate if check fails
    }
  };

  const fetchProgram = async () => {
    try {
      const response = await programsAPI.getProgram(programId);
      const programData = response.data;
      
      // Check if program has expired
      const deadline = new Date(programData.application_deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (deadline < today) {
        toast.error(`This program expired on ${deadline.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}. Applications are no longer accepted.`);
        navigate('/programs');
        return;
      }
      
      // Check if program is active
      if (!programData.is_active) {
        toast.error('This program is currently not accepting applications.');
        navigate('/programs');
        return;
      }
      
      setProgram(programData);
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
      if (response.data && response.data.length > 0) {
        setDocumentTypes(response.data);
        console.log('Document types loaded from API:', response.data);
      } else {
        throw new Error('No document types received');
      }
    } catch (error) {
      // Always provide fallback document type
      console.log('Using fallback document type due to error:', error.message);
      const fallbackTypes = [
        { id: 1, name: 'Application Document', description: 'Your application document (resume, CV, or portfolio)', is_required: true }
      ];
      setDocumentTypes(fallbackTypes);
      console.log('Fallback document types set:', fallbackTypes);
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
    console.log('handleFileChange called:', { documentTypeId, file: file?.name, fileSize: file?.size });
    
    if (!file) {
      // Clear file
      console.log('Clearing file for document type:', documentTypeId);
      setUploadedFiles(prev => {
        console.log('Before clear:', prev);
        const newFiles = { ...prev, [documentTypeId]: null };
        console.log('After clear:', newFiles);
        return newFiles;
      });
      setFileErrors(prev => ({ ...prev, [documentTypeId]: [] }));
      return;
    }

    // Validate file
    const errors = validateFile(file, documentTypeId);
    
    if (errors.length > 0) {
      console.log('File validation errors:', errors);
      setFileErrors(prev => ({ ...prev, [documentTypeId]: errors }));
      setUploadedFiles(prev => ({ ...prev, [documentTypeId]: null }));
      errors.forEach(error => toast.error(error));
      return;
    }

    // Clear errors and set file
    console.log('Setting uploaded file:', { documentTypeId, fileName: file.name });
    setUploadedFiles(prev => {
      console.log('Before set:', prev);
      const newFiles = { ...prev, [documentTypeId]: file };
      console.log('After set:', newFiles);
      return newFiles;
    });
    setFileErrors(prev => ({ ...prev, [documentTypeId]: [] }));
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
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Real-time validation
    validateField(name, value);
  };

  const validateField = (fieldName, value) => {
    const errors = { ...fieldErrors };
    
    switch (fieldName) {
      case 'cover_letter':
        if (!value || value.trim().length < 10) {
          errors.cover_letter = 'Cover letter must be at least 10 characters long';
        } else {
          delete errors.cover_letter;
        }
        break;
        
      case 'why_interested':
        if (!value || value.trim().length < 10) {
          errors.why_interested = 'Please explain why you are interested in this program (minimum 10 characters)';
        } else {
          delete errors.why_interested;
        }
        break;
        
      case 'skills_and_experience':
        if (!value || value.trim().length < 10) {
          errors.skills_and_experience = 'Please describe your skills and experience (minimum 10 characters)';
        } else {
          delete errors.skills_and_experience;
        }
        break;
        
      case 'availability_start_date':
        if (!value) {
          errors.availability_start_date = 'Please provide your availability start date';
        } else {
          const startDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (startDate < today) {
            errors.availability_start_date = 'Availability start date cannot be in the past';
          } else {
            delete errors.availability_start_date;
          }
        }
        break;
        
      default:
        break;
    }
    
    setFieldErrors(errors);
  };

  const validateForm = () => {
    const errors = {};
    
    // Validate required form fields
    if (!formData.cover_letter || formData.cover_letter.trim().length < 10) {
      errors.cover_letter = 'Cover letter must be at least 10 characters long';
    }
    
    if (!formData.why_interested || formData.why_interested.trim().length < 10) {
      errors.why_interested = 'Please explain why you are interested in this program (minimum 10 characters)';
    }
    
    if (!formData.skills_and_experience || formData.skills_and_experience.trim().length < 10) {
      errors.skills_and_experience = 'Please describe your skills and experience (minimum 10 characters)';
    }
    
    if (!formData.availability_start_date) {
      errors.availability_start_date = 'Please provide your availability start date';
    } else {
      const startDate = new Date(formData.availability_start_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (startDate < today) {
        errors.availability_start_date = 'Availability start date cannot be in the past';
      }
    }
    
    // Validate required documents
    const requiredDocTypes = documentTypes.filter(dt => dt.is_required);
    const missingDocuments = requiredDocTypes.filter(docType => !uploadedFiles[docType.id]);
    
    if (missingDocuments.length > 0) {
      errors.documents = `Please upload all required documents: ${missingDocuments.map(dt => dt.name).join(', ')}`;
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('=== HANDLE SUBMIT CALLED ===');
    console.log('Current uploadedFiles state:', uploadedFiles);
    console.log('Current formData state:', formData);
    console.log('Current user state:', user);
    
    // Comprehensive form validation
    const validation = validateForm();
    
    if (!validation.isValid) {
      // Show specific error messages
      Object.entries(validation.errors).forEach(([field, message]) => {
        toast.error(`❌ ${message}`, {
          position: 'top-center',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      });
      
      // Focus on the first invalid field
      const firstErrorField = Object.keys(validation.errors)[0];
      if (firstErrorField && firstErrorField !== 'documents') {
        const element = document.getElementById(firstErrorField);
        if (element) {
          element.focus();
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      
      return;
    }

    setIsSubmitting(true);

    try {
      // Show initial submission feedback
      toast.info('🚀 Starting application submission...', {
        position: 'top-center',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Final duplicate check right before submission
      console.log('Final duplicate check before submission...');
      if (existingApplication) {
        console.log('Existing application found in state, preventing submission');
        toast.error('🚫 Duplicate submission detected! You have already applied to this program.', {
          position: 'top-center',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setTimeout(() => {
          navigate('/my-applications');
        }, 2000);
        return;
      }
      
      // If we haven't checked duplicates yet, do it now
      if (!hasCheckedDuplicates) {
        console.log('Duplicate check not performed yet, checking now...');
        toast.info('🔍 Checking for existing applications...', {
          position: 'top-center',
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        const hasDuplicate = await checkExistingApplication();
        if (hasDuplicate) {
          return; // Stop submission if duplicate found
        }
      }

      // Show application creation feedback
      toast.info('📝 Creating application record...', {
        position: 'top-center',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Prepare application data with user information
      const applicationData = {
        ...formData,
        applicant: user?.id, // Add user ID
        status: 'pending', // Add status
      };

      console.log('Submitting application data:', applicationData);

      // Create application
      const applicationResponse = await applicationsAPI.createApplication(applicationData);
      const application = applicationResponse.data;
      console.log('Application created:', application);
      console.log('Application ID:', application.id);

      // Show success for application creation
      toast.success('✅ Application record created successfully!', {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Show document upload feedback
      const totalDocuments = Object.keys(uploadedFiles).length;
      console.log('=== REACHING DOCUMENT UPLOAD SECTION ===');
      console.log('Total documents to upload:', totalDocuments);
      console.log('uploadedFiles keys:', Object.keys(uploadedFiles));
      console.log('uploadedFiles contents:', uploadedFiles);
      console.log('Application ID for uploads:', application.id);
      
      toast.info(`📁 Uploading ${totalDocuments} document(s)...`, {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Upload documents with enhanced debugging and error handling
      console.log('=== STARTING DOCUMENT UPLOAD PROCESS ===');
      console.log('Uploaded files to process:', Object.keys(uploadedFiles));
      console.log('Uploaded files data:', uploadedFiles);
      
      const uploadPromises = Object.entries(uploadedFiles).map(async ([docTypeId, file]) => {
        if (!file) {
          console.log(`No file found for document type ${docTypeId}, skipping...`);
          return Promise.resolve();
        }
        
        console.log(`=== Starting upload for document type ${docTypeId} ===`);
        console.log('File details:', {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        });
        
        try {
          console.log(`Creating FormData for document type ${docTypeId}:`, file.name);
          
          // Declare timeout outside try block to fix scope issue
          let uploadTimeout;
          
          // Create FormData for document upload with enhanced metadata
          const documentFormData = new FormData();
          documentFormData.append('application_id', application.id);
          documentFormData.append('document_type', docTypeId);
          documentFormData.append('file', file);
          
          // Add comprehensive metadata for database storage
          documentFormData.append('original_filename', file.name);
          documentFormData.append('file_size', file.size);
          documentFormData.append('content_type', file.type);
          documentFormData.append('upload_date', new Date().toISOString());
          documentFormData.append('uploaded_by', user?.id);
          
          // Generate unique filename to prevent conflicts
          const fileExtension = file.name.split('.').pop();
          const timestamp = Date.now();
          const uniqueFilename = `${application.id}_${docTypeId}_${timestamp}.${fileExtension}`;
          documentFormData.append('stored_filename', uniqueFilename);
          
          // Add file path information for storage in documents_document table
          const filePath = `documents/${uniqueFilename}`;
          documentFormData.append('file_path', filePath);
          
          console.log('FormData contents:');
          for (let [key, value] of documentFormData.entries()) {
            console.log(`  ${key}:`, value instanceof File ? `File(${value.name}, ${value.size} bytes)` : value);
          }
          
          console.log('Document metadata:', {
            original_filename: file.name,
            stored_filename: uniqueFilename,
            file_path: filePath,
            file_size: file.size,
            content_type: file.type,
            application_id: application.id,
            document_type_id: docTypeId
          });
          
          // Simulate progress tracking (since we can't track actual progress with axios easily)
          setUploadProgress(prev => ({ ...prev, [docTypeId]: 0 }));
          console.log(`Progress tracking started for ${docTypeId}: 0%`);
          
          // Upload with progress simulation
          const progressInterval = setInterval(() => {
            setUploadProgress(prev => {
              const currentProgress = prev[docTypeId] || 0;
              if (currentProgress < 95) {
                const newProgress = currentProgress + 5;
                console.log(`Progress update for ${docTypeId}: ${newProgress}%`);
                return { ...prev, [docTypeId]: newProgress };
              }
              return prev;
            });
          }, 150);
          
          // Add timeout to prevent infinite hanging
          uploadTimeout = setTimeout(() => {
            console.error(`Upload timeout for ${docTypeId} - taking too long`);
            clearInterval(progressInterval);
            setUploadProgress(prev => {
              const newProgress = { ...prev };
              delete newProgress[docTypeId];
              return newProgress;
            });
            toast.error(`Upload timeout for ${file.name}. Please try again.`, {
              position: 'top-center',
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
          }, 30000); // 30 second timeout
          
          console.log(`Starting API call to upload document...`);
          console.log('API endpoint: POST /documents/');
          console.log('FormData being sent:');
          
          // Log FormData contents in detail
          for (let [key, value] of documentFormData.entries()) {
            if (value instanceof File) {
              console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
            } else {
              console.log(`  ${key}: ${value}`);
            }
          }
          
          try {
            const response = await documentsAPI.uploadDocument(documentFormData);
            console.log(`API call completed successfully:`, response);
            console.log(`Response status:`, response.status);
            console.log(`Response data:`, response.data);
            console.log(`Response headers:`, response.headers);
          } catch (apiError) {
            console.error('=== API CALL FAILED ===');
            console.error('API Error:', apiError);
            console.error('Error message:', apiError.message);
            console.error('Error code:', apiError.code);
            
            if (apiError.response) {
              console.error('Response status:', apiError.response.status);
              console.error('Response data:', apiError.response.data);
              console.error('Response headers:', apiError.response.headers);
              
              // Try to parse specific error fields
              const errorData = apiError.response.data;
              if (typeof errorData === 'object') {
                Object.keys(errorData).forEach(key => {
                  console.error(`Error field ${key}:`, errorData[key]);
                });
              }
            } else if (apiError.request) {
              console.error('No response received. Request:', apiError.request);
            } else {
              console.error('Request setup error:', apiError.message);
            }
            
            throw apiError;
          }
          
          // Clear both timeout and progress interval on success
          clearTimeout(uploadTimeout);
          clearInterval(progressInterval);
          setUploadProgress(prev => ({ ...prev, [docTypeId]: 100 }));
          console.log(`Progress set to 100% for ${docTypeId}`);
          
          // Add a small delay to show 100% before clearing
          setTimeout(() => {
            setUploadProgress(prev => {
              const newProgress = { ...prev };
              delete newProgress[docTypeId];
              console.log(`Progress cleared for ${docTypeId}`);
              return newProgress;
            });
          }, 1000);
          
          console.log(`Document uploaded successfully:`, response.data);
          console.log(`Document saved at: ${filePath}`);
          toast.success(`${file.name} uploaded and saved to ${filePath}!`, {
            position: 'top-center',
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          
          // Store the uploaded document information with database details
          const uploadedDoc = {
            id: response.data.id,
            document_type: parseInt(docTypeId),
            original_filename: file.name,
            stored_filename: uniqueFilename,
            file_path: filePath,
            file_size: file.size,
            content_type: file.type,
            upload_date: new Date().toISOString(),
            uploaded_by: user?.id,
            application_id: application.id,
            document_type_name: docTypeName
          };
          
          setUploadedDocuments(prev => [...prev, uploadedDoc]);
          
          return response;
        } catch (uploadError) {
          console.error(`=== UPLOAD ERROR FOR DOCUMENT TYPE ${docTypeId} ===`);
          console.error('Error details:', uploadError);
          console.error('Error message:', uploadError.message);
          console.error('Error stack:', uploadError.stack);
          
          if (uploadError.response) {
            console.error('Error response status:', uploadError.response.status);
            console.error('Error response data:', uploadError.response.data);
            console.error('Error response headers:', uploadError.response.headers);
          } else if (uploadError.request) {
            console.error('Error request (no response):', uploadError.request);
          } else {
            console.error('Error setup:', uploadError.message);
          }
          
          // Clear both timeout and progress interval on error
          clearTimeout(uploadTimeout);
          clearInterval(progressInterval);
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[docTypeId];
            console.log(`Progress cleared due to error for ${docTypeId}`);
            return newProgress;
          });
          
          const errorMessage = uploadError.response?.data?.detail || 
                              uploadError.response?.data?.message || 
                              uploadError.message || 
                              'Unknown upload error';
          
          toast.error(`Failed to upload ${file.name}: ${errorMessage}`, {
            position: 'top-center',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          
          throw uploadError;
        }
      });

      // Wait for all uploads to complete
      console.log('=== WAITING FOR ALL UPLOADS TO COMPLETE ===');
      const uploadResults = await Promise.all(uploadPromises);
      console.log('=== ALL UPLOADS COMPLETED ===');
      console.log('Upload results:', uploadResults);
      
      // Clear upload progress after successful uploads
      setUploadProgress({});
      
      console.log('All documents uploaded:', uploadResults);
      console.log('Documents saved in database:', uploadedDocuments);
      console.log('Final uploadedDocuments state:', uploadedDocuments);

      // Enhanced success message with document count and admin visibility
      const documentCount = uploadedDocuments.length;
      toast.success(`🎉 Application submitted successfully! ${documentCount} document(s) saved and visible in Admin Dashboard.`, {
        position: 'top-center',
        autoClose: 6000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      navigate('/my-applications');
    } catch (error) {
      console.error('Application submission error:', error);
      
      // Log detailed error information
      if (error.response) {
        console.error('Error response data:', JSON.stringify(error.response.data, null, 2));
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
        
        // Show specific error message from backend if available
        let errorMessage = 'Failed to submit application';
        
        if (error.response.data) {
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else if (error.response.data.detail) {
            errorMessage = error.response.data.detail;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (error.response.data.error) {
            errorMessage = error.response.data.error;
          } else if (error.response.data.program && error.response.data.program.includes('already applied')) {
            // Handle duplicate application specifically
            toast.error('🚫 Duplicate submission detected! You have already applied to this program.', {
              position: 'top-center',
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
            // Redirect to applications page after a short delay
            setTimeout(() => {
              navigate('/my-applications');
            }, 3000);
          } else if (error.response.data.non_field_errors && error.response.data.non_field_errors.some(err => err.includes('already applied'))) {
            // Handle duplicate application in non_field_errors
            toast.error('🚫 Duplicate submission detected! You have already applied to this program.', {
              position: 'top-center',
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
            setTimeout(() => {
              navigate('/my-applications');
            }, 3000);
          } else {
            // Try to extract any field-specific errors
            const fieldErrors = Object.keys(error.response.data)
              .filter(key => key !== 'detail' && key !== 'message' && key !== 'error')
              .map(key => `${key}: ${Array.isArray(error.response.data[key]) ? error.response.data[key].join(', ') : error.response.data[key]}`)
              .join('; ');
            if (fieldErrors) {
              toast.error(`⚠️ Validation Error: ${fieldErrors}`, {
                position: 'top-center',
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              });
            } else {
              toast.error('❌ Failed to submit application. Please check all fields and try again.', {
                position: 'top-center',
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              });
            }
          }
        }
        
        toast.error(errorMessage);
      } else if (error.request) {
        console.error('No response received:', error.request);
        toast.error('No response from server. Please check your connection.', {
          position: 'top-center',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        console.error('Error setting up request:', error.message);
        toast.error('Failed to submit application. Please try again.', {
          position: 'top-center',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
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

  if (!program) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Program Not Found</h2>
          <p className="text-gray-600 mb-4">The program you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/programs')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 px-6 py-8">
            <h1 className="text-3xl font-bold text-white">Apply for {program.name}</h1>
            <p className="text-blue-100 mt-2">{program.description}</p>
            <div className="mt-4 flex items-center text-sm text-blue-100">
              <span className="font-medium">Duration:</span>
              <span className="ml-2">{program.duration_months} months</span>
              <span className="mx-3">•</span>
              <span className="font-medium">Deadline:</span>
              <span className="ml-2">{new Date(program.application_deadline).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Form */}
          <div className="px-6 py-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={user?.first_name || ''}
                      readOnly
                    />
                  </div>
                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={user?.last_name || ''}
                      readOnly
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={user?.email || ''}
                      readOnly
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={user?.phone || ''}
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Application Details */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Application Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label htmlFor="cover_letter" className="block text-sm font-medium text-gray-700">
                      Cover Letter *
                    </label>
                    <textarea
                      id="cover_letter"
                      name="cover_letter"
                      rows={4}
                      required
                      className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        fieldErrors.cover_letter 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300'
                      }`}
                      placeholder="Write your cover letter explaining why you're interested in this program..."
                      value={formData.cover_letter}
                      onChange={handleInputChange}
                    />
                    {fieldErrors.cover_letter && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {fieldErrors.cover_letter}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="why_interested" className="block text-sm font-medium text-gray-700">
                      Why are you interested in this program? *
                    </label>
                    <textarea
                      id="why_interested"
                      name="why_interested"
                      rows={4}
                      required
                      className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        fieldErrors.why_interested 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300'
                      }`}
                      placeholder="Explain your motivation for applying to this specific program..."
                      value={formData.why_interested}
                      onChange={handleInputChange}
                    />
                    {fieldErrors.why_interested && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {fieldErrors.why_interested}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="skills_and_experience" className="block text-sm font-medium text-gray-700">
                      Skills and Experience *
                    </label>
                    <textarea
                      id="skills_and_experience"
                      name="skills_and_experience"
                      rows={4}
                      required
                      className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        fieldErrors.skills_and_experience 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300'
                      }`}
                      placeholder="Describe your relevant skills, experience, and qualifications..."
                      value={formData.skills_and_experience}
                      onChange={handleInputChange}
                    />
                    {fieldErrors.skills_and_experience && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {fieldErrors.skills_and_experience}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="availability_start_date" className="block text-sm font-medium text-gray-700">
                      Availability Start Date *
                    </label>
                    <input
                      type="date"
                      id="availability_start_date"
                      name="availability_start_date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        fieldErrors.availability_start_date 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300'
                      }`}
                      value={formData.availability_start_date}
                      onChange={handleInputChange}
                    />
                    {fieldErrors.availability_start_date && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {fieldErrors.availability_start_date}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Document Upload */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Required Documents
                  <span className="text-sm text-gray-500 ml-2">
                    (Supported formats: PDF, DOC, DOCX, JPG, JPEG, PNG)
                  </span>
                </h3>
                
                {/* Single Upload Button */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">Upload Document</h4>
                      <p className="text-xs text-blue-700 mt-1">Upload your application document using the button below</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        console.log('Browse Files button clicked');
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = getAllowedExtensions();
                        input.multiple = false; // Only allow single file selection
                        input.onchange = (e) => {
                          console.log('File selected:', e.target.files);
                          if (e.target.files.length > 0) {
                            const file = e.target.files[0];
                            const docType = documentTypes[0]; // Use first (and only) document type
                            if (docType) {
                              console.log(`Assigning file to document type ${docType.id}: ${file.name}`);
                              handleFileChange(docType.id, file);
                            }
                          }
                        };
                        input.click();
                      }}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Browse Files
                    </button>
                  </div>
                  
                  {/* Uploaded Documents Summary */}
                  {Object.keys(uploadedFiles).length > 0 && (
                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <h5 className="text-xs font-medium text-blue-900 mb-2">Uploaded Documents ({Object.keys(uploadedFiles).length})</h5>
                      <div className="space-y-2">
                        {Object.entries(uploadedFiles).map(([docTypeId, file]) => {
                          if (!file) return null;
                          
                          const docType = documentTypes.find(dt => dt.id === parseInt(docTypeId));
                          const fallbackNames = {
                            '1': 'Application Document'
                          };
                          const docTypeName = docType?.name || fallbackNames[docTypeId] || `Document ${docTypeId}`;
                          
                          return (
                            <div key={docTypeId} className="flex items-center justify-between bg-white p-2 rounded border border-blue-100">
                              <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                  <span className="text-xs font-medium text-gray-900">{docTypeName}</span>
                                  <p className="text-xs text-gray-500">{file.name} ({formatFileSize(file.size)})</p>
                                  
                                  {/* Upload Progress */}
                                  {uploadProgress[docTypeId] !== undefined && uploadProgress[docTypeId] < 100 && (
                                    <div className="mt-1">
                                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                        <span>Uploading...</span>
                                        <span>{uploadProgress[docTypeId]}%</span>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-1">
                                        <div
                                          className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                                          style={{ width: `${uploadProgress[docTypeId]}%` }}
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFile(parseInt(docTypeId))}
                                className="text-xs text-red-600 hover:text-red-800 font-medium"
                              >
                                Remove
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Document Requirements List */}
                <div className="space-y-3">
                  {(documentTypes.length > 0 ? documentTypes : [
                    { id: 1, name: 'Application Document', description: 'Your application document (resume, CV, or portfolio)', is_required: true }
                  ]).map((docType) => (
                    <div key={docType.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full ${uploadedFiles[docType.id] ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <div>
                            <span className="text-sm font-medium text-gray-900">
                              {docType.name} {docType.is_required && <span className="text-red-500">*</span>}
                            </span>
                            <p className="text-xs text-gray-600">{docType.description}</p>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {uploadedFiles[docType.id] ? (
                            <span className="text-green-600 font-medium">Uploaded</span>
                          ) : (
                            <span>Not uploaded</span>
                          )}
                        </div>
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
                  className="px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Submitting Application...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <span>Submit Application</span>
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;
