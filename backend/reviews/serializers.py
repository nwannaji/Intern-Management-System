from rest_framework import serializers
from django.utils import timezone
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    intern_name = serializers.CharField(source='intern.get_full_name', read_only=True)
    reviewer_name = serializers.CharField(source='reviewer.get_full_name', read_only=True)
    program_name = serializers.CharField(source='program.name', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'intern', 'intern_name', 'reviewer', 'reviewer_name',
                 'program', 'program_name', 'period_start', 'period_end',
                 'overall_rating', 'technical_skills', 'communication', 'teamwork',
                 'initiative', 'punctuality', 'strengths', 'areas_for_improvement',
                 'goals', 'status', 'submitted_at', 'acknowledged_at',
                 'created_at', 'updated_at']
        read_only_fields = ['id', 'submitted_at', 'acknowledged_at', 'created_at', 'updated_at']


class ReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['intern', 'program', 'period_start', 'period_end',
                 'overall_rating', 'technical_skills', 'communication', 'teamwork',
                 'initiative', 'punctuality', 'strengths', 'areas_for_improvement', 'goals']

    def validate_intern(self, value):
        if value.role != 'intern':
            raise serializers.ValidationError('Reviews can only be created for interns')
        return value

    def create(self, validated_data):
        validated_data['reviewer'] = self.context['request'].user
        return super().create(validated_data)


class ReviewUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['overall_rating', 'technical_skills', 'communication', 'teamwork',
                 'initiative', 'punctuality', 'strengths', 'areas_for_improvement', 'goals']