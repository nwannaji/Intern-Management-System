import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import { leaveAPI } from '../services/api';
import { formatDate } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

const STATUS_FILTERS = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'supervisor_approved', label: 'Supervisor Approved' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

const STATUS_LABELS = {
  pending: 'Pending',
  supervisor_approved: 'Supervisor Approved',
  approved: 'Approved',
  rejected: 'Rejected',
};

/** Helper to safely extract an array from an API response. */
const extractList = (res) => Array.isArray(res.data) ? res.data : res.data?.results || [];

const Leave = () => {
  const { user } = useAuth();
  const isSupervisor = user?.role === 'supervisor';
  const isAdmin = user?.role === 'admin';
  const canManageLeave = isSupervisor || isAdmin;

  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [formData, setFormData] = useState({ leave_type: '', start_date: '', end_date: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);

  // Action modal state
  const [actionModal, setActionModal] = useState({ open: false, requestId: null, action: '' });
  const [actionNotes, setActionNotes] = useState('');

  // Comment modal state
  const [commentModal, setCommentModal] = useState({ open: false, requestId: null });
  const [commentText, setCommentText] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [requestsRes, typesRes, balanceRes] = await Promise.all([
        canManageLeave ? leaveAPI.getLeaveRequests() : leaveAPI.getMyLeaveRequests(),
        leaveAPI.getLeaveTypes(),
        leaveAPI.getLeaveBalance(),
      ]);
      setLeaveRequests(extractList(requestsRes));
      setLeaveTypes(extractList(typesRes));
      setBalances(Array.isArray(balanceRes.data) ? balanceRes.data : []);
    } catch (error) {
      toast.error('Failed to load leave data');
    } finally {
      setLoading(false);
    }
  }, [canManageLeave]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.leave_type || !formData.start_date || !formData.end_date || !formData.reason.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setSubmitting(true);
    try {
      await leaveAPI.createLeaveRequest(formData);
      toast.success('Leave request submitted!');
      setShowForm(false);
      setFormData({ leave_type: '', start_date: '', end_date: '', reason: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleActionConfirm = async () => {
    const { requestId, action } = actionModal;
    try {
      if (action === 'supervisor_approve') {
        await leaveAPI.supervisorApproveLeave(requestId, { supervisor_notes: actionNotes });
        toast.success('Leave request approved by supervisor — forwarded to admin');
      } else if (action === 'supervisor_reject') {
        await leaveAPI.supervisorRejectLeave(requestId, { supervisor_notes: actionNotes });
        toast.success('Leave request rejected');
      } else if (action === 'admin_approve') {
        await leaveAPI.approveLeave(requestId, { admin_notes: actionNotes });
        toast.success('Leave request finally approved');
      } else if (action === 'admin_reject') {
        await leaveAPI.rejectLeave(requestId, { admin_notes: actionNotes });
        toast.success('Leave request rejected');
      }
      setActionModal({ open: false, requestId: null, action: '' });
      setActionNotes('');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Action failed');
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }
    try {
      await leaveAPI.supervisorCommentLeave(commentModal.requestId, { comment: commentText });
      toast.success('Comment added');
      setCommentModal({ open: false, requestId: null });
      setCommentText('');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add comment');
    }
  };

  const filteredRequests = statusFilter
    ? leaveRequests.filter(lr => lr.status === statusFilter)
    : leaveRequests;

  if (loading) return <Layout><LoadingSpinner /></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Leave Management</h2>
          {!canManageLeave && (
            <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm">
              {showForm ? 'Cancel' : 'Request Leave'}
            </button>
          )}
        </div>

        {/* Leave Balance */}
        {balances.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Leave Balance</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {balances.map((b) => (
                <div key={b.leave_type_name} className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">{b.leave_type_name}</p>
                  <p className="text-2xl font-bold text-gray-900">{b.remaining_days}</p>
                  <p className="text-xs text-gray-400">of {b.max_days} days remaining</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Request Form */}
        {showForm && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">New Leave Request</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                <select value={formData.leave_type} onChange={(e) => setFormData({...formData, leave_type: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Select type</option>
                  {leaveTypes.map((lt) => <option key={lt.id} value={lt.id}>{lt.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input type="date" value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input type="date" value={formData.end_date} onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <button type="submit" disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium">
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </div>
        )}

        {/* Status Filter */}
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((sf) => (
            <button key={sf.key} onClick={() => setStatusFilter(sf.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${statusFilter === sf.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {sf.label}
            </button>
          ))}
        </div>

        {/* Leave Requests List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Leave Requests ({filteredRequests.length})</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredRequests.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No leave requests found</div>
            ) : (
              filteredRequests.map((lr) => (
                <div key={lr.id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-medium text-gray-900">{lr.leave_type_name || lr.leave_type}</span>
                        <StatusBadge status={lr.status} />
                      </div>
                      <p className="text-sm text-gray-500">
                        {formatDate(lr.start_date)} — {formatDate(lr.end_date)} ({lr.days_count} day{lr.days_count !== 1 ? 's' : ''})
                      </p>
                      {lr.applicant_name && <p className="text-xs text-gray-400">By: {lr.applicant_name}</p>}
                      {lr.reason && <p className="text-sm text-gray-600 mt-1">{lr.reason}</p>}

                      {/* Supervisor review info */}
                      {lr.supervisor_reviewed_by_name && (
                        <p className="text-xs text-blue-600 mt-1">
                          Supervisor: {lr.supervisor_reviewed_by_name}
                          {lr.supervisor_notes && <span> — &ldquo;{lr.supervisor_notes}&rdquo;</span>}
                        </p>
                      )}
                      {/* Admin review info */}
                      {lr.reviewed_by_name && (
                        <p className="text-xs text-green-700 mt-1">
                          Admin: {lr.reviewed_by_name}
                          {lr.admin_notes && <span> — &ldquo;{lr.admin_notes}&rdquo;</span>}
                        </p>
                      )}

                      {/* Status history */}
                      {lr.status_history && lr.status_history.length > 0 && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">View History</summary>
                          <div className="mt-1 space-y-1">
                            {lr.status_history.map((sh) => (
                              <p key={sh.id} className="text-xs text-gray-500">
                                {formatDate(sh.changed_at)} — <strong>{sh.changed_by_name || 'System'}</strong>: {STATUS_LABELS[sh.status] || sh.status}
                                {sh.notes && <span> ({sh.notes})</span>}
                              </p>
                            ))}
                          </div>
                        </details>
                      )}
                    </div>

                    {/* Action buttons — role and status dependent */}
                    <div className="flex flex-col gap-2 shrink-0">
                      {/* Supervisor actions on pending requests */}
                      {isSupervisor && lr.status === 'pending' && (
                        <>
                          <button onClick={() => setActionModal({ open: true, requestId: lr.id, action: 'supervisor_approve' })}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 whitespace-nowrap">
                            Approve
                          </button>
                          <button onClick={() => setActionModal({ open: true, requestId: lr.id, action: 'supervisor_reject' })}
                            className="px-3 py-1.5 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200 whitespace-nowrap">
                            Reject
                          </button>
                          <button onClick={() => setCommentModal({ open: true, requestId: lr.id })}
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200 whitespace-nowrap">
                            Comment
                          </button>
                        </>
                      )}

                      {/* Admin actions on supervisor_approved requests */}
                      {isAdmin && lr.status === 'supervisor_approved' && (
                        <>
                          <button onClick={() => setActionModal({ open: true, requestId: lr.id, action: 'admin_approve' })}
                            className="px-3 py-1.5 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 whitespace-nowrap">
                            Final Approve
                          </button>
                          <button onClick={() => setActionModal({ open: true, requestId: lr.id, action: 'admin_reject' })}
                            className="px-3 py-1.5 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200 whitespace-nowrap">
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Action Confirmation Modal */}
      {actionModal.open && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {actionModal.action === 'supervisor_approve' && 'Approve Leave Request'}
              {actionModal.action === 'supervisor_reject' && 'Reject Leave Request'}
              {actionModal.action === 'admin_approve' && 'Final Approve Leave Request'}
              {actionModal.action === 'admin_reject' && 'Reject Leave Request'}
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Add any notes about this decision..."
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setActionModal({ open: false, requestId: null, action: '' }); setActionNotes(''); }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">
                Cancel
              </button>
              <button onClick={handleActionConfirm}
                className={`px-4 py-2 rounded-lg text-white text-sm font-medium ${
                  actionModal.action.includes('reject') ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {commentModal.open && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Comment</h3>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Add a comment on this leave request..."
            />
            <div className="flex gap-3 justify-end mt-4">
              <button onClick={() => { setCommentModal({ open: false, requestId: null }); setCommentText(''); }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">
                Cancel
              </button>
              <button onClick={handleCommentSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                Submit Comment
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Leave;