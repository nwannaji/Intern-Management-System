from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from intern_management.permissions import IsAdminOrSupervisor
from accounts.models import SupervisorAssignment
from .models import Review
from .serializers import ReviewSerializer, ReviewCreateSerializer, ReviewUpdateSerializer
from notifications.utils import send_notification


class ReviewViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Review.objects.all()
        if user.role == 'supervisor':
            return Review.objects.filter(reviewer=user)
        # Interns see only their own reviews that are not drafts
        return Review.objects.filter(intern=user).exclude(status='draft')

    def get_serializer_class(self):
        if self.action == 'create':
            return ReviewCreateSerializer
        if self.action in ('update', 'partial_update'):
            return ReviewUpdateSerializer
        return ReviewSerializer

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        review = self.get_object()
        if review.reviewer != request.user and request.user.role != 'admin':
            return Response({'error': 'Only the reviewer can submit this review'},
                          status=status.HTTP_403_FORBIDDEN)

        review.status = 'submitted'
        review.submitted_at = timezone.now()
        review.save()

        send_notification(
            recipient=review.intern,
            title='New Performance Review',
            message=f'A performance review for the period {review.period_start} to {review.period_end} has been submitted.',
            notification_type='review',
            related_object_id=review.id,
            related_object_type='review',
        )

        try:
            from notifications.tasks import send_review_submission_email
            send_review_submission_email.delay(review.id)
        except Exception:
            pass

        serializer = ReviewSerializer(review)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def acknowledge(self, request, pk=None):
        review = self.get_object()
        if review.intern != request.user:
            return Response({'error': 'Only the intern can acknowledge this review'},
                          status=status.HTTP_403_FORBIDDEN)

        if review.status != 'submitted':
            return Response({'error': 'Can only acknowledge submitted reviews'},
                          status=status.HTTP_400_BAD_REQUEST)

        review.status = 'acknowledged'
        review.acknowledged_at = timezone.now()
        review.save()

        serializer = ReviewSerializer(review)
        return Response(serializer.data)

    filterset_fields = ['status', 'intern', 'reviewer', 'program']
    search_fields = ['intern__email', 'reviewer__email']
    ordering = ['-created_at']