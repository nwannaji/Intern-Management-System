import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { programsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();

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
        </div>

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
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getProgramTypeColor(
                        program.program_type
                      )}`}
                    >
                      {program.program_type === 'IT' ? 'Industrial Training' : 'NYSC'}
                    </span>
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
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    {isAuthenticated ? (
                      <Link
                        to={`/apply/${program.id}`}
                        className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200"
                      >
                        Apply Now
                      </Link>
                    ) : (
                      <>
                        <Link
                          to="/login"
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
