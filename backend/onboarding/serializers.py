from rest_framework import serializers
from django.utils import timezone
from .models import OnboardingTask, OnboardingProgress


class OnboardingTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = OnboardingTask
        fields = ['id', 'title', 'description', 'order', 'is_required', 'program_type']


class OnboardingProgressSerializer(serializers.ModelSerializer):
    task_title = serializers.CharField(source='task.title', read_only=True)
    task_description = serializers.CharField(source='task.description', read_only=True)
    task_is_required = serializers.BooleanField(source='task.is_required', read_only=True)
    completed_by_name = serializers.CharField(source='completed_by.get_full_name', read_only=True)

    class Meta:
        model = OnboardingProgress
        fields = ['id', 'application', 'task', 'task_title', 'task_description',
                 'task_is_required', 'status', 'completed_at', 'completed_by',
                 'completed_by_name', 'notes', 'created_at', 'updated_at']
        read_only_fields = ['id', 'completed_at', 'completed_by', 'created_at', 'updated_at']


class OnboardingProgressCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OnboardingProgress
        fields = ['application', 'task', 'status', 'notes']