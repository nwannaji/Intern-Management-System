from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DocumentTypeViewSet, DocumentViewSet

router = DefaultRouter()
router.register(r'documenttypes', DocumentTypeViewSet, basename='documenttype')
router.register(r'documents', DocumentViewSet, basename='document')

urlpatterns = [
    path('', include(router.urls)),
]