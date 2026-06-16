from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from intern_management.permissions import IsAdminOrSupervisor
from accounts.models import SupervisorAssignment, User
from .models import LeaveType, LeaveRequest, LeaveRequestHistory
from .serializers import (LeaveTypeSerializer, LeaveRequestSerializer,
                          LeaveRequestCreateSerializer, LeaveBalanceSerializer)
from notifications.utils import send_notification


class LeaveTypeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LeaveType.objects.all()
    serializer_class = LeaveTypeSerializer
    permission_classes = [permissions.IsAuthenticated]


class LeaveRequestViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return LeaveRequest.objects.all()
        if user.role == 'supervisor':
            intern_ids = SupervisorAssignment.objects.filter(
                supervisor=user
            ).values_list('intern_id', flat=True)
            # Use Q objects instead of QuerySet union (|) to preserve
            # filtering, ordering, and pagination capabilities.
            # Fallback: if no assignments exist yet, show all intern requests
            # so the supervisor can still review leave applications.
            if intern_ids:
                return LeaveRequest.objects.filter(
                    Q(applicant_id__in=intern_ids) | Q(applicant=user)
                ).order_by('-created_at')
            else:
                return LeaveRequest.objects.filter(
                    Q(applicant__role='intern') | Q(applicant=user)
                ).order_by('-created_at')
        return LeaveRequest.objects.filter(applicant=user)

    def get_serializer_class(self):
        if self.action == 'create':
            return LeaveRequestCreateSerializer
        return LeaveRequestSerializer

    def _validate_supervisor_intern(self, supervisor, intern):
        """Check if the supervisor is assigned to this intern.

        Fallback: if the supervisor has no assignments at all,
        allow them to act on any intern (so the system is usable
        before assignments are created).
        """
        assignments_exist = SupervisorAssignment.objects.filter(
            supervisor=supervisor
        ).exists()
        if not assignments_exist:
            return True
        return SupervisorAssignment.objects.filter(
            supervisor=supervisor, intern=intern
        ).exists()

    @action(detail=False, methods=['get'])
    def my_leave_requests(self, request):
        requests = LeaveRequest.objects.filter(applicant=request.user)
        serializer = LeaveRequestSerializer(requests, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def supervisor_approve(self, request, pk=None):
        """Supervisor approves a pending leave request (first step in two-step flow)."""
        if request.user.role != 'supervisor':
            return Response(
                {'error': 'Only supervisors can perform supervisor approval'},
                status=status.HTTP_403_FORBIDDEN
            )

        leave_request = self.get_object()

        if leave_request.status != 'pending':
            return Response(
                {'error': 'Only pending requests can be supervisor-approved'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not self._validate_supervisor_intern(request.user, leave_request.applicant):
            return Response(
                {'error': 'You can only approve leave requests from your assigned interns'},
                status=status.HTTP_403_FORBIDDEN
            )

        leave_request.status = 'supervisor_approved'
        leave_request.supervisor_reviewed_by = request.user
        leave_request.supervisor_reviewed_at = timezone.now()
        leave_request.supervisor_notes = request.data.get('supervisor_notes', '')
        leave_request.save()

        LeaveRequestHistory.objects.create(
            leave_request=leave_request, status='supervisor_approved',
            changed_by=request.user,
            notes=request.data.get('supervisor_notes', 'Supervisor approved - forwarded to admin')
        )

        # Notify the intern
        send_notification(
            recipient=leave_request.applicant,
            title='Leave Request Supervisor-Approved',
            message=f'Your leave request from {leave_request.start_date} to {leave_request.end_date} has been approved by your supervisor and forwarded to admin for final approval.',
            notification_type='leave_request',
            related_object_id=leave_request.id,
            related_object_type='leave_request',
        )

        # Notify all admins
        admin_users = User.objects.filter(role='admin', is_active=True)
        for admin in admin_users:
            send_notification(
                recipient=admin,
                title='Leave Request Awaiting Final Approval',
                message=f'Leave request from {leave_request.applicant.get_full_name()} ({leave_request.start_date} to {leave_request.end_date}) has been supervisor-approved and awaits your final approval.',
                notification_type='leave_request',
                related_object_id=leave_request.id,
                related_object_type='leave_request',
            )

        # Send email notification
        try:
            from notifications.tasks import send_leave_request_email
            send_leave_request_email.delay(leave_request.id)
        except Exception:
            pass

        serializer = LeaveRequestSerializer(leave_request)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def supervisor_reject(self, request, pk=None):
        """Supervisor rejects a pending leave request."""
        if request.user.role != 'supervisor':
            return Response(
                {'error': 'Only supervisors can reject at this stage'},
                status=status.HTTP_403_FORBIDDEN
            )

        leave_request = self.get_object()

        if leave_request.status != 'pending':
            return Response(
                {'error': 'Only pending requests can be rejected by a supervisor'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not self._validate_supervisor_intern(request.user, leave_request.applicant):
            return Response(
                {'error': 'You can only reject leave requests from your assigned interns'},
                status=status.HTTP_403_FORBIDDEN
            )

        leave_request.status = 'rejected'
        leave_request.supervisor_reviewed_by = request.user
        leave_request.supervisor_reviewed_at = timezone.now()
        leave_request.supervisor_notes = request.data.get('supervisor_notes', '')
        leave_request.reviewed_by = request.user
        leave_request.reviewed_at = timezone.now()
        leave_request.admin_notes = request.data.get('supervisor_notes', '')
        leave_request.save()

        LeaveRequestHistory.objects.create(
            leave_request=leave_request, status='rejected',
            changed_by=request.user,
            notes=request.data.get('supervisor_notes', 'Rejected by supervisor')
        )

        send_notification(
            recipient=leave_request.applicant,
            title='Leave Request Rejected',
            message=f'Your leave request from {leave_request.start_date} to {leave_request.end_date} has been rejected by your supervisor.',
            notification_type='leave_request',
            related_object_id=leave_request.id,
            related_object_type='leave_request',
        )

        serializer = LeaveRequestSerializer(leave_request)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def supervisor_comment(self, request, pk=None):
        """Supervisor or admin adds a comment on a pending leave request without changing status."""
        if request.user.role not in ('supervisor', 'admin'):
            return Response(
                {'error': 'Only supervisors and admins can comment on leave requests'},
                status=status.HTTP_403_FORBIDDEN
            )

        leave_request = self.get_object()

        if leave_request.status != 'pending':
            return Response(
                {'error': 'Comments can only be added to pending requests'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if request.user.role == 'supervisor':
            if not self._validate_supervisor_intern(request.user, leave_request.applicant):
                return Response(
                    {'error': 'You can only comment on leave requests from your assigned interns'},
                    status=status.HTTP_403_FORBIDDEN
                )

        comment = request.data.get('comment', '')
        if not comment.strip():
            return Response(
                {'error': 'Comment cannot be empty'},
                status=status.HTTP_400_BAD_REQUEST
            )

        LeaveRequestHistory.objects.create(
            leave_request=leave_request, status='pending',
            changed_by=request.user, notes=comment
        )

        # Update supervisor_notes if the commenter is a supervisor
        if request.user.role == 'supervisor':
            leave_request.supervisor_notes = comment
            leave_request.save(update_fields=['supervisor_notes'])

        # Notify the intern about the comment
        send_notification(
            recipient=leave_request.applicant,
            title='Comment on Leave Request',
            message=f'A comment was added to your leave request from {leave_request.start_date} to {leave_request.end_date}: {comment}',
            notification_type='leave_request',
            related_object_id=leave_request.id,
            related_object_type='leave_request',
        )

        serializer = LeaveRequestSerializer(leave_request)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Admin gives final approval to a supervisor-approved leave request."""
        if request.user.role != 'admin':
            return Response(
                {'error': 'Only admins can give final approval'},
                status=status.HTTP_403_FORBIDDEN
            )

        leave_request = self.get_object()

        if leave_request.status != 'supervisor_approved':
            return Response(
                {'error': 'Only supervisor-approved requests can be given final approval'},
                status=status.HTTP_400_BAD_REQUEST
            )

        leave_request.status = 'approved'
        leave_request.reviewed_by = request.user
        leave_request.reviewed_at = timezone.now()
        leave_request.admin_notes = request.data.get('admin_notes', '')
        leave_request.save()

        LeaveRequestHistory.objects.create(
            leave_request=leave_request, status='approved',
            changed_by=request.user,
            notes=request.data.get('admin_notes', 'Leave finally approved by admin')
        )

        send_notification(
            recipient=leave_request.applicant,
            title='Leave Request Approved',
            message=f'Your leave request from {leave_request.start_date} to {leave_request.end_date} has been fully approved.',
            notification_type='leave_request',
            related_object_id=leave_request.id,
            related_object_type='leave_request',
        )

        try:
            from notifications.tasks import send_leave_request_email
            send_leave_request_email.delay(leave_request.id)
        except Exception:
            pass

        serializer = LeaveRequestSerializer(leave_request)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Admin rejects a supervisor-approved leave request."""
        if request.user.role != 'admin':
            return Response(
                {'error': 'Only admins can reject supervisor-approved requests'},
                status=status.HTTP_403_FORBIDDEN
            )

        leave_request = self.get_object()

        if leave_request.status != 'supervisor_approved':
            return Response(
                {'error': 'Only supervisor-approved requests can be rejected at this stage'},
                status=status.HTTP_400_BAD_REQUEST
            )

        leave_request.status = 'rejected'
        leave_request.reviewed_by = request.user
        leave_request.reviewed_at = timezone.now()
        leave_request.admin_notes = request.data.get('admin_notes', '')
        leave_request.save()

        LeaveRequestHistory.objects.create(
            leave_request=leave_request, status='rejected',
            changed_by=request.user,
            notes=request.data.get('admin_notes', 'Rejected by admin')
        )

        send_notification(
            recipient=leave_request.applicant,
            title='Leave Request Rejected',
            message=f'Your leave request from {leave_request.start_date} to {leave_request.end_date} has been rejected.',
            notification_type='leave_request',
            related_object_id=leave_request.id,
            related_object_type='leave_request',
        )

        serializer = LeaveRequestSerializer(leave_request)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def leave_balance(self, request):
        current_year = timezone.now().year
        leave_types = LeaveType.objects.all()
        balances = []

        for lt in leave_types:
            used = LeaveRequest.objects.filter(
                applicant=request.user,
                leave_type=lt,
                status__in=['approved', 'supervisor_approved'],
                start_date__year=current_year,
            ).count()
            balances.append({
                'leave_type_name': lt.name,
                'max_days': lt.max_days_per_year,
                'used_days': used,
                'remaining_days': max(0, lt.max_days_per_year - used),
            })

        serializer = LeaveBalanceSerializer(balances, many=True)
        return Response(serializer.data)

    filterset_fields = ['status', 'leave_type', 'applicant']
    ordering = ['-created_at']