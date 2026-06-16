import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import { reviewsAPI } from '../services/api';
import { formatDate } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

const Reviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const isSupervisorOrAdmin = user?.role === 'admin' || user?.role === 'supervisor';

  const fetchReviews = async () => {
    try {
      const response = await reviewsAPI.getReviews();
      setReviews(Array.isArray(response.data) ? response.data : response.data?.results || []);
    } catch (error) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleSubmitReview = async (id) => {
    try {
      await reviewsAPI.submitReview(id);
      toast.success('Review submitted');
      fetchReviews();
    } catch (error) {
      toast.error('Failed to submit review');
    }
  };

  const handleAcknowledge = async (id) => {
    try {
      await reviewsAPI.acknowledgeReview(id);
      toast.success('Review acknowledged');
      fetchReviews();
    } catch (error) {
      toast.error('Failed to acknowledge review');
    }
  };

  if (loading) return <Layout><LoadingSpinner /></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Performance Reviews</h2>

        {/* Reviews List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="font-medium text-gray-900">Reviews ({reviews.length})</h3>
            </div>
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {reviews.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No reviews found</div>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} onClick={() => setSelectedReview(review)}
                    className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition ${selectedReview?.id === review.id ? 'bg-blue-50' : ''}`}>
                    <p className="font-medium text-gray-900 text-sm">
                      {review.intern_name || `Review #${review.id}`}
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(review.period_start)} — {formatDate(review.period_end)}</p>
                    <div className="mt-1"><StatusBadge status={review.status} /></div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Review Detail */}
          <div className="lg:col-span-2 bg-white shadow rounded-lg p-6">
            {selectedReview ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">
                    Review for {selectedReview.intern_name}
                  </h3>
                  <StatusBadge status={selectedReview.status} />
                </div>
                <p className="text-sm text-gray-500">
                  Period: {formatDate(selectedReview.period_start)} — {formatDate(selectedReview.period_end)}
                </p>
                {selectedReview.reviewer_name && (
                  <p className="text-sm text-gray-500">Reviewer: {selectedReview.reviewer_name}</p>
                )}

                {/* Rating Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Overall', value: selectedReview.overall_rating },
                    { label: 'Technical Skills', value: selectedReview.technical_skills },
                    { label: 'Communication', value: selectedReview.communication },
                    { label: 'Teamwork', value: selectedReview.teamwork },
                    { label: 'Initiative', value: selectedReview.initiative },
                    { label: 'Punctuality', value: selectedReview.punctuality },
                  ].map((item) => (
                    <div key={item.label} className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500">{item.label}</p>
                      <div className="flex justify-center mt-1">
                        {[1,2,3,4,5].map((star) => (
                          <span key={star} className={`text-lg ${star <= item.value ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {selectedReview.strengths && (
                  <div><h4 className="font-medium text-gray-900">Strengths</h4><p className="text-gray-600 text-sm mt-1">{selectedReview.strengths}</p></div>
                )}
                {selectedReview.areas_for_improvement && (
                  <div><h4 className="font-medium text-gray-900">Areas for Improvement</h4><p className="text-gray-600 text-sm mt-1">{selectedReview.areas_for_improvement}</p></div>
                )}
                {selectedReview.goals && (
                  <div><h4 className="font-medium text-gray-900">Goals</h4><p className="text-gray-600 text-sm mt-1">{selectedReview.goals}</p></div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  {isSupervisorOrAdmin && selectedReview.status === 'draft' && (
                    <button onClick={() => handleSubmitReview(selectedReview.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Submit Review</button>
                  )}
                  {!isSupervisorOrAdmin && selectedReview.status === 'submitted' && (
                    <button onClick={() => handleAcknowledgeReview(selectedReview.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">Acknowledge Review</button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-12">Select a review to view details</div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Reviews;