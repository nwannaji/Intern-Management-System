from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from .models import User, Profile, PasswordResetToken
from .serializers import (UserSerializer, RegistrationSerializer, LoginSerializer, 
                         PasswordChangeSerializer, ProfileSerializer,
                         PasswordResetRequestSerializer, PasswordResetConfirmSerializer)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def ensure_test_user(request):
    """Ensure test user exists with correct credentials"""
    try:
        from django.contrib.auth import authenticate
        from django.contrib.auth import get_user_model
        from rest_framework.authtoken.models import Token
        
        User = get_user_model()
        
        # Create or update test user
        user, created = User.objects.get_or_create(
            email='edenwannaji1980@gmail.com',
            defaults={
                'username': 'edenwannaji1980',
                'first_name': 'Admin',
                'last_name': 'User',
                'role': 'admin',
                'is_staff': True,
                'is_superuser': True,
                'is_active': True,
            }
        )
        
        if created:
            user.set_password('@admin123')
            user.save()
            message = 'Test user created successfully'
        else:
            # Update password and ensure active
            user.set_password('@admin123')
            user.is_active = True
            user.save()
            message = 'Test user updated successfully'
        
        # Test authentication
        auth_user = authenticate(username='edenwannaji1980@gmail.com', password='@admin123')
        
        # Get or create token
        token, token_created = Token.objects.get_or_create(user=user)
        
        return Response({
            'success': True,
            'message': message,
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role,
                'is_active': user.is_active,
                'is_staff': user.is_staff,
            },
            'auth_test': {
                'can_authenticate': auth_user is not None,
                'token': token.key,
                'token_created': token_created
            },
            'credentials': {
                'email': 'edenwannaji1980@gmail.com',
                'password': '@admin123'
            }
        })
        
    except Exception as e:
        return Response({
            'error': str(e),
            'debug': 'Failed to ensure test user'
        }, status=500)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def simple_login(request):
    """Simple login endpoint for debugging"""
    try:
        from django.contrib.auth import authenticate
        from rest_framework.authtoken.models import Token
        
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({
                'error': 'Email and password are required'
            }, status=400)
        
        # Authenticate user
        user = authenticate(username=email, password=password)
        
        if user:
            # Get or create token
            token, created = Token.objects.get_or_create(user=user)
            
            return Response({
                'success': True,
                'token': token.key,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': user.role,
                    'is_staff': user.is_staff,
                    'is_superuser': user.is_superuser
                }
            })
        else:
            return Response({
                'error': 'Invalid credentials',
                'debug': 'Authentication failed'
            }, status=400)
            
    except Exception as e:
        return Response({
            'error': str(e),
            'debug': 'Exception occurred'
        }, status=500)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def debug_auth(request):
    """Debug authentication issues"""
    try:
        from django.contrib.auth import authenticate
        from .models import User
        
        email = 'edenwannaji1980@gmail.com'
        password = '@admin123'
        
        # Check if user exists
        try:
            user = User.objects.get(email=email)
            user_info = {
                'exists': True,
                'email': user.email,
                'is_active': user.is_active,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
                'username': user.username,
                'password_check': user.check_password(password)
            }
        except User.DoesNotExist:
            user_info = {'exists': False}
        
        # Test authentication
        auth_user = authenticate(username=email, password=password)
        auth_result = {
            'authenticated': auth_user is not None,
            'auth_user_email': auth_user.email if auth_user else None
        }
        
        return Response({
            'user_info': user_info,
            'auth_result': auth_result,
            'credentials_tested': {
                'email': email,
                'password': password
            }
        })
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=400)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def create_test_user(request):
    """Create a test user for development"""
    try:
        # First, ensure database tables exist
        from django.core.management import call_command
        call_command('migrate', verbosity=0, interactive=False)
        
        user, created = User.objects.get_or_create(
            email='edenwannaji1980@gmail.com',
            defaults={
                'first_name': 'Henry',
                'last_name': 'Nwatu',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        
        if created:
            user.set_password('@admin123')
            user.save()
            return Response({
                'message': 'Test user created successfully in PostgreSQL',
                'email': 'edenwannaji1980@gmail.com',
                'password': '@admin123',
                'database': 'PostgreSQL'
            })
        else:
            # Update password for existing user
            user.set_password('@admin123')
            user.save()
            return Response({
                'message': 'Test user password updated in PostgreSQL',
                'email': 'edenwannaji1980@gmail.com',
                'password': '@admin123',
                'database': 'PostgreSQL'
            })
    except Exception as e:
        return Response({
            'error': str(e),
            'database': 'PostgreSQL connection failed'
        }, status=400)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_admin(request):
    """Register a new admin user"""
    try:
        from django.contrib.auth import get_user_model
        from rest_framework.authtoken.models import Token
        
        User = get_user_model()
        
        email = request.data.get('email')
        password = request.data.get('password')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        username = request.data.get('username', email.split('@')[0] if email else '')
        
        if not email or not password:
            return Response({
                'error': 'Email and password are required'
            }, status=400)
        
        # Check if user already exists
        if User.objects.filter(email=email).exists():
            return Response({
                'error': 'User with this email already exists'
            }, status=400)
        
        # Create admin user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            role='admin'  # Set role to admin
        )
        
        # Create token
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'success': True,
            'message': 'Admin user created successfully',
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role,
                'username': user.username
            },
            'token': token.key
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'error': str(e),
            'debug': 'Admin registration failed'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def create_sample_document_types(request):
    """Create sample document types using the management command"""
    try:
        from django.core.management import call_command
        
        # Run the create_sample_document_types management command
        call_command('create_sample_document_types', verbosity=1)
        
        return Response({
            'success': True,
            'message': 'Sample document types created successfully in production database'
        })
        
    except Exception as e:
        return Response({
            'error': str(e),
            'debug': 'Failed to create sample document types'
        }, status=500)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def create_sample_programs(request):
    """Create sample programs using the management command"""
    try:
        from django.core.management import call_command
        
        # Run the create_sample_programs management command
        call_command('create_sample_programs', verbosity=1)
        
        return Response({
            'success': True,
            'message': 'Sample programs created successfully in production database'
        })
        
    except Exception as e:
        return Response({
            'error': str(e),
            'debug': 'Failed to create sample programs'
        }, status=500)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register(request):
    """Registration endpoint with simple implementation"""
    try:
        from django.contrib.auth import get_user_model
        from rest_framework.authtoken.models import Token
        
        User = get_user_model()
        
        email = request.data.get('email')
        password = request.data.get('password')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        username = request.data.get('username', email.split('@')[0] if email else '')
        
        if not email or not password:
            return Response({
                'error': 'Email and password are required'
            }, status=400)
        
        # Check if user already exists
        if User.objects.filter(email=email).exists():
            return Response({
                'error': 'User with this email already exists'
            }, status=400)
        
        # Create user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            role='intern'
        )
        
        # Create token
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role,
                'username': user.username
            },
            'token': token.key
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'error': str(e),
            'debug': 'Registration failed'
        }, status=status.HTTP_400_BAD_REQUEST)


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
    except:
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


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def password_reset_request(request):
    """Request password reset email"""
    serializer = PasswordResetRequestSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        
        try:
            user = User.objects.get(email=email)
            
            # Invalidate any existing tokens for this user
            PasswordResetToken.objects.filter(user=user, is_used=False).update(is_used=True)
            
            # Create new reset token
            reset_token = PasswordResetToken.objects.create(
                user=user,
                expires_at=timezone.now() + timedelta(hours=1)  # Token valid for 1 hour
            )
            
            # Send reset email
            reset_url = f"{settings.FRONTEND_URL}/reset-password/{reset_token.token}/"
            
            subject = "Password Reset Request - Intern Management System"
            message = f"""
Hello {user.first_name},

You requested a password reset for your Intern Management System account.

Click the link below to reset your password:
{reset_url}

This link will expire in 1 hour for security reasons.

If you didn't request this password reset, please ignore this email. Your password will remain unchanged.

Best regards,
Intern Management System Team
            """
            
            try:
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[email],
                    fail_silently=False,
                )
            except Exception as e:
                # Log email error but don't reveal to user
                print(f"Failed to send password reset email: {e}")
                return Response({
                    'message': 'If an account with this email exists, a password reset link has been sent.'
                }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            # Don't reveal if email exists or not for security
            pass
        
        return Response({
            'message': 'If an account with this email exists, a password reset link has been sent.'
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def password_reset_confirm(request):
    """Confirm password reset with token"""
    serializer = PasswordResetConfirmSerializer(data=request.data)
    if serializer.is_valid():
        reset_token = serializer.validated_data['reset_token']
        new_password = serializer.validated_data['new_password']
        
        # Change user password
        user = reset_token.user
        user.set_password(new_password)
        user.save()
        
        # Mark token as used
        reset_token.expire()
        
        # Invalidate all user tokens to force re-login
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
            return Response({
                'valid': True,
                'message': 'Token is valid'
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'valid': False,
                'message': 'Token has expired or been used'
            }, status=status.HTTP_400_BAD_REQUEST)
    except PasswordResetToken.DoesNotExist:
        return Response({
            'valid': False,
            'message': 'Invalid token'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def debug_password_reset(request):
    """Debug endpoint to check if password reset views are loaded"""
    return Response({
        'message': 'Password reset views are loaded',
        'endpoints': [
            '/auth/password-reset/',
            '/auth/password-reset/confirm/',
            '/auth/password-reset/validate/<token>/'
        ]
    }, status=status.HTTP_200_OK)
