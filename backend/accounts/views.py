from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from intern_management.permissions import IsAdmin, IsAdminOrSupervisor
from .models import User, Profile, PasswordResetToken, SupervisorAssignment
from .serializers import (
    UserSerializer, UserListSerializer, UserRoleUpdateSerializer,
    RegistrationSerializer, LoginSerializer, PasswordChangeSerializer,
    ProfileSerializer, PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    SupervisorAssignmentSerializer
)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register(request):
    """Registration endpoint for interns"""
    try:
        email = request.data.get('email')
        password = request.data.get('password')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        username = request.data.get('username', email.split('@')[0] if email else '')

        if not email or not password:
            return Response({'error': 'Email and password are required'}, status=400)

        if User.objects.filter(email=email).exists():
            return Response({'error': 'User with this email already exists'}, status=400)

        user = User.objects.create_user(
            username=username, email=email, password=password,
            first_name=first_name, last_name=last_name, role='intern'
        )
        token, created = Token.objects.get_or_create(user=user)

        return Response({
            'user': UserSerializer(user).data,
            'token': token.key
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        login(request, user)
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key
        }, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    try:
        request.user.auth_token.delete()
    except Exception:
        pass
    logout(request)
    return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)


@api_view(['GET', 'PUT'])
@permission_classes([permissions.IsAuthenticated])
def profile(request):
    if request.method == 'GET':
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT'])
@permission_classes([permissions.IsAuthenticated])
def profile_details(request):
    try:
        profile = request.user.profile
    except Profile.DoesNotExist:
        profile = Profile.objects.create(user=request.user)

    if request.method == 'GET':
        serializer = ProfileSerializer(profile)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ==================== User Management (Admin) ====================

@api_view(['GET'])
@permission_classes([IsAdmin])
def list_users(request):
    """List all users (admin only)"""
    users = User.objects.all().order_by('-created_at')
    role_filter = request.query_params.get('role')
    if role_filter:
        users = users.filter(role=role_filter)
    serializer = UserListSerializer(users, many=True)
    return Response(serializer.data)


@api_view(['PUT'])
@permission_classes([IsAdmin])
def update_user_role(request, user_id):
    """Update a user's role (admin only)"""
    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = UserRoleUpdateSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(UserSerializer(user).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAdmin])
def deactivate_user(request, user_id):
    """Deactivate a user account (admin only)"""
    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    if user == request.user:
        return Response({'error': 'Cannot deactivate your own account'}, status=status.HTTP_400_BAD_REQUEST)

    user.is_active = not user.is_active
    user.save()
    status_text = 'deactivated' if not user.is_active else 'activated'
    return Response({'message': f'User {status_text} successfully'})


# ==================== Supervisor Assignments ====================

@api_view(['GET', 'POST'])
@permission_classes([IsAdminOrSupervisor])
def supervisor_assignments(request):
    """List or create supervisor assignments"""
    if request.method == 'GET':
        assignments = SupervisorAssignment.objects.all()
        # Filter by supervisor if user is a supervisor
        if request.user.role == 'supervisor':
            assignments = assignments.filter(supervisor=request.user)
        serializer = SupervisorAssignmentSerializer(assignments, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = SupervisorAssignmentSerializer(
            data=request.data, context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_supervisor_interns(request):
    """List interns available for task assignment.

    For supervisors: returns their assigned interns (or all active interns
    as a fallback if no assignments exist yet, so the dropdown is never empty).
    For admins: returns all active interns.
    """
    if request.user.role not in ('supervisor', 'admin'):
        return Response({'error': 'Only supervisors and admins can view this'},
                       status=status.HTTP_403_FORBIDDEN)

    if request.user.role == 'admin':
        interns = User.objects.filter(role='intern', is_active=True).order_by('first_name', 'last_name')
    else:
        # Get intern IDs from supervisor assignments
        intern_ids = SupervisorAssignment.objects.filter(
            supervisor=request.user
        ).values_list('intern_id', flat=True)

        if intern_ids:
            interns = User.objects.filter(
                id__in=intern_ids, is_active=True
            ).order_by('first_name', 'last_name')
        else:
            # Fallback: if no assignments exist yet, show all active interns
            # so the supervisor can still assign tasks
            interns = User.objects.filter(role='intern', is_active=True).order_by('first_name', 'last_name')

    serializer = UserListSerializer(interns, many=True)
    return Response(serializer.data)


# ==================== Password Reset ====================

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def password_reset_request(request):
    """Request password reset email"""
    try:
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']

            try:
                user = User.objects.get(email=email)
                PasswordResetToken.objects.filter(user=user, is_used=False).update(is_used=True)
                reset_token = PasswordResetToken.objects.create(
                    user=user,
                    expires_at=timezone.now() + timedelta(hours=1)
                )

                reset_url = f"{settings.FRONTEND_URL}/reset-password/{reset_token.token}/"
                subject = "Password Reset Request - Intern Management System"
                message = f"""
Hello {user.first_name},

You requested a password reset for your Intern Management System account.

Click the link below to reset your password:
{reset_url}

This link will expire in 1 hour for security reasons.

If you didn't request this password reset, please ignore this email.

Best regards,
Intern Management System Team
                """

                try:
                    send_mail(
                        subject=subject, message=message,
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[email], fail_silently=False,
                    )
                except Exception:
                    pass

            except User.DoesNotExist:
                pass

            return Response({
                'message': 'If an account with this email exists, a password reset link has been sent.'
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Exception:
        return Response({
            'message': 'If an account with this email exists, a password reset link has been sent.'
        }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def password_reset_confirm(request):
    """Confirm password reset with token"""
    serializer = PasswordResetConfirmSerializer(data=request.data)
    if serializer.is_valid():
        reset_token = serializer.validated_data['reset_token']
        new_password = serializer.validated_data['new_password']

        user = reset_token.user
        user.set_password(new_password)
        user.save()
        reset_token.expire()
        Token.objects.filter(user=user).delete()

        return Response({
            'message': 'Password has been reset successfully. Please login with your new password.'
        }, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def validate_reset_token(request, token):
    """Validate if a reset token is still valid"""
    try:
        reset_token = PasswordResetToken.objects.get(token=token)
        if reset_token.is_valid():
            return Response({'valid': True, 'message': 'Token is valid'}, status=status.HTTP_200_OK)
        else:
            return Response({'valid': False, 'message': 'Token has expired or been used'},
                          status=status.HTTP_400_BAD_REQUEST)
    except PasswordResetToken.DoesNotExist:
        return Response({'valid': False, 'message': 'Invalid token'}, status=status.HTTP_404_NOT_FOUND)