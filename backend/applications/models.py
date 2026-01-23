from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Program(models.Model):
    PROGRAM_TYPES = [
        ('IT', 'Industrial Training'),
        ('NYSC', 'National Youth Service Corps'),
    ]
    
    name = models.CharField(max_length=100)
    program_type = models.CharField(max_length=10, choices=PROGRAM_TYPES)
    description = models.TextField()
    duration_months = models.IntegerField()
    start_date = models.DateField()
    end_date = models.DateField()
    application_deadline = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} ({self.get_program_type_display()})"


class Application(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('under_review', 'Under Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    applicant = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applications')
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='applications')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    cover_letter = models.TextField()
    why_interested = models.TextField()
    skills_and_experience = models.TextField()
    availability_start_date = models.DateField()
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(blank=True, null=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True, 
                                   related_name='reviewed_applications')
    admin_notes = models.TextField(blank=True, null=True)
    
    class Meta:
        unique_together = ['applicant', 'program']
    
    def __str__(self):
        return f"{self.applicant.username} - {self.program.name}"


class ApplicationStatusHistory(models.Model):
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='status_history')
    status = models.CharField(max_length=20)
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True)
    changed_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-changed_at']
    
    def __str__(self):
        return f"{self.application} - {self.status} at {self.changed_at}"
