from django.db import models
from django.conf import settings


class Review(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('acknowledged', 'Acknowledged'),
    ]

    intern = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews_received')
    reviewer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews_given')
    program = models.ForeignKey('applications.Program', on_delete=models.CASCADE, related_name='reviews')
    period_start = models.DateField()
    period_end = models.DateField()
    overall_rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    technical_skills = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    communication = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    teamwork = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    initiative = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    punctuality = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    strengths = models.TextField(blank=True)
    areas_for_improvement = models.TextField(blank=True)
    goals = models.TextField(blank=True)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='draft')
    submitted_at = models.DateTimeField(null=True, blank=True)
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Review for {self.intern.email} by {self.reviewer.email}"