from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.http import JsonResponse
from django.views.decorators.http import require_GET

from .models import DocumentType, Document
from .serializers import DocumentTypeSerializer, DocumentSerializer, DocumentCreateSerializer


@require_GET
def document_types_list(request):
    """Simple view to return document types without authentication"""
    types = list(DocumentType.objects.all().values('id', 'name', 'description', 'is_required'))
    return JsonResponse(types, safe=False)


@authentication_classes([])
@permission_classes([AllowAny])
class DocumentTypeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DocumentType.objects.all()
    serializer_class = DocumentTypeSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'description']
    ordering = ['name']


class DocumentViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['document_type', 'is_verified', 'application']
    search_fields = ['file_name', 'document_type__name']
    ordering = ['-uploaded_at']
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Document.objects.all()
        return Document.objects.filter(application__applicant=user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return DocumentCreateSerializer
        return DocumentSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        if self.action == 'create':
            # Safely get application_id from request data
            application_id = None
            if hasattr(self.request, 'data') and self.request.data:
                application_id = self.request.data.get('application_id')
            if not application_id:
                application_id = self.kwargs.get('application_pk')
            context['application_id'] = application_id
        return context
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        document = serializer.save()
        
        # Return the document serialized with full details
        response_serializer = DocumentSerializer(document, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    def perform_create(self, serializer):
        # Safely get application_id from request data
        application_id = None
        if hasattr(self.request, 'data') and self.request.data:
            application_id = self.request.data.get('application_id')
        if not application_id:
            application_id = self.kwargs.get('application_pk')
        serializer.save(application_id=application_id)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def verify(self, request, pk=None):
        if request.user.role != 'admin':
            return Response({'error': 'Only admins can verify documents'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        document = self.get_object()
        document.is_verified = True
        document.verification_notes = request.data.get('verification_notes', '')
        document.save()
        
        serializer = self.get_serializer(document)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def unverify(self, request, pk=None):
        if request.user.role != 'admin':
            return Response({'error': 'Only admins can unverify documents'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        document = self.get_object()
        document.is_verified = False
        document.verification_notes = request.data.get('verification_notes', '')
        document.save()
        
        serializer = self.get_serializer(document)
        return Response(serializer.data)
