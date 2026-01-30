from django.urls import path
from . import views

urlpatterns = [
    path('debug-auth/', views.debug_auth, name='debug_auth'),
    path('create-test-user/', views.create_test_user, name='create_test_user'),
    path('register/', views.register, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.profile, name='profile'),
    path('profile/details/', views.profile_details, name='profile_details'),
    path('change-password/', views.change_password, name='change_password'),
]
