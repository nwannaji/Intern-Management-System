from django.core.management.base import BaseCommand
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth import get_user_model
from documents.models import DocumentType, Document
from applications.models import Application
from rest_framework.test import APIClient
from rest_framework import status
import json

User = get_user_model()

class Command(BaseCommand):
    help = 'Test actual API call like frontend would make'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🌐 Testing API Call Like Frontend'))
        self.stdout.write('=' * 50)

        try:
            # Setup
            user = User.objects.filter(role__in=['applicant', 'intern']).first()
            application = Application.objects.filter(applicant=user).order_by('-submitted_at').first()
            doc_type = DocumentType.objects.first()

            # Clear existing documents
            Document.objects.filter(application=application).delete()

            self.stdout.write(f'Test Setup:')
            self.stdout.write(f'  User: {user.username} (ID: {user.id})')
            self.stdout.write(f'  Application: {application.id}')
            self.stdout.write(f'  Document Type: {doc_type.name} (ID: {doc_type.id})')

            # Create API client and authenticate
            client = APIClient()
            
            # Get auth token (simulate frontend login)
            from rest_framework.authtoken.models import Token
            token, created = Token.objects.get_or_create(user=user)
            client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

            self.stdout.write(f'  Auth Token: {token.key[:10]}...')

            # Create test file
            test_file = SimpleUploadedFile(
                "school_recommendation.pdf",
                b"test pdf content for school recommendation from frontend",
                content_type="application/pdf"
            )

            # Make API call exactly like frontend
            self.stdout.write(f'\n🎯 Making API Call...')
            
            # Prepare data like frontend FormData
            data = {
                'application_id': str(application.id),
                'document_type': str(doc_type.id),
                'file': test_file
            }

            response = client.post('/api/documents/', data, format='multipart')

            self.stdout.write(f'Response Status: {response.status_code}')
            self.stdout.write(f'Response Headers: {dict(response.headers)}')

            if response.status_code == status.HTTP_201_CREATED:
                self.stdout.write('✅ API call successful!')
                self.stdout.write(f'Response Data: {response.data}')
                
                # Verify document was created
                doc = Document.objects.get(id=response.data['id'])
                self.stdout.write(f'Verified Document:')
                self.stdout.write(f'  ID: {doc.id}')
                self.stdout.write(f'  File: {doc.file_name}')
                self.stdout.write(f'  Size: {doc.file_size}')
                self.stdout.write(f'  Application: {doc.application.id}')
                self.stdout.write(f'  Document Type: {doc.document_type.name}')
                
            else:
                self.stdout.write('❌ API call failed!')
                self.stdout.write(f'Error Response: {response.data}')
                
                # Try to get more details
                if hasattr(response, 'content'):
                    self.stdout.write(f'Raw Content: {response.content}')

            # Test duplicate prevention
            self.stdout.write(f'\n🎯 Testing duplicate prevention...')
            test_file2 = SimpleUploadedFile(
                "another_document.pdf",
                b"another document content",
                content_type="application/pdf"
            )
            
            data2 = {
                'application_id': str(application.id),
                'document_type': str(doc_type.id),
                'file': test_file2
            }

            response2 = client.post('/api/documents/', data2, format='multipart')
            
            if response2.status_code == status.HTTP_400_BAD_REQUEST:
                self.stdout.write('✅ Duplicate prevention working!')
                self.stdout.write(f'Expected Error: {response2.data}')
            else:
                self.stdout.write('❌ Duplicate prevention failed!')
                self.stdout.write(f'Unexpected Response: {response2.status_code} - {response2.data}')

        except Exception as e:
            self.stdout.write(f'❌ API test failed: {e}')
            import traceback
            traceback.print_exc()

        self.stdout.write(self.style.SUCCESS('\n✅ API call testing completed!'))
