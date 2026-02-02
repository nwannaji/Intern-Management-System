from django.urls import path
from . import views

urlpatterns = [
    path('simple-login/', views.simple_login, name='simple_login'),
    path('ensure-test-user/', views.ensure_test_user, name='ensure_test_user'),
    path('register-admin/', views.register_admin, name='register_admin'),
    path('create-sample-document-types/', views.create_sample_document_types, name='create_sample_document_types'),
    path('create-sample-programs/', views.create_sample_programs, name='create_sample_programs'),
    path('debug-auth/', views.debug_auth, name='debug_auth'),
    path('create-test-user/', views.create_test_user, name='create_test_user'),
    path('register/', views.register, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.profile, name='profile'),
    path('profile/details/', views.profile_details, name='profile_details'),
    path('change-password/', views.change_password, name='change_password'),
]
