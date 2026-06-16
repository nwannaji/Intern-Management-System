from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from intern_management.permissions import IsAdmin
from applications.models import Application
from .models import OnboardingTask, OnboardingProgress
from .serializers import (OnboardingTaskSerializer, OnboardingProgressSerializer,
                          OnboardingProgressCreateSerializer)


class OnboardingTaskViewSet(viewsets.ModelViewSet):
    queryset = OnboardingTask.objects.all()
    serializer_class = OnboardingTaskSerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [permissions.IsAuthenticated()]
        return [IsAdmin()]


class OnboardingProgressViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return OnboardingProgress.objects.filter(application__applicant=self.request.user)

    def get_serializer_class(self):
        if self.action == 'create':
            return OnboardingProgressCreateSerializer
        return OnboardingProgressSerializer

    @action(detail=True, methods=['post'])
    def mark_complete(self, request, pk=None):
        progress = self.get_object()
        progress.status = 'completed'
        progress.completed_at = timezone.now()
        progress.completed_by = request.user
        progress.notes = request.data.get('notes', '')
        progress.save()

        serializer = OnboardingProgressSerializer(progress)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_application(self, request):
        application_id = request.query_params.get('application_id')
        if not application_id:
            return Response({'error': 'application_id parameter required'},
                          status=status.HTTP_400_BAD_REQUEST)

        progress = OnboardingProgress.objects.filter(
            application_id=application_id,
            application__applicant=request.user
        )
        serializer = OnboardingProgressSerializer(progress, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[IsAdmin])
    def initialize_for_application(self, request):
        """Create onboarding progress records for an approved application."""
        application_id = request.data.get('application_id')
        if not application_id:
            return Response({'error': 'application_id required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            application = Application.objects.get(pk=application_id, status='approved')
        except Application.DoesNotExist:
            return Response({'error': 'Approved application not found'}, status=status.HTTP_404_NOT_FOUND)

        # Get relevant onboarding tasks
        program_type = application.program.program_type
        tasks = OnboardingTask.objects.filter(
            models.Q(program_type='all') | models.Q(program_type=program_type)
        ) if hasattr(models, 'Q') else OnboardingTask.objects.filter(program_type='all')

        from django.db.models import Q
        tasks = OnboardingTask.objects.filter(Q(program_type='all') | Q(program_type=program_type))

        created = 0
        for task in tasks:
            _, was_created = OnboardingProgress.objects.get_or_create(
                application=application, task=task,
                defaults={'status': 'pending'}
            )
            if was_created:
                created += 1

        return Response({'message': f'Created {created} onboarding tasks for application {application_id}'})

    filterset_fields = ['status', 'application']
    ordering = ['task__order']