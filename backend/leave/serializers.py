from rest_framework import serializers
from django.utils import timezone
from .models import LeaveType, LeaveRequest, LeaveRequestHistory


class LeaveTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveType
        fields = ['id', 'name', 'max_days_per_year', 'is_paid', 'description']


class LeaveRequestHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(source='changed_by.get_full_name', read_only=True)

    class Meta:
        model = LeaveRequestHistory
        fields = ['id', 'status', 'changed_by', 'changed_by_name', 'changed_at', 'notes']


class LeaveRequestSerializer(serializers.ModelSerializer):
    applicant_name = serializers.CharField(source='applicant.get_full_name', read_only=True)
    leave_type_name = serializers.CharField(source='leave_type.name', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.get_full_name', read_only=True)
    supervisor_reviewed_by_name = serializers.CharField(source='supervisor_reviewed_by.get_full_name', read_only=True)
    status_history = LeaveRequestHistorySerializer(many=True, read_only=True)
    days_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = LeaveRequest
        fields = ['id', 'applicant', 'applicant_name', 'leave_type', 'leave_type_name',
                 'start_date', 'end_date', 'reason', 'status',
                 'supervisor_reviewed_by', 'supervisor_reviewed_by_name', 'supervisor_reviewed_at', 'supervisor_notes',
                 'reviewed_by', 'reviewed_by_name', 'reviewed_at', 'admin_notes',
                 'status_history', 'days_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'applicant',
                          'supervisor_reviewed_by', 'supervisor_reviewed_at',
                          'reviewed_by', 'reviewed_at',
                          'created_at', 'updated_at']


class LeaveRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveRequest
        fields = ['leave_type', 'start_date', 'end_date', 'reason']

    def validate(self, attrs):
        if attrs['end_date'] < attrs['start_date']:
            raise serializers.ValidationError("End date must be after start date")
        return attrs

    def create(self, validated_data):
        validated_data['applicant'] = self.context['request'].user
        request = super().create(validated_data)
        LeaveRequestHistory.objects.create(
            leave_request=request,
            status='pending',
            changed_by=self.context['request'].user,
            notes='Leave request submitted'
        )
        return request


class LeaveBalanceSerializer(serializers.Serializer):
    leave_type_name = serializers.CharField()
    max_days = serializers.IntegerField()
    used_days = serializers.IntegerField()
    remaining_days = serializers.IntegerField()