from django.contrib import admin
from .models import AttendanceRecord, QRToken


@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = ('user', 'date', 'check_in', 'check_out', 'status')
    list_filter = ('status', 'date')
    search_fields = ('user__email', 'user__first_name', 'user__last_name')
    date_hierarchy = 'date'


@admin.register(QRToken)
class QRTokenAdmin(admin.ModelAdmin):
    list_display = ('token', 'valid_date', 'expires_at', 'is_active', 'scan_count', 'created_by')
    list_filter = ('is_active', 'valid_date')
    search_fields = ('token',)
    date_hierarchy = 'valid_date'