from django.contrib import admin
from .models import Program, Application, ApplicationStatusHistory


@admin.register(Program)
class ProgramAdmin(admin.ModelAdmin):
    list_display = ('name', 'program_type', 'duration_months', 'start_date', 'end_date', 'is_active')
    list_filter = ('program_type', 'is_active', 'start_date')
    search_fields = ('name', 'description')
    ordering = ('-created_at',)


class ApplicationStatusHistoryInline(admin.TabularInline):
    model = ApplicationStatusHistory
    extra = 0
    readonly_fields = ('changed_at',)


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('applicant', 'program', 'status', 'submitted_at', 'reviewed_at', 'reviewed_by')
    list_filter = ('status', 'program__program_type', 'submitted_at', 'reviewed_at')
    search_fields = ('applicant__username', 'applicant__email', 'program__name')
    ordering = ('-submitted_at',)
    readonly_fields = ('submitted_at',)
    inlines = [ApplicationStatusHistoryInline]
    
    actions = ['approve_applications', 'reject_applications']
    
    def approve_applications(self, request, queryset):
        for application in queryset:
            application.status = 'approved'
            application.reviewed_by = request.user
            application.save()
            ApplicationStatusHistory.objects.create(
                application=application,
                status='approved',
                changed_by=request.user,
                notes='Approved via admin action'
            )
    approve_applications.short_description = "Approve selected applications"
    
    def reject_applications(self, request, queryset):
        for application in queryset:
            application.status = 'rejected'
            application.reviewed_by = request.user
            application.save()
            ApplicationStatusHistory.objects.create(
                application=application,
                status='rejected',
                changed_by=request.user,
                notes='Rejected via admin action'
            )
    reject_applications.short_description = "Reject selected applications"


@admin.register(ApplicationStatusHistory)
class ApplicationStatusHistoryAdmin(admin.ModelAdmin):
    list_display = ('application', 'status', 'changed_by', 'changed_at')
    list_filter = ('status', 'changed_at')
    search_fields = ('application__applicant__username', 'application__program__name')
    ordering = ('-changed_at',)
    readonly_fields = ('changed_at',)
