from django.db import models
from django.conf import settings


class OnboardingTask(models.Model):
    PROGRAM_TYPE_CHOICES = [
        ('IT', 'Industrial Training'),
        ('NYSC', 'NYSC'),
        ('all', 'All Programs'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    order = models.IntegerField(default=0)
    is_required = models.BooleanField(default=True)
    program_type = models.CharField(max_length=10, choices=PROGRAM_TYPE_CHOICES, default='all')

    class Meta:
        ordering = ['order', 'title']

    def __str__(self):
        return self.title


class OnboardingProgress(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]

    application = models.ForeignKey('applications.Application', on_delete=models.CASCADE, related_name='onboarding_progress')
    task = models.ForeignKey(OnboardingTask, on_delete=models.CASCADE, related_name='progress_records')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    completed_at = models.DateTimeField(null=True, blank=True)
    completed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='completed_onboarding_tasks')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['application', 'task']
        ordering = ['task__order']

    def __str__(self):
        return f"{self.application} - {self.task.title} ({self.status})"