from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.contrib.auth import get_user_model

from .models import Program, Application, ApplicationStatusHistory
from .serializers import ProgramSerializer, ApplicationSerializer, ApplicationCreateSerializer, ApplicationUpdateSerializer

User = get_user_model()


class ProgramViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Program.objects.filter(is_active=True)
    serializer_class = ProgramSerializer
    permission_classes = []  # Allow public access to view programs
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['program_type']
    search_fields = ['name', 'description']
    ordering_fields = ['start_date', 'application_deadline', 'name']
    ordering = ['-start_date']


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
        return Application.objects.filter(applicant=user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ApplicationCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ApplicationUpdateSerializer
        return ApplicationSerializer
    
    def perform_create(self, serializer):
        try:
            user = self.get_serializer_context()['request'].user
            print(f"Serializer validated_data: {serializer.validated_data}")
            application = Application.objects.create(applicant=user, **serializer.validated_data)
            ApplicationStatusHistory.objects.create(
                application=application,
                status='pending',
                changed_by=user,
                notes='Application submitted'
            )
            return application
        except Exception as e:
            print(f"Application creation error: {str(e)}")
            print(f"Validated data: {serializer.validated_data}")
            print(f"Serializer errors: {serializer.errors}")
            raise
    
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
        
        # Send email notification (to be implemented)
        
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
        
        # Send email notification (to be implemented)
        
        serializer = self.get_serializer(application)
        return Response(serializer.data)
