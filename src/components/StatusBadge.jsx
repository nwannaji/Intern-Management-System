import React from 'react';

const statusConfig = {
  // Application statuses
  pending: { label: 'Pending', classes: 'bg-yellow-100 text-yellow-800' },
  under_review: { label: 'Under Review', classes: 'bg-blue-100 text-blue-800' },
  approved: { label: 'Approved', classes: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected', classes: 'bg-red-100 text-red-800' },

  // Leave statuses
  supervisor_approved: { label: 'Supervisor Approved', classes: 'bg-blue-100 text-blue-800' },

  // Attendance statuses
  present: { label: 'Present', classes: 'bg-green-100 text-green-800' },
  absent: { label: 'Absent', classes: 'bg-red-100 text-red-800' },
  late: { label: 'Late', classes: 'bg-yellow-100 text-yellow-800' },
  excused: { label: 'Excused', classes: 'bg-gray-100 text-gray-800' },

  // Leave statuses
  // (reuse pending/approved/rejected)

  // Task statuses
  todo: { label: 'To Do', classes: 'bg-gray-100 text-gray-800' },
  in_progress: { label: 'In Progress', classes: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Completed', classes: 'bg-green-100 text-green-800' },
  overdue: { label: 'Overdue', classes: 'bg-red-100 text-red-800' },

  // Review statuses
  draft: { label: 'Draft', classes: 'bg-gray-100 text-gray-800' },
  submitted: { label: 'Submitted', classes: 'bg-blue-100 text-blue-800' },
  acknowledged: { label: 'Acknowledged', classes: 'bg-green-100 text-green-800' },

  // Onboarding statuses
  // (reuse pending/in_progress/completed)

  // Priority
  low: { label: 'Low', classes: 'bg-gray-100 text-gray-800' },
  medium: { label: 'Medium', classes: 'bg-yellow-100 text-yellow-800' },
  high: { label: 'High', classes: 'bg-red-100 text-red-800' },

  // Notification
  unread: { label: 'Unread', classes: 'bg-blue-100 text-blue-800' },
  read: { label: 'Read', classes: 'bg-gray-100 text-gray-800' },
};

const StatusBadge = ({ status, customLabel, customClasses }) => {
  const config = statusConfig[status] || { label: status, classes: 'bg-gray-100 text-gray-800' };
  const label = customLabel || config.label;
  const classes = customClasses || config.classes;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes}`}>
      {label}
    </span>
  );
};

export default StatusBadge;
export { statusConfig };