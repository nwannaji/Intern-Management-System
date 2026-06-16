from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta, time
from django.db.models import Count
from intern_management.permissions import IsAdminOrSupervisor
from accounts.models import SupervisorAssignment
from .models import AttendanceRecord, QRToken
from .serializers import (
    AttendanceRecordSerializer, AttendanceRecordCreateSerializer,
    AttendanceSummarySerializer, QRTokenSerializer, QRScanSerializer
)


class AttendanceRecordViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return AttendanceRecord.objects.all()
        if user.role == 'supervisor':
            intern_ids = SupervisorAssignment.objects.filter(
                supervisor=user
            ).values_list('intern_id', flat=True)
            return AttendanceRecord.objects.filter(user_id__in=intern_ids) | AttendanceRecord.objects.filter(user=user)
        return AttendanceRecord.objects.filter(user=user)

    def get_serializer_class(self):
        if self.action == 'create':
            return AttendanceRecordCreateSerializer
        return AttendanceRecordSerializer

    # ── Fixed attendance times ──
    CHECK_IN_TIME = time(8, 30)    # 8:30 AM
    CHECK_OUT_TIME = time(17, 0)   # 5:00 PM
    CUTOFF_TIME = time(12, 0)     # AM/PM boundary at noon

    @action(detail=False, methods=['post'])
    def check_in(self, request):
        today = timezone.now().date()
        record, created = AttendanceRecord.objects.get_or_create(
            user=request.user, date=today,
            defaults={'check_in': self.CHECK_IN_TIME, 'status': 'present'}
        )
        if not created and not record.check_in:
            record.check_in = self.CHECK_IN_TIME
            record.status = 'present'
            record.save()
        serializer = AttendanceRecordSerializer(record)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def check_out(self, request):
        today = timezone.now().date()
        try:
            record = AttendanceRecord.objects.get(user=request.user, date=today)
            record.check_out = self.CHECK_OUT_TIME
            record.save()
            serializer = AttendanceRecordSerializer(record)
            return Response(serializer.data)
        except AttendanceRecord.DoesNotExist:
            return Response({'error': 'No check-in record found for today'},
                          status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def daily_summary(self, request):
        date_str = request.query_params.get('date')
        if date_str:
            from datetime import datetime
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
        else:
            date = timezone.now().date()

        records = AttendanceRecord.objects.filter(date=date)
        if request.user.role not in ('admin', 'supervisor'):
            records = records.filter(user=request.user)
        elif request.user.role == 'supervisor':
            intern_ids = SupervisorAssignment.objects.filter(
                supervisor=request.user
            ).values_list('intern_id', flat=True)
            records = records.filter(user_id__in=intern_ids)

        serializer = AttendanceRecordSerializer(records, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def weekly_summary(self, request):
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=6)

        queryset = AttendanceRecord.objects.filter(date__range=[start_date, end_date])
        if request.user.role not in ('admin', 'supervisor'):
            queryset = queryset.filter(user=request.user)

        summary = queryset.values('status').annotate(count=Count('id'))
        total = sum(s['count'] for s in summary)

        summary_dict = {
            'total_days': total,
            'present_days': next((s['count'] for s in summary if s['status'] == 'present'), 0),
            'absent_days': next((s['count'] for s in summary if s['status'] == 'absent'), 0),
            'late_days': next((s['count'] for s in summary if s['status'] == 'late'), 0),
            'excused_days': next((s['count'] for s in summary if s['status'] == 'excused'), 0),
            'attendance_rate': round((next((s['count'] for s in summary if s['status'] == 'present'), 0) / total * 100) if total > 0 else 0, 1),
        }

        serializer = AttendanceSummarySerializer(summary_dict)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def today_status(self, request):
        """Get the current user's attendance status for today."""
        today = timezone.now().date()
        try:
            record = AttendanceRecord.objects.get(user=request.user, date=today)
            return Response({
                'date': str(today),
                'check_in': str(record.check_in) if record.check_in else None,
                'check_out': str(record.check_out) if record.check_out else None,
                'status': record.status,
                'checked_in': bool(record.check_in),
                'checked_out': bool(record.check_out),
                'period': 'AM' if (record.check_in and record.check_in < self.CUTOFF_TIME) else 'PM',
            })
        except AttendanceRecord.DoesNotExist:
            return Response({
                'date': str(today),
                'check_in': None,
                'check_out': None,
                'status': None,
                'checked_in': False,
                'checked_out': False,
                'period': None,
            })

    # ── QR Code Actions ──────────────────────────────────────────

    @action(detail=False, methods=['post'], permission_classes=[IsAdminOrSupervisor])
    def generate_qr(self, request):
        """Generate a new QR token for today.
        Optional 'period' param: 'AM' (default, valid all day) or 'PM' (afternoon check-out window)."""
        today = timezone.now().date()
        period = request.data.get('period', 'AM').upper()

        # Both AM and PM tokens are valid all day, but PM is for afternoon check-out
        expires_at = timezone.make_aware(
            timezone.datetime.combine(today, time(23, 59, 59))
        )

        # Deactivate any previous active tokens for today
        QRToken.objects.filter(valid_date=today, is_active=True).update(is_active=False)

        # Create new token
        qr_token = QRToken.objects.create(
            created_by=request.user,
            valid_date=today,
            expires_at=expires_at,
        )

        serializer = QRTokenSerializer(qr_token)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def qr_scan(self, request):
        """Scan a QR token to check in or check out.
        1st scan = check-in at 8:30 AM, 2nd scan = check-out at 5:00 PM.
        The time of day only affects the period label (AM/PM), not the recorded times."""
        serializer = QRScanSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        token_value = serializer.validated_data['token']
        today = timezone.now().date()
        now = timezone.now()
        current_time = now.time()

        # Validate the QR token
        try:
            qr_token = QRToken.objects.get(token=token_value)
        except QRToken.DoesNotExist:
            return Response({'error': 'Invalid QR code'}, status=status.HTTP_400_BAD_REQUEST)

        if not qr_token.is_active:
            return Response({'error': 'This QR code has been deactivated'}, status=status.HTTP_400_BAD_REQUEST)

        if qr_token.valid_date != today:
            return Response({'error': 'This QR code is not valid for today'}, status=status.HTTP_400_BAD_REQUEST)

        if now > qr_token.expires_at:
            return Response({'error': 'This QR code has expired'}, status=status.HTTP_400_BAD_REQUEST)

        # Increment scan count
        qr_token.scan_count += 1
        qr_token.save(update_fields=['scan_count'])

        # Determine period label based on current time
        period = 'AM' if current_time < self.CUTOFF_TIME else 'PM'

        # 1st scan = check in at 8:30 AM, 2nd scan = check out at 5:00 PM
        try:
            record = AttendanceRecord.objects.get(user=request.user, date=today)
        except AttendanceRecord.DoesNotExist:
            # No record yet → first scan → check in at 8:30 AM
            record = AttendanceRecord.objects.create(
                user=request.user,
                date=today,
                check_in=self.CHECK_IN_TIME,
                status='present'
            )
            action = 'checked_in'
        else:
            if not record.check_in:
                # Haven't checked in yet → check in at 8:30 AM
                record.check_in = self.CHECK_IN_TIME
                record.status = 'present'
                record.save()
                action = 'checked_in'
            elif not record.check_out:
                # Already checked in, not checked out → check out at 5:00 PM
                record.check_out = self.CHECK_OUT_TIME
                record.save()
                action = 'checked_out'
            else:
                # Already completed both
                return Response(
                    {'error': 'You have already completed attendance for today (checked in and out)'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        result_serializer = AttendanceRecordSerializer(record)
        response_data = result_serializer.data
        response_data['period'] = period
        response_data['action'] = action
        return Response(response_data)

    @action(detail=False, methods=['get'], permission_classes=[IsAdminOrSupervisor])
    def active_qr(self, request):
        """Get the currently active QR token for today."""
        today = timezone.now().date()
        try:
            qr_token = QRToken.objects.get(valid_date=today, is_active=True)
            serializer = QRTokenSerializer(qr_token)
            return Response(serializer.data)
        except QRToken.DoesNotExist:
            return Response({'active': False, 'message': 'No active QR code for today'})

    @action(detail=False, methods=['post'], permission_classes=[IsAdminOrSupervisor])
    def deactivate_qr(self, request):
        """Deactivate the current active QR token."""
        today = timezone.now().date()
        updated = QRToken.objects.filter(valid_date=today, is_active=True).update(is_active=False)
        if updated:
            return Response({'message': 'QR code deactivated successfully'})
        return Response({'message': 'No active QR code to deactivate'})

    filterset_fields = ['date', 'status', 'user']
    ordering = ['-date']