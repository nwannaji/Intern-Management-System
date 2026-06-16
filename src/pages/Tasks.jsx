import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { tasksAPI, accountsAPI, programsAPI } from '../services/api';
import { formatDate } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

/** Helper to safely extract an array from an API response. */
const extractList = (res) => Array.isArray(res.data) ? res.data : res.data?.results || [];

/** Format an intern's display name for the dropdown. */
const formatInternName = (intern) => {
  if (intern.first_name || intern.last_name) {
    return `${intern.first_name || ''} ${intern.last_name || ''}`.trim();
  }
  return intern.name || intern.email || intern.username || `User #${intern.id}`;
};

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [interns, setInterns] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [internsLoading, setInternsLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const canAssign = user?.role === 'admin' || user?.role === 'supervisor';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigned_to: '',
    program: '',
    due_date: '',
    priority: 'medium',
  });

  const fetchTasks = useCallback(async () => {
    try {
      const response = await tasksAPI.getTasks();
      setTasks(extractList(response));
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAssignOptions = useCallback(async () => {
    if (!user?.role) return;
    setInternsLoading(true);
    try {
      if (user.role === 'admin') {
        const usersRes = await accountsAPI.listUsers();
        const allUsers = extractList(usersRes);
        setInterns(allUsers.filter(u => u.role === 'intern' && u.is_active));
      } else if (user.role === 'supervisor') {
        // Backend returns UserListSerializer data (id, first_name, last_name, email, etc.)
        const res = await accountsAPI.getMySupervisorInterns();
        setInterns(extractList(res));
      }
    } catch (error) {
      console.error('Failed to load interns:', error);
      toast.error('Could not load interns for assignment');
    } finally {
      setInternsLoading(false);
    }
    try {
      const progRes = await programsAPI.getPrograms();
      setPrograms(extractList(progRes));
    } catch (error) {
      console.error('Failed to load programs:', error);
    }
  }, [user?.role]);

  useEffect(() => {
    fetchTasks();
    if (canAssign) fetchAssignOptions();
  }, [canAssign, fetchTasks, fetchAssignOptions]);

  const resetForm = () => {
    setFormData({ title: '', description: '', assigned_to: '', program: '', due_date: '', priority: 'medium' });
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.assigned_to) {
      toast.error('Please fill in the task title and assign it to someone');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        assigned_to: formData.assigned_to,
        priority: formData.priority,
        status: 'todo',
      };
      if (formData.program) payload.program = formData.program;
      if (formData.due_date) payload.due_date = formData.due_date;

      await tasksAPI.createTask(payload);
      toast.success('Task assigned successfully!');
      setShowCreateForm(false);
      resetForm();
      fetchTasks();
    } catch (error) {
      toast.error(error.response?.data?.assigned_to?.[0] || error.response?.data?.title?.[0] || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await tasksAPI.updateTaskStatus(taskId, newStatus);
      toast.success('Task status updated');
      fetchTasks();
      if (selectedTask?.id === taskId) {
        setSelectedTask({ ...selectedTask, status: newStatus });
      }
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const handleAddComment = async (taskId) => {
    if (!newComment.trim()) return;
    try {
      await tasksAPI.addComment(taskId, newComment);
      setNewComment('');
      const res = await tasksAPI.getComments(taskId);
      setComments(extractList(res));
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleSelectTask = async (task) => {
    setSelectedTask(task);
    try {
      const res = await tasksAPI.getComments(task.id);
      setComments(extractList(res));
    } catch (error) { /* comments may be empty */ }
  };

  const filteredTasks = statusFilter
    ? tasks.filter(t => t.status === statusFilter)
    : tasks;

  if (loading) return <Layout><LoadingSpinner /></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
          {canAssign && (
            <button onClick={() => setShowCreateForm(!showCreateForm)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm">
              {showCreateForm ? 'Cancel' : 'Assign Task'}
            </button>
          )}
        </div>

        {/* Create Task Form */}
        {showCreateForm && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Assign New Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Complete quarterly report" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe the task..." />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign To *</label>
                  <select value={formData.assigned_to} onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    required disabled={internsLoading}>
                    <option value="">
                      {internsLoading ? 'Loading interns...' : interns.length === 0 ? 'No interns available' : 'Select intern'}
                    </option>
                    {interns.map((intern) => (
                      <option key={intern.id} value={intern.id}>
                        {formatInternName(intern)}
                      </option>
                    ))}
                  </select>
                  {!internsLoading && interns.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">No interns found. Ensure interns are registered and active.</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input type="date" value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Program (optional)</label>
                <select value={formData.program} onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">No program</option>
                  {programs.map((prog) => (
                    <option key={prog.id} value={prog.id}>{prog.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={submitting || interns.length === 0}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium">
                  {submitting ? 'Assigning...' : 'Assign Task'}
                </button>
                <button type="button" onClick={() => { setShowCreateForm(false); resetForm(); }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Status Filter */}
        <div className="flex gap-2 flex-wrap">
          {['', 'todo', 'in_progress', 'completed', 'overdue'].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s === '' ? 'All' : s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Task List */}
          <div className="lg:col-span-1 bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="font-medium text-gray-900">Tasks ({filteredTasks.length})</h3>
            </div>
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {filteredTasks.length === 0 ? (
                <EmptyState title="No tasks" description="No tasks match the current filter." />
              ) : (
                filteredTasks.map((task) => (
                  <div key={task.id} onClick={() => handleSelectTask(task)}
                    className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition ${selectedTask?.id === task.id ? 'bg-blue-50' : ''}`}>
                    <p className="font-medium text-gray-900 text-sm">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge status={task.status} />
                      <StatusBadge status={task.priority} customLabel={task.priority} />
                    </div>
                    {task.due_date && <p className="text-xs text-gray-400 mt-1">Due: {formatDate(task.due_date)}</p>}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Task Detail */}
          <div className="lg:col-span-2 bg-white shadow rounded-lg p-6">
            {selectedTask ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">{selectedTask.title}</h3>
                  <div className="flex gap-2">
                    <StatusBadge status={selectedTask.status} />
                    <StatusBadge status={selectedTask.priority} customLabel={selectedTask.priority} />
                  </div>
                </div>
                <p className="text-gray-600">{selectedTask.description || 'No description'}</p>
                <div className="flex gap-4 text-sm text-gray-500">
                  {selectedTask.assigned_to_name && <span>Assigned to: {selectedTask.assigned_to_name}</span>}
                  {selectedTask.due_date && <span>Due: {formatDate(selectedTask.due_date)}</span>}
                </div>

                {/* Status Change */}
                <div className="flex gap-2">
                  {!canAssign && selectedTask.status === 'todo' && (
                    <button onClick={() => handleStatusChange(selectedTask.id, 'in_progress')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Start Task</button>
                  )}
                  {!canAssign && selectedTask.status === 'in_progress' && (
                    <button onClick={() => handleStatusChange(selectedTask.id, 'completed')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">Complete</button>
                  )}
                  {canAssign && selectedTask.status !== 'completed' && (
                    <select
                      value={selectedTask.status}
                      onChange={(e) => handleStatusChange(selectedTask.id, e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  )}
                </div>

                {/* Comments */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Comments</h4>
                  <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                    {comments.length === 0 ? (
                      <p className="text-sm text-gray-400">No comments yet</p>
                    ) : (
                      comments.map((c) => (
                        <div key={c.id} className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm font-medium text-gray-700">{c.author_name}</p>
                          <p className="text-sm text-gray-600">{c.comment}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..." className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddComment(selectedTask.id)} />
                    <button onClick={() => handleAddComment(selectedTask.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Send</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-12">Select a task to view details</div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Tasks;