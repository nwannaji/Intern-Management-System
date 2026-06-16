import uuid
from rest_framework import serializers
from django.utils import timezone
from .models import AttendanceRecord, QRToken


class AttendanceRecordSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    checked_in_today = serializers.SerializerMethodField()

    class Meta:
        model = AttendanceRecord
        fields = ['id', 'user', 'user_name', 'date', 'check_in', 'check_out',
                 'status', 'notes', 'checked_in_today', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_checked_in_today(self, obj):
        today = timezone.now().date()
        record = AttendanceRecord.objects.filter(user=obj.user, date=today).first()
        if not record:
            return None
        if record.check_in and not record.check_out:
            return 'checked_in'
        if record.check_in and record.check_out:
            return 'checked_out'
        return None


class AttendanceRecordCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceRecord
        fields = ['date', 'check_in', 'status', 'notes']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        validated_data['check_in'] = validated_data.get('check_in', timezone.now().time())
        return super().create(validated_data)


class AttendanceSummarySerializer(serializers.Serializer):
    total_days = serializers.IntegerField()
    present_days = serializers.IntegerField()
    absent_days = serializers.IntegerField()
    late_days = serializers.IntegerField()
    excused_days = serializers.IntegerField()
    attendance_rate = serializers.FloatField()


class QRTokenSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)

    class Meta:
        model = QRToken
        fields = ['id', 'token', 'created_by', 'created_by_name', 'valid_date',
                 'expires_at', 'is_active', 'scan_count', 'created_at']
        read_only_fields = ['id', 'token', 'created_by', 'created_at', 'scan_count']


class QRScanSerializer(serializers.Serializer):
    token = serializers.UUIDField(help_text='The QR token UUID scanned from the QR code')