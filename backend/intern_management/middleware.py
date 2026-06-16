import re
from django.utils.deprecation import MiddlewareMixin
from django.conf import settings


class DynamicCorsMiddleware(MiddlewareMixin):
    """
    Custom CORS middleware to handle dynamic Vercel deployment URLs.
    Uses explicit allowlist from CORS_ALLOWED_ORIGINS and CORS_ORIGIN_WHITELIST.
    """

    # Match Vercel preview URLs for the known project: intern-management-system-5q9u-*.vercel.app
    VERCEL_PREVIEW_PATTERN = re.compile(
        r'^https://intern-management-system-[a-z0-9-]+\.vercel\.app$'
    )

    # Match private/LAN network IPs for mobile testing (10.x, 172.16-31.x, 192.168.x)
    LAN_IP_PATTERN = re.compile(
        r'^http://(10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|192\.168\.\d+\.\d+):\d+'
    )

    def process_response(self, request, response):
        origin = request.META.get('HTTP_ORIGIN')

        if self.is_allowed_origin(origin):
            response['Access-Control-Allow-Origin'] = origin
            response['Access-Control-Allow-Credentials'] = 'true'

            if request.method == 'OPTIONS':
                response['Access-Control-Allow-Methods'] = ', '.join(
                    getattr(settings, 'CORS_ALLOW_METHODS', [
                        'DELETE', 'GET', 'OPTIONS', 'PATCH', 'POST', 'PUT'
                    ])
                )
                response['Access-Control-Allow-Headers'] = ', '.join(
                    getattr(settings, 'CORS_ALLOW_HEADERS', [
                        'accept', 'accept-encoding', 'authorization',
                        'content-type', 'dnt', 'origin', 'user-agent',
                        'x-csrftoken', 'x-requested-with'
                    ])
                )
                response['Access-Control-Max-Age'] = '86400'

        return response

    def is_allowed_origin(self, origin):
        """Check if the origin is allowed"""
        if not origin:
            return False

        # Check explicit whitelist
        whitelist = getattr(settings, 'CORS_ORIGIN_WHITELIST', [])
        if origin in whitelist:
            return True

        # Check allowed origins list
        allowed_origins = getattr(settings, 'CORS_ALLOWED_ORIGINS', [])
        if origin in allowed_origins:
            return True

        # Check if it's a Vercel preview deployment for this project
        if self.VERCEL_PREVIEW_PATTERN.match(origin):
            return True

        # Check additional origins from environment variable
        extra_origins = getattr(settings, 'CORS_EXTRA_ORIGINS', '')
        if extra_origins:
            for extra in extra_origins.split(','):
                extra = extra.strip()
                if extra and origin == extra:
                    return True

        # Allow localhost and LAN IPs in development only
        if getattr(settings, 'DEBUG', False):
            if origin.startswith('http://localhost:') or origin.startswith('http://127.0.0.1:'):
                return True
            # Allow LAN/private network IPs (10.x, 172.16-31.x, 192.168.x) for mobile testing
            if self.LAN_IP_PATTERN.match(origin):
                return True

        return False