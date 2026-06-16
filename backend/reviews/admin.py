from django.contrib import admin
from .models import Review

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('intern', 'reviewer', 'program', 'overall_rating', 'status', 'submitted_at')
    list_filter = ('status', 'overall_rating')