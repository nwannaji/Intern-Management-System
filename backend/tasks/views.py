from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from intern_management.permissions import IsAdminOrSupervisor
from accounts.models import SupervisorAssignment
from .models import Task, TaskComment
from .serializers import TaskSerializer, TaskCreateSerializer, TaskUpdateSerializer, TaskCommentSerializer
from notifications.utils import send_notification


class TaskViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Task.objects.all()
        if user.role == 'supervisor':
            intern_ids = SupervisorAssignment.objects.filter(
                supervisor=user
            ).values_list('intern_id', flat=True)
            # Use Q objects instead of QuerySet union (|) to preserve
            # filtering, ordering, and pagination capabilities.
            if intern_ids:
                return Task.objects.filter(
                    Q(assigned_to_id__in=intern_ids) | Q(assigned_by=user)
                ).order_by('-created_at')
            else:
                # Fallback: if no assignments exist yet, show all intern tasks
                # plus the supervisor's own tasks so they can still manage work.
                return Task.objects.filter(
                    Q(assigned_to__role='intern') | Q(assigned_by=user)
                ).order_by('-created_at')
        return Task.objects.filter(assigned_to=user)

    def get_serializer_class(self):
        if self.action == 'create':
            return TaskCreateSerializer
        if self.action in ('update', 'partial_update'):
            return TaskUpdateSerializer
        return TaskSerializer

    def perform_create(self, serializer):
        task = serializer.save(assigned_by=self.request.user)
        # Send notification to assigned intern
        send_notification(
            recipient=task.assigned_to,
            title=f'New Task: {task.title}',
            message=f'You have been assigned a new task: {task.title}',
            notification_type='task_assignment',
            related_object_id=task.id,
            related_object_type='task',
        )
        try:
            from notifications.tasks import send_task_assignment_email
            send_task_assignment_email.delay(task.id)
        except Exception:
            pass

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        task = self.get_object()
        new_status = request.data.get('status')

        if not new_status:
            return Response({'error': 'Status is required'}, status=status.HTTP_400_BAD_REQUEST)

        task.status = new_status
        if new_status == 'completed':
            task.completed_at = timezone.now()
        task.save()

        serializer = TaskSerializer(task)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def add_comment(self, request, pk=None):
        task = self.get_object()
        comment = TaskComment.objects.create(
            task=task,
            author=request.user,
            comment=request.data.get('comment', '')
        )
        serializer = TaskCommentSerializer(comment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def list_comments(self, request, pk=None):
        task = self.get_object()
        comments = task.comments.all()
        serializer = TaskCommentSerializer(comments, many=True)
        return Response(serializer.data)

    # Mark overdue tasks
    @action(detail=False, methods=['post'])
    def mark_overdue(self, request):
        overdue_tasks = Task.objects.filter(
            due_date__lt=timezone.now().date(),
            status__in=['todo', 'in_progress']
        )
        count = overdue_tasks.update(status='overdue')
        return Response({'message': f'{count} tasks marked as overdue'})

    filterset_fields = ['status', 'priority', 'assigned_to', 'program']
    search_fields = ['title', 'description']
    ordering = ['-created_at']