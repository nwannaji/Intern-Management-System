from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DocumentTypeViewSet, DocumentViewSet, document_types_list

router = DefaultRouter()
router.register(r'documents', DocumentViewSet, basename='document')

urlpatterns = [
    path('types/', document_types_list, name='document-types-simple'),
    path('document-types/', document_types_list, name='document-types-alt'),
    path('', include(router.urls)),
]
