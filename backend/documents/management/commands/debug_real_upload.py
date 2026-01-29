from django.core.management.base import BaseCommand
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth import get_user_model
from documents.models import DocumentType, Document
from applications.models import Application
from documents.serializers import DocumentCreateSerializer
from rest_framework.test import APIClient
from rest_framework import status
import json

User = get_user_model()

class Command(BaseCommand):
    help = 'Debug real upload scenario'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🔍 Debugging Real Upload Scenario'))
        self.stdout.write('=' * 50)

        try:
            # Get the most recent application without documents
            application = Application.objects.filter(
                id__in=[18, 16, 12]  # Recent applications without docs
            ).first()
            
            if not application:
                self.stdout.write('❌ No suitable application found for testing')
                return

            user = application.applicant
            doc_type = DocumentType.objects.first()

            self.stdout.write(f'Test Scenario:')
            self.stdout.write(f'  User: {user.username} (ID: {user.id}) - Role: {user.role}')
            self.stdout.write(f'  Application: {application.id} - {application.program.name}')
            self.stdout.write(f'  Document Type: {doc_type.name} (ID: {doc_type.id})')

            # Check existing documents
            existing_docs = Document.objects.filter(application=application)
            self.stdout.write(f'  Existing documents: {existing_docs.count()}')
            for doc in existing_docs:
                self.stdout.write(f'    - {doc.document_type.name}: {doc.file_name}')

            # Clear any existing documents for this test
            Document.objects.filter(application=application).delete()
            self.stdout.write('✅ Cleared existing documents for test')

            # Test 1: Direct serializer test
            self.stdout.write(f'\n🎯 Test 1: Direct Serializer Test')
            test_file = SimpleUploadedFile(
                "school_recommendation.pdf",
                b"test pdf content for debugging upload issue",
                content_type="application/pdf"
            )
            
            context = {'application_id': application.id}
            serializer = DocumentCreateSerializer(
                data={'document_type': doc_type.id, 'file': test_file},
                context=context
            )

            if serializer.is_valid():
                doc = serializer.save()
                self.stdout.write('✅ Direct serializer test successful')
                self.stdout.write(f'   Document ID: {doc.id}')
                self.stdout.write(f'   File: {doc.file_name}')
                self.stdout.write(f'   Size: {doc.file_size}')
                Document.objects.filter(id=doc.id).delete()
            else:
                self.stdout.write('❌ Direct serializer test failed')
                self.stdout.write(f'   Errors: {serializer.errors}')
                return

            # Test 2: API client test
            self.stdout.write(f'\n🎯 Test 2: API Client Test')
            client = APIClient()
            
            # Get auth token
            from rest_framework.authtoken.models import Token
            token, created = Token.objects.get_or_create(user=user)
            client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

            test_file2 = SimpleUploadedFile(
                "school_recommendation_api.pdf",
                b"test pdf content for api upload debugging",
                content_type="application/pdf"
            )
            
            data = {
                'application_id': str(application.id),
                'document_type': str(doc_type.id),
                'file': test_file2
            }

            try:
                response = client.post('/api/documents/', data, format='multipart')
                self.stdout.write(f'   Response Status: {response.status_code}')
                
                if response.status_code == status.HTTP_201_CREATED:
                    self.stdout.write('✅ API client test successful')
                    self.stdout.write(f'   Response: {response.data}')
                else:
                    self.stdout.write('❌ API client test failed')
                    self.stdout.write(f'   Response: {response.content.decode()}')
                    
            except Exception as e:
                self.stdout.write('❌ API client test exception')
                self.stdout.write(f'   Error: {str(e)}')
                import traceback
                traceback.print_exc()

            # Test 3: Simulate exact frontend request
            self.stdout.write(f'\n🎯 Test 3: Simulate Frontend Request')
            
            # Clear documents again
            Document.objects.filter(application=application).delete()
            
            # Test with different file sizes
            test_files = [
                ("small.pdf", b"small content"),
                ("medium.pdf", b"x" * 1000),
                ("large.pdf", b"x" * 10000)
            ]
            
            for filename, content in test_files:
                self.stdout.write(f'   Testing {filename} ({len(content)} bytes)...')
                
                test_file = SimpleUploadedFile(
                    filename,
                    content,
                    content_type="application/pdf"
                )
                
                data = {
                    'application_id': str(application.id),
                    'document_type': str(doc_type.id),
                    'file': test_file
                }
                
                try:
                    response = client.post('/api/documents/', data, format='multipart')
                    if response.status_code == status.HTTP_201_CREATED:
                        self.stdout.write(f'   ✅ {filename} successful')
                        Document.objects.filter(application=application).delete()
                    else:
                        self.stdout.write(f'   ❌ {filename} failed: {response.status_code}')
                        self.stdout.write(f'      {response.content.decode()}')
                        break
                except Exception as e:
                    self.stdout.write(f'   ❌ {filename} exception: {str(e)}')
                    break

        except Exception as e:
            self.stdout.write(f'❌ Debug test failed: {e}')
            import traceback
            traceback.print_exc()

        self.stdout.write(self.style.SUCCESS('\n✅ Debug completed!'))
