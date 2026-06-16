from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """Allow access only to admin users."""

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'


class IsSupervisor(permissions.BasePermission):
    """Allow access only to supervisor users."""

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'supervisor'


class IsAdminOrSupervisor(permissions.BasePermission):
    """Allow access only to admin or supervisor users."""

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role in ('admin', 'supervisor')


class IsOwnerOrAdmin(permissions.BasePermission):
    """Allow access to the object owner or admin users."""

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        # Check if obj has a user or applicant field that matches the request user
        owner = getattr(obj, 'user', None) or getattr(obj, 'applicant', None)
        return owner == request.user