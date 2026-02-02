from pathlib import Path
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config('SECRET_KEY', default='cze+g6yznek*hed5rn^qjhw=^-86im!8^fo*fk+q)%r#&#%%86')

DEBUG = config('DEBUG', default=True, cast=bool)

# Get allowed hosts from environment variable or use defaults
import os
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1,0.0.0.0,testserver,.onrender.com,intern-management-backend-gi46.onrender.com').split(',')

DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'django_filters',
]

LOCAL_APPS = [
    'accounts',
    'applications',
    'documents',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'intern_management.middleware.DynamicCorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'intern_management.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'intern_management.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME', default='intern_management_db'),
        'USER': config('DB_USER', default='intern_management_user'),
        'PASSWORD': config('DB_PASSWORD', default=''),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432', cast=int),
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Africa/Lagos'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

AUTH_USER_MODEL = 'accounts.User'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
}

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:54162",
    "http://172.16.2.78:5174",
    "https://intern-management-app-nwannaji.vercel.app",
    "https://intern-management-system-three.vercel.app",
    "https://intern-management-system-5q9u-a7vf2u0bb.vercel.app",
    "https://intern-management-system-5q9u.vercel.app",
    "https://intern-management-system-5q9u-4bopiaod8.vercel.app",
    "https://intern-management-system-5q9u-1gbhyx1dm.vercel.app",
    "https://*.vercel.app",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
    "http://127.0.0.1:59484",
    "http://localhost:59484",
    "http://127.0.0.1:51302",
]

CORS_ALLOW_CREDENTIALS = True

# Allow all origins for development (remove in production)
CORS_ALLOW_ALL_ORIGINS = DEBUG

# Custom CORS middleware to handle dynamic Vercel origins
def is_vercel_origin(origin):
    """Check if origin is a Vercel deployment"""
    if not origin:
        return False
    return (
        'vercel.app' in origin or 
        origin.endswith('.vercel.app') or
        'localhost' in origin or
        '127.0.0.1' in origin
    )

# Custom CORS whitelist
CORS_ORIGIN_WHITELIST = [
    "https://intern-management-app-nwannaji.vercel.app",
    "https://intern-management-system-three.vercel.app", 
    "https://intern-management-system-5q9u-a7vf2u0bb.vercel.app",
    "https://intern-management-system-5q9u.vercel.app",
    "https://intern-management-system-5q9u-4bopiaod8.vercel.app",
    "https://intern-management-system-5q9u-1gbhyx1dm.vercel.app",
]

# Additional CORS settings
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = config('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=True, cast=bool)
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')

CELERY_BROKER_URL = config('REDIS_URL', default='redis://localhost:6379/0')
CELERY_RESULT_BACKEND = config('REDIS_URL', default='redis://localhost:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE

# Auto-seed document types if they don't exist
def seed_document_types():
    from documents.models import DocumentType
    
    if DocumentType.objects.count() == 0:
        DocumentType.objects.get_or_create(
            name='School Recommendation Letter',
            defaults={
                'description': 'Recommendation letter from your school supporting your application',
                'is_required': True,
                'max_file_size': 5242880,  # 5MB
                'allowed_extensions': 'pdf,doc,docx,jpg,jpeg,png'
            }
        )
        
        DocumentType.objects.get_or_create(
            name='NYSC Orientation Camp Letter',
            defaults={
                'description': 'Letter showing completion of 3 weeks NYSC orientation camp',
                'is_required': True,
                'max_file_size': 5242880,  # 5MB
                'allowed_extensions': 'pdf,doc,docx,jpg,jpeg,png'
            }
        )

# Auto-seed on startup (only in production or when explicitly requested)
if not DEBUG or config('SEED_DOCUMENT_TYPES', default=False, cast=bool):
    try:
        seed_document_types()
    except Exception:
        # Silently fail if database is not ready yet
        pass
