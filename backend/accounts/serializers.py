from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Profile, PasswordResetToken, SupervisorAssignment


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['profile_picture', 'bio', 'linkedin_url', 'github_url']
        read_only_fields = ['user']


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    is_supervisor = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role',
                 'phone_number', 'date_of_birth', 'address', 'profile', 'is_supervisor', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_is_supervisor(self, obj):
        return obj.role == 'supervisor'


class UserListSerializer(serializers.ModelSerializer):
    """Serializer for admin user management list view."""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role',
                 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class UserRoleUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating a user's role (admin only)."""
    class Meta:
        model = User
        fields = ['role', 'is_active']


class SupervisorAssignmentSerializer(serializers.ModelSerializer):
    supervisor_name = serializers.CharField(source='supervisor.get_full_name', read_only=True)
    intern_name = serializers.CharField(source='intern.get_full_name', read_only=True)
    program_name = serializers.CharField(source='program.name', read_only=True)

    class Meta:
        model = SupervisorAssignment
        fields = ['id', 'supervisor', 'intern', 'program', 'assigned_at', 'assigned_by',
                 'supervisor_name', 'intern_name', 'program_name']
        read_only_fields = ['id', 'assigned_at', 'assigned_by']

    def validate(self, attrs):
        supervisor = attrs.get('supervisor')
        intern = attrs.get('intern')
        if supervisor and supervisor.role != 'supervisor':
            raise serializers.ValidationError({'supervisor': 'Selected user is not a supervisor'})
        if intern and intern.role != 'intern':
            raise serializers.ValidationError({'intern': 'Selected user is not an intern'})
        return attrs

    def create(self, validated_data):
        validated_data['assigned_by'] = self.context['request'].user
        return super().create(validated_data)


class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name',
                 'phone_number', 'date_of_birth', 'address', 'password', 'password_confirm']
        extra_kwargs = {
            'password': {'write_only': True},
            'password_confirm': {'write_only': True},
            'date_of_birth': {'required': False, 'allow_null': True},
            'phone_number': {'required': False, 'allow_blank': True},
            'address': {'required': False, 'allow_blank': True},
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs

    def validate_date_of_birth(self, value):
        if value and isinstance(value, str):
            if value.strip() == '':
                return None
            try:
                from datetime import datetime
                for fmt in ['%Y-%m-%d', '%d/%m/%Y', '%m/%d/%Y']:
                    try:
                        return datetime.strptime(value, fmt).date()
                    except ValueError:
                        continue
                return None
            except Exception:
                return None
        return value

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        validated_data['role'] = 'intern'
        try:
            user = User.objects.create_user(**validated_data)
            Profile.objects.create(user=user)
            return user
        except Exception as e:
            raise serializers.ValidationError(f"User creation failed: {str(e)}")


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Must include email and password')

        return attrs


class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField()
    new_password = serializers.CharField(min_length=8)
    new_password_confirm = serializers.CharField()

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords don't match")
        return attrs

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect")
        return value


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            user = User.objects.get(email=value)
            if not user.is_active:
                raise serializers.ValidationError("This account is not active")
        except User.DoesNotExist:
            pass
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.UUIDField()
    new_password = serializers.CharField(min_length=8)
    new_password_confirm = serializers.CharField()

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("Passwords don't match")

        token = attrs.get('token')
        try:
            reset_token = PasswordResetToken.objects.get(token=token)
            if not reset_token.is_valid():
                raise serializers.ValidationError("Invalid or expired reset token")
        except PasswordResetToken.DoesNotExist:
            raise serializers.ValidationError("Invalid reset token")

        attrs['reset_token'] = reset_token
        return attrs

    def validate_new_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long")
        if not any(c.isdigit() for c in value):
            raise serializers.ValidationError("Password must contain at least one digit")
        if not any(c.isupper() for c in value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter")
        if not any(c.islower() for c in value):
            raise serializers.ValidationError("Password must contain at least one lowercase letter")
        return value