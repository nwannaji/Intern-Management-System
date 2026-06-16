import uuid
from django.db import models
from django.conf import settings


class AttendanceRecord(models.Model):
    STATUS_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('late', 'Late'),
        ('excused', 'Excused'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField()
    check_in = models.TimeField(null=True, blank=True)
    check_out = models.TimeField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='present')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'date']
        ordering = ['-date']

    def __str__(self):
        return f"{self.user.email} - {self.date} - {self.status}"


class QRToken(models.Model):
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_qr_tokens')
    created_at = models.DateTimeField(auto_now_add=True)
    valid_date = models.DateField(help_text='The date this token is valid for')
    expires_at = models.DateTimeField(help_text='When this token expires')
    is_active = models.BooleanField(default=True, help_text='Admin can deactivate to revoke token')
    scan_count = models.PositiveIntegerField(default=0, help_text='Total number of times this QR has been scanned')

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"QRToken {self.token} - {self.valid_date} ({'active' if self.is_active else 'inactive'})"