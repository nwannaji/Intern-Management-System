from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone
from intern_management.permissions import IsAdmin, IsAdminOrSupervisor
from applications.models import Application
from attendance.models import AttendanceRecord
from reviews.models import Review
from leave.models import LeaveRequest
from accounts.models import SupervisorAssignment
from notifications.models import Notification


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def intern_dashboard(request):
    """Dashboard data for interns."""
    user = request.user
    today = timezone.now().date()

    # Pending tasks
    from tasks.models import Task
    pending_tasks = Task.objects.filter(assigned_to=user, status__in=['todo', 'in_progress']).count()
    overdue_tasks = Task.objects.filter(assigned_to=user, status='overdue').count()

    # Today's attendance
    try:
        today_attendance = AttendanceRecord.objects.get(user=user, date=today)
        attendance_status = today_attendance.status
    except AttendanceRecord.DoesNotExist:
        attendance_status = 'not_checked_in'

    # Unread notifications
    unread_notifications = Notification.objects.filter(recipient=user, is_read=False).count()

    # Leave balance
    leave_balances = []
    from leave.models import LeaveType, LeaveRequest
    for lt in LeaveType.objects.all():
        used = LeaveRequest.objects.filter(
            applicant=user, leave_type=lt,
            status__in=['approved', 'supervisor_approved'],
            start_date__year=today.year
        ).count()
        leave_balances.append({
            'name': lt.name,
            'remaining': max(0, lt.max_days_per_year - used),
        })

    # Upcoming reviews
    upcoming_reviews = Review.objects.filter(intern=user, status='submitted').count()

    return Response({
        'pending_tasks': pending_tasks,
        'overdue_tasks': overdue_tasks,
        'attendance_status': attendance_status,
        'unread_notifications': unread_notifications,
        'leave_balances': leave_balances,
        'upcoming_reviews': upcoming_reviews,
    })


@api_view(['GET'])
@permission_classes([IsAdminOrSupervisor])
def supervisor_dashboard(request):
    """Dashboard data for supervisors."""
    user = request.user
    assignments = SupervisorAssignment.objects.filter(supervisor=user)
    intern_ids = assignments.values_list('intern_id', flat=True)

    # Assigned interns
    assigned_interns_count = intern_ids.count()

    # Pending reviews
    from reviews.models import Review
    pending_reviews = Review.objects.filter(reviewer=user, status='draft').count()

    # Task overview
    from tasks.models import Task
    task_stats = {
        'todo': Task.objects.filter(assigned_to_id__in=intern_ids, status='todo').count(),
        'in_progress': Task.objects.filter(assigned_to_id__in=intern_ids, status='in_progress').count(),
        'completed': Task.objects.filter(assigned_to_id__in=intern_ids, status='completed').count(),
        'overdue': Task.objects.filter(assigned_to_id__in=intern_ids, status='overdue').count(),
    }

    # Attendance summary (today)
    today = timezone.now().date()
    from attendance.models import AttendanceRecord
    today_attendance = AttendanceRecord.objects.filter(user_id__in=intern_ids, date=today)
    attendance_summary = {
        'present': today_attendance.filter(status='present').count(),
        'absent': today_attendance.filter(status='absent').count(),
        'late': today_attendance.filter(status='late').count(),
    }

    return Response({
        'assigned_interns_count': assigned_interns_count,
        'pending_reviews': pending_reviews,
        'task_stats': task_stats,
        'attendance_summary': attendance_summary,
    })


@api_view(['GET'])
@permission_classes([IsAdmin])
def admin_reports(request):
    """Admin reports with aggregated statistics."""
    # Application stats
    app_stats = {
        'total': Application.objects.count(),
        'pending': Application.objects.filter(status='pending').count(),
        'under_review': Application.objects.filter(status='under_review').count(),
        'approved': Application.objects.filter(status='approved').count(),
        'rejected': Application.objects.filter(status='rejected').count(),
    }

    # Attendance stats (last 30 days)
    from datetime import timedelta
    thirty_days_ago = timezone.now().date() - timedelta(days=30)
    attendance_records = AttendanceRecord.objects.filter(date__gte=thirty_days_ago)
    attendance_stats = {
        'total_records': attendance_records.count(),
        'present': attendance_records.filter(status='present').count(),
        'absent': attendance_records.filter(status='absent').count(),
        'late': attendance_records.filter(status='late').count(),
    }

    # Performance distribution
    reviews = Review.objects.filter(status__in=['submitted', 'acknowledged'])
    performance_distribution = {
        '1': reviews.filter(overall_rating=1).count(),
        '2': reviews.filter(overall_rating=2).count(),
        '3': reviews.filter(overall_rating=3).count(),
        '4': reviews.filter(overall_rating=4).count(),
        '5': reviews.filter(overall_rating=5).count(),
    }

    # Leave usage
    current_year = timezone.now().year
    leave_stats = {
        'total_requests': LeaveRequest.objects.filter(start_date__year=current_year).count(),
        'approved': LeaveRequest.objects.filter(start_date__year=current_year, status='approved').count(),
        'supervisor_approved': LeaveRequest.objects.filter(start_date__year=current_year, status='supervisor_approved').count(),
        'rejected': LeaveRequest.objects.filter(start_date__year=current_year, status='rejected').count(),
        'pending': LeaveRequest.objects.filter(start_date__year=current_year, status='pending').count(),
    }

    return Response({
        'application_stats': app_stats,
        'attendance_stats': attendance_stats,
        'performance_distribution': performance_distribution,
        'leave_stats': leave_stats,
    })