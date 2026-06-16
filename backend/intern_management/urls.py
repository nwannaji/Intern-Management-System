from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/', include('applications.urls')),
    path('api/', include('documents.urls')),
    path('api/', include('notifications.urls')),
    path('api/', include('attendance.urls')),
    path('api/', include('leave.urls')),
    path('api/', include('tasks.urls')),
    path('api/', include('reviews.urls')),
    path('api/', include('onboarding.urls')),
    path('api/', include('reports.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)