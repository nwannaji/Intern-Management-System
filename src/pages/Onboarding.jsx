import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import { onboardingAPI } from '../services/api';

const Onboarding = () => {
  const { applicationId } = useParams();
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProgress = async () => {
    try {
      const response = await onboardingAPI.getProgress(applicationId);
      setProgress(Array.isArray(response.data) ? response.data : response.data?.results || []);
    } catch (error) {
      toast.error('Failed to load onboarding progress');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProgress(); }, [applicationId]);

  const handleMarkComplete = async (progressId) => {
    try {
      await onboardingAPI.markComplete(progressId);
      toast.success('Task marked as complete!');
      fetchProgress();
    } catch (error) {
      toast.error('Failed to mark task as complete');
    }
  };

  if (loading) return <Layout><LoadingSpinner /></Layout>;

  const completedCount = progress.filter(p => p.status === 'completed').length;
  const totalCount = progress.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Onboarding Checklist</h2>

        {/* Progress Bar */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-medium text-gray-700">{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-blue-600 h-3 rounded-full transition-all" style={{ width: `${progressPercent}%` }}></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">{completedCount} of {totalCount} tasks completed</p>
        </div>

        {/* Checklist */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="divide-y divide-gray-200">
            {progress.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No onboarding tasks found</div>
            ) : (
              progress.map((item) => (
                <div key={item.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => item.status !== 'completed' && handleMarkComplete(item.id)}
                      className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                        item.status === 'completed' ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-blue-500'
                      }`}
                    >
                      {item.status === 'completed' && (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <div>
                      <p className={`font-medium ${item.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                        {item.task_title}
                      </p>
                      {item.task_description && <p className="text-sm text-gray-500">{item.task_description}</p>}
                      {item.task_is_required && <span className="text-xs text-red-500">Required</span>}
                    </div>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Onboarding;