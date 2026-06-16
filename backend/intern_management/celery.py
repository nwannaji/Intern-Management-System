import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'intern_management.settings')

try:
    from celery import Celery

    app = Celery('intern_management')
    app.config_from_object('django.conf:settings', namespace='CELERY')
    app.autodiscover_tasks()
except ImportError:
    # Celery not installed - async email tasks will be unavailable
    app = None