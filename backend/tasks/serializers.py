from rest_framework import serializers
from django.utils import timezone
from .models import Task, TaskComment


class TaskCommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)

    class Meta:
        model = TaskComment
        fields = ['id', 'task', 'author', 'author_name', 'comment', 'created_at']
        read_only_fields = ['id', 'author', 'created_at']


class TaskSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    assigned_by_name = serializers.CharField(source='assigned_by.get_full_name', read_only=True)
    program_name = serializers.CharField(source='program.name', read_only=True)
    comments = TaskCommentSerializer(many=True, read_only=True)

    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'assigned_to', 'assigned_to_name',
                 'assigned_by', 'assigned_by_name', 'program', 'program_name',
                 'due_date', 'priority', 'status', 'completed_at', 'notes',
                 'comments', 'created_at', 'updated_at']
        read_only_fields = ['id', 'assigned_by', 'completed_at', 'created_at', 'updated_at']


class TaskCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['title', 'description', 'assigned_to', 'program', 'due_date', 'priority', 'notes']

    def validate_assigned_to(self, value):
        if value.role != 'intern':
            raise serializers.ValidationError('Tasks can only be assigned to interns')
        return value


class TaskUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['status', 'notes']

    def validate_status(self, value):
        valid_transitions = {
            'todo': ['in_progress'],
            'in_progress': ['completed'],
            'completed': [],
            'overdue': ['in_progress', 'completed'],
        }
        current = self.instance.status if self.instance else 'todo'
        if value not in valid_transitions.get(current, []):
            raise serializers.ValidationError(f'Cannot transition from {current} to {value}')
        return value

    def update(self, instance, validated_data):
        if validated_data.get('status') == 'completed':
            instance.completed_at = timezone.now()
        return super().update(instance, validated_data)