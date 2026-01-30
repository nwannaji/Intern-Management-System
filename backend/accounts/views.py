from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout
from .models import User, Profile
from .serializers import UserSerializer, RegistrationSerializer, LoginSerializer, PasswordChangeSerializer, ProfileSerializer


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
