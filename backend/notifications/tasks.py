try:
    from celery import shared_task
except ImportError:
    # Celery not installed - define a no-op decorator
    def shared_task(func):
        func.delay = lambda *args, **kwargs: None
        return func

from django.core.mail import send_mail
from django.conf import settings


@shared_task
def send_notification_email(notification_id):
    """Send email for a notification."""
    try:
        from .models import Notification
        notification = Notification.objects.get(pk=notification_id)
        if notification.recipient.email:
            send_mail(
                subject=notification.title,
                message=notification.message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[notification.recipient.email],
                fail_silently=True,
            )
    except Exception:
        pass


@shared_task
def send_application_status_email(application_id, new_status):
    """Send email when application status changes."""
    try:
        from applications.models import Application
        application = Application.objects.get(pk=application_id)
        applicant = application.applicant

        status_messages = {
            'under_review': f'Your application for {application.program.name} is now under review.',
            'approved': f'Congratulations! Your application for {application.program.name} has been approved.',
            'rejected': f'Your application for {application.program.name} was not approved. Thank you for your interest.',
        }
        message = status_messages.get(new_status, f'Your application status has been updated to {new_status}.')

        send_mail(
            subject=f'Application Update - {application.program.name}',
            message=f'Dear {applicant.first_name},\n\n{message}\n\nBest regards,\nIntern Management System Team',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[applicant.email],
            fail_silently=True,
        )
    except Exception:
        pass


@shared_task
def send_leave_request_email(leave_request_id):
    """Send email for leave request."""
    try:
        from leave.models import LeaveRequest
        leave = LeaveRequest.objects.get(pk=leave_request_id)
        send_mail(
            subject=f'Leave Request - {leave.leave_type.name}',
            message=f'A leave request has been submitted by {leave.applicant.get_full_name()} from {leave.start_date} to {leave.end_date}.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[leave.applicant.email],
            fail_silently=True,
        )
    except Exception:
        pass


@shared_task
def send_task_assignment_email(task_id):
    """Send email when a task is assigned."""
    try:
        from tasks.models import Task
        task = Task.objects.get(pk=task_id)
        send_mail(
            subject=f'New Task Assigned: {task.title}',
            message=f'Dear {task.assigned_to.first_name},\n\nYou have been assigned a new task: {task.title}\n\nDescription: {task.description}\n\nDue date: {task.due_date or "No deadline"}\n\nBest regards,\nIntern Management System Team',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[task.assigned_to.email],
            fail_silently=True,
        )
    except Exception:
        pass


@shared_task
def send_review_submission_email(review_id):
    """Send email when a review is submitted."""
    try:
        from reviews.models import Review
        review = Review.objects.get(pk=review_id)
        send_mail(
            subject=f'Performance Review - {review.period_start} to {review.period_end}',
            message=f'Dear {review.intern.first_name},\n\nYour performance review for the period {review.period_start} to {review.period_end} has been submitted. Please log in to view and acknowledge it.\n\nBest regards,\nIntern Management System Team',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[review.intern.email],
            fail_silently=True,
        )
    except Exception:
        pass


@shared_task
def send_password_reset_email_task(user_id, reset_token_str, reset_url):
    """Send password reset email asynchronously."""
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        user = User.objects.get(pk=user_id)
        send_mail(
            subject="Password Reset Request - Intern Management System",
            message=f"Hello {user.first_name},\n\nYou requested a password reset for your Intern Management System account.\n\nClick the link below to reset your password:\n{reset_url}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nIntern Management System Team",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=True,
        )
    except Exception:
        pass