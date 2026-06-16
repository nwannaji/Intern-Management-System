from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OnboardingTaskViewSet, OnboardingProgressViewSet

router = DefaultRouter()
router.register(r'onboarding-tasks', OnboardingTaskViewSet, basename='onboardingtask')
router.register(r'onboarding-progress', OnboardingProgressViewSet, basename='onboardingprogress')

urlpatterns = [
    path('', include(router.urls)),
]