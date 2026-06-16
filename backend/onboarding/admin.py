from django.contrib import admin
from .models import OnboardingTask, OnboardingProgress

@admin.register(OnboardingTask)
class OnboardingTaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'order', 'is_required', 'program_type')
    list_filter = ('program_type', 'is_required')
    ordering = ('order',)

@admin.register(OnboardingProgress)
class OnboardingProgressAdmin(admin.ModelAdmin):
    list_display = ('application', 'task', 'status', 'completed_at')
    list_filter = ('status',)