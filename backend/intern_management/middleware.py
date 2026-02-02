from django.utils.deprecation import MiddlewareMixin
from django.http import HttpResponse
from django.conf import settings


class DynamicCorsMiddleware(MiddlewareMixin):
    """
    Custom CORS middleware to handle dynamic Vercel deployment URLs
    """
    
    def process_response(self, request, response):
        origin = request.META.get('HTTP_ORIGIN')
        
        # Check if origin is allowed
        if self.is_allowed_origin(origin):
            response['Access-Control-Allow-Origin'] = origin
            response['Access-Control-Allow-Credentials'] = 'true'
            
            # Handle preflight requests
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
                response['Access-Control-Max-Age'] = '86400'  # 24 hours
        
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
        
        # Check if it's a Vercel deployment
        if (
            'vercel.app' in origin or 
            origin.endswith('.vercel.app') or
            'localhost' in origin or
            '127.0.0.1' in origin
        ):
            return True
        
        # Allow all origins in development
        if getattr(settings, 'DEBUG', False):
            return True
        
        return False
