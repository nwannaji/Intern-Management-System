from django.contrib import admin
from .models import LeaveType, LeaveRequest, LeaveRequestHistory

@admin.register(LeaveType)
class LeaveTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'max_days_per_year', 'is_paid')

@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = ('applicant', 'leave_type', 'start_date', 'end_date', 'status', 'reviewed_at')
    list_filter = ('status', 'leave_type')

@admin.register(LeaveRequestHistory)
class LeaveRequestHistoryAdmin(admin.ModelAdmin):
    list_display = ('leave_request', 'status', 'changed_by', 'changed_at')