from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.contrib.auth import get_user_model

from .models import Program, Application, ApplicationStatusHistory
from .serializers import ProgramSerializer, ApplicationSerializer, ApplicationCreateSerializer, ApplicationUpdateSerializer

User = get_user_model()


class ProgramViewSet(viewsets.ModelViewSet):
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['program_type']
    search_fields = ['name', 'description']
    ordering_fields = ['start_date', 'application_deadline', 'name']
    ordering = ['-start_date']
    
    def get_permissions(self):
        # Allow public access for viewing programs
        if self.action in ['list', 'retrieve']:
            return []
        # Require admin permissions for creating, updating, deleting
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        # Public users can only see active programs
        if not self.request.user.is_authenticated or self.request.user.role != 'admin':
            return Program.objects.filter(is_active=True)
        # Admins can see all programs
        return Program.objects.all()
    
    def perform_create(self, serializer):
        # Only admins can create programs
        if self.request.user.role != 'admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only admins can create programs.")
        serializer.save()
    
    def perform_update(self, serializer):
        # Only admins can update programs
        if self.request.user.role != 'admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only admins can update programs.")
        serializer.save()
    
    def perform_destroy(self, instance):
        # Only admins can delete programs
        if self.request.user.role != 'admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only admins can delete programs.")
        instance.delete()


class ApplicationViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'program']
    search_fields = ['applicant__username', 'applicant__email', 'program__name']
    ordering_fields = ['submitted_at', 'reviewed_at']
    ordering = ['-submitted_at']
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Application.objects.all()
        if user.role == 'supervisor':
            from accounts.models import SupervisorAssignment
            intern_ids = SupervisorAssignment.objects.filter(
                supervisor=user
            ).values_list('intern_id', flat=True)
            return Application.objects.filter(applicant_id__in=intern_ids)
        return Application.objects.filter(applicant=user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ApplicationCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ApplicationUpdateSerializer
        return ApplicationSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        application = serializer.save()
        
        # Return the application serialized with full details including ID
        response_serializer = ApplicationSerializer(application, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    def perform_create(self, serializer):
        user = self.get_serializer_context()['request'].user
        application = Application.objects.create(applicant=user, **serializer.validated_data)
        ApplicationStatusHistory.objects.create(
            application=application,
            status='pending',
            changed_by=user,
            notes='Application submitted'
        )
        return application
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_applications(self, request):
        applications = Application.objects.filter(applicant=request.user)
        serializer = self.get_serializer(applications, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def approve(self, request, pk=None):
        if request.user.role != 'admin':
            return Response({'error': 'Only admins can approve applications'},
                          status=status.HTTP_403_FORBIDDEN)

        application = self.get_object()
        application.status = 'approved'
        application.reviewed_by = request.user
        application.save()

        # Send in-app notification
        from notifications.utils import send_notification
        from notifications.tasks import send_application_status_email
        send_notification(
            recipient=application.applicant,
            title='Application Approved',
            message=f'Your application for {application.program.name} has been approved!',
            notification_type='application_status',
            related_object_id=application.id,
            related_object_type='application',
        )
        # Send email via Celery
        send_application_status_email.delay(
            application_id=application.id,
            status='approved',
        )

        serializer = self.get_serializer(application)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def reject(self, request, pk=None):
        if request.user.role != 'admin':
            return Response({'error': 'Only admins can reject applications'},
                          status=status.HTTP_403_FORBIDDEN)

        application = self.get_object()
        application.status = 'rejected'
        application.reviewed_by = request.user
        application.save()

        # Send in-app notification
        from notifications.utils import send_notification
        from notifications.tasks import send_application_status_email
        send_notification(
            recipient=application.applicant,
            title='Application Rejected',
            message=f'Your application for {application.program.name} has been rejected.',
            notification_type='application_status',
            related_object_id=application.id,
            related_object_type='application',
        )
        # Send email via Celery
        send_application_status_email.delay(
            application_id=application.id,
            status='rejected',
        )

        serializer = self.get_serializer(application)
        return Response(serializer.data)
