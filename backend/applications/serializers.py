from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Program, Application, ApplicationStatusHistory

User = get_user_model()


class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = ['id', 'name', 'program_type', 'description', 'duration_months', 
                 'start_date', 'end_date', 'application_deadline', 'is_active']
        read_only_fields = ['id']


class ApplicationStatusHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(source='changed_by.get_full_name', read_only=True)
    
    class Meta:
        model = ApplicationStatusHistory
        fields = ['id', 'status', 'changed_by', 'changed_by_name', 'changed_at', 'notes']
        read_only_fields = ['id', 'changed_at']


class ApplicationSerializer(serializers.ModelSerializer):
    applicant_name = serializers.CharField(source='applicant.get_full_name', read_only=True)
    program_name = serializers.CharField(source='program.name', read_only=True)
    status_history = ApplicationStatusHistorySerializer(many=True, read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.get_full_name', read_only=True)
    
    class Meta:
        model = Application
        fields = ['id', 'applicant', 'applicant_name', 'program', 'program_name', 
                 'status', 'cover_letter', 'why_interested', 'skills_and_experience', 
                 'availability_start_date', 'submitted_at', 'reviewed_at', 'reviewed_by', 
                 'reviewed_by_name', 'admin_notes', 'status_history']
        read_only_fields = ['id', 'applicant', 'submitted_at', 'reviewed_at', 'reviewed_by']


class ApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ['program', 'cover_letter', 'why_interested', 'skills_and_experience', 
                 'availability_start_date']
    
    def validate_program(self, value):
        user = self.context['request'].user
        if Application.objects.filter(applicant=user, program=value).exists():
            raise serializers.ValidationError("You have already applied to this program")
        if not value.is_active:
            raise serializers.ValidationError("This program is not currently accepting applications")
        return value
    
    def create(self, validated_data):
        user = self.context['request'].user
        application = Application.objects.create(applicant=user, **validated_data)
        ApplicationStatusHistory.objects.create(
            application=application,
            status='pending',
            changed_by=user,
            notes='Application submitted'
        )
        return application


class ApplicationUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ['status', 'admin_notes']
    
    def update(self, instance, validated_data):
        old_status = instance.status
        new_status = validated_data.get('status', old_status)
        
        if old_status != new_status:
            instance.status = new_status
            instance.reviewed_by = self.context['request'].user
            instance.save()
            
            ApplicationStatusHistory.objects.create(
                application=instance,
                status=new_status,
                changed_by=self.context['request'].user,
                notes=validated_data.get('admin_notes', '')
            )
        else:
            instance.admin_notes = validated_data.get('admin_notes', instance.admin_notes)
            instance.save()
        
        return instance
