from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DocumentTypeViewSet, DocumentViewSet, document_types_list, seed_document_types_api

router = DefaultRouter()
router.register(r'documents', DocumentViewSet, basename='document')

urlpatterns = [
    path('types/', document_types_list, name='document-types-simple'),
    path('document-types/', document_types_list, name='document-types-alt'),
    path('seed-document-types/', seed_document_types_api, name='seed-document-types'),
    path('', include(router.urls)),
]
