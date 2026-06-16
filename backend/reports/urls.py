from django.urls import path
from .views import intern_dashboard, supervisor_dashboard, admin_reports

urlpatterns = [
    path('dashboard/intern/', intern_dashboard, name='intern_dashboard'),
    path('dashboard/supervisor/', supervisor_dashboard, name='supervisor_dashboard'),
    path('reports/', admin_reports, name='admin_reports'),
]