import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { programsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, isAdmin, user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    program_type: 'IT',
    description: '',
    duration_months: '',
    start_date: '',
    end_date: '',
    application_deadline: '',
    is_active: true
  });

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      console.log('Fetching programs...');
      const response = await programsAPI.getPrograms();
      console.log('Programs API response:', response);
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      
      // Handle different response formats
      let programsData = response.data;
      if (response.data && response.data.results) {
        programsData = response.data.results;
      } else if (response.data && response.data.data) {
        programsData = response.data.data;
      }
      
      console.log('Final programs data:', programsData);
      
      // Ensure it's an array
      if (Array.isArray(programsData)) {
        setPrograms(programsData);
        console.log('Programs set successfully:', programsData.length);
      } else {
        console.error('Expected array but got:', typeof programsData, programsData);
        setPrograms([]);
      }
    } catch (error) {
      console.error('Full error object:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      toast.error('Failed to fetch programs');
      setPrograms([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting program data:', formData);
      console.log('Edit mode:', showEditForm, 'Editing program:', editingProgram);
      
      let response;
      if (showEditForm && editingProgram) {
        // Update existing program
        console.log(`Updating program ${editingProgram.id}...`);
        response = await programsAPI.updateProgram(editingProgram.id, formData);
        console.log('Update response:', response);
        toast.success('Program updated successfully!');
        setShowEditForm(false);
        setEditingProgram(null);
      } else {
        // Create new program
        console.log('Creating new program...');
        response = await programsAPI.createProgram(formData);
        console.log('Create response:', response);
        toast.success('Program created successfully!');
        setShowAddForm(false);
      }
      
      // Reset form and refresh programs
      setFormData({
        name: '',
        program_type: 'IT',
        description: '',
        duration_months: '',
        start_date: '',
        end_date: '',
        application_deadline: '',
        is_active: true
      });
      fetchPrograms();
    } catch (error) {
      console.error('Error saving program:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      if (error.response?.status === 403) {
        toast.error('Permission denied. Only admins can manage programs.');
      } else if (error.response?.status === 405) {
        toast.error('Method not allowed. The server may need to be restarted.');
      } else {
        toast.error(showEditForm ? 'Failed to update program' : 'Failed to create program');
      }
    }
  };

  const handleEdit = (program) => {
    setEditingProgram(program);
    setFormData({
      name: program.name,
      program_type: program.program_type,
      description: program.description,
      duration_months: program.duration_months,
      start_date: program.start_date,
      end_date: program.end_date,
      application_deadline: program.application_deadline,
      is_active: program.is_active
    });
    setShowEditForm(true);
  };

  const handleDelete = async (programId) => {
    if (window.confirm('Are you sure you want to delete this program?')) {
      try {
        await programsAPI.deleteProgram(programId);
        toast.success('Program deleted successfully!');
        fetchPrograms();
      } catch (error) {
        console.error('Error deleting program:', error);
        toast.error('Failed to delete program');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      program_type: 'IT',
      description: '',
      duration_months: '',
      start_date: '',
      end_date: '',
      application_deadline: '',
      is_active: true
    });
    setShowAddForm(false);
    setShowEditForm(false);
    setEditingProgram(null);
  };

  const getProgramTypeColor = (type) => {
    return type === 'IT' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isProgramExpired = (program) => {
    const deadline = new Date(program.application_deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
    return deadline < today;
  };

  const handleApplyClick = (program) => {
    if (isProgramExpired(program)) {
      toast.error(`This program expired on ${formatDate(program.application_deadline)}. Applications are no longer accepted.`);
      return;
    }
    // Navigate to application form if not expired
    window.location.href = `/apply/${program.id}`;
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
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Available Programs
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Explore our internship and NYSC programs
          </p>
          
          {/* Admin Controls */}
          {isAdmin && (
            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Add New Program
              </button>
            </div>
          )}
        </div>

        {/* Add/Edit Program Form */}
        {(showAddForm || showEditForm) && (
          <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {showEditForm ? 'Edit Program' : 'Add New Program'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Program Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Program Type
                  </label>
                  <select
                    name="program_type"
                    value={formData.program_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="IT">Industrial Training</option>
                    <option value="NYSC">NYSC</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (months)
                  </label>
                  <input
                    type="number"
                    name="duration_months"
                    value={formData.duration_months}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    name="application_deadline"
                    value={formData.application_deadline}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                  Active Program
                </label>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200"
                >
                  {showEditForm ? 'Update Program' : 'Create Program'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-md font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {programs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              No programs are currently available.
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            {programs.map((program) => (
              <div
                key={program.id}
                className="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {program.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getProgramTypeColor(
                          program.program_type
                        )}`}
                      >
                        {program.program_type === 'IT' ? 'Industrial Training' : 'NYSC'}
                      </span>
                      {!program.is_active && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                          Inactive
                        </span>
                      )}
                      {isProgramExpired(program) && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                          Expired
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-600 mb-6 line-clamp-3">
                    {program.description}
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-gray-500">
                      <svg
                        className="h-5 w-5 mr-2 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      Duration: {program.duration_months} {program.duration_months === 1 ? 'month' : 'months'}
                    </div>

                    <div className="flex items-center text-sm text-gray-500">
                      <svg
                        className="h-5 w-5 mr-2 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      Start: {formatDate(program.start_date)}
                    </div>

                    <div className="flex items-center text-sm text-gray-500">
                      <svg
                        className="h-5 w-5 mr-2 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      End: {formatDate(program.end_date)}
                    </div>

                    <div className="flex items-center text-sm text-red-600 font-medium">
                      <svg
                        className="h-5 w-5 mr-2 text-red-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Application Deadline: {formatDate(program.application_deadline)}
                      {isProgramExpired(program) && (
                        <span className="ml-2 text-xs">(Expired)</span>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    {isProgramExpired(program) ? (
                      <button
                        onClick={() => handleApplyClick(program)}
                        className="flex-1 bg-gray-400 text-white text-center py-2 px-4 rounded-md cursor-not-allowed opacity-75"
                        disabled
                      >
                        Applications Closed
                      </button>
                    ) : isAuthenticated ? (
                      <Link
                        to={`/apply/${program.id}`}
                        className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200"
                      >
                        Apply Now
                      </Link>
                    ) : (
                      <>
                        <Link
                          to="/auth"
                          className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200"
                        >
                          Login to Apply
                        </Link>
                        <Link
                          to="/register"
                          className="flex-1 border border-blue-600 text-blue-600 text-center py-2 px-4 rounded-md hover:bg-blue-50 transition-colors duration-200"
                        >
                          Register
                        </Link>
                      </>
                    )}
                    
                    {/* Admin Controls */}
                    {isAdmin && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(program)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-1"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(program.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Programs;
