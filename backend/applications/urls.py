from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProgramViewSet, ApplicationViewSet

router = DefaultRouter()
router.register(r'programs', ProgramViewSet)
router.register(r'applications', ApplicationViewSet, basename='application')

urlpatterns = [
    path('', include(router.urls)),
]
