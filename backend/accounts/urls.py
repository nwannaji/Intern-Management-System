from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('register/', views.register, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),

    # Profile
    path('profile/', views.profile, name='profile'),
    path('profile/details/', views.profile_details, name='profile_details'),
    path('change-password/', views.change_password, name='change_password'),

    # Password Reset
    path('password-reset/', views.password_reset_request, name='password_reset_request'),
    path('password-reset/confirm/', views.password_reset_confirm, name='password_reset_confirm'),
    path('password-reset/validate/<uuid:token>/', views.validate_reset_token, name='validate_reset_token'),

    # User Management (Admin)
    path('users/', views.list_users, name='list_users'),
    path('users/<int:user_id>/role/', views.update_user_role, name='update_user_role'),
    path('users/<int:user_id>/deactivate/', views.deactivate_user, name='deactivate_user'),

    # Supervisor Assignments
    path('supervisor-assignments/', views.supervisor_assignments, name='supervisor_assignments'),
    path('my-supervisor-interns/', views.my_supervisor_interns, name='my_supervisor_interns'),
]