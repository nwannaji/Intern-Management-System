from .models import Notification


def send_notification(recipient, title, message, notification_type='reminder',
                     related_object_id=None, related_object_type=''):
    """Create a notification and dispatch email via Celery."""
    notification = Notification.objects.create(
        recipient=recipient,
        title=title,
        message=message,
        notification_type=notification_type,
        related_object_id=related_object_id,
        related_object_type=related_object_type,
    )

    # Dispatch email via Celery if available
    try:
        from .tasks import send_notification_email
        send_notification_email.delay(notification.id)
    except Exception:
        pass  # Celery not available; notification still created

    return notification