from django.core.management.base import BaseCommand
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth import get_user_model
from documents.models import DocumentType, Document
from applications.models import Application
from documents.serializers import DocumentCreateSerializer
from rest_framework.test import APIClient
from rest_framework import status
import os

User = get_user_model()

class Command(BaseCommand):
    help = 'Test uploading CombinedList.pdf specifically'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🔍 Testing CombinedList.pdf Upload'))
        self.stdout.write('=' * 50)

        try:
            # Setup
            user = User.objects.filter(role__in=['applicant', 'intern']).first()
            application = Application.objects.filter(applicant=user).order_by('-submitted_at').first()
            doc_type = DocumentType.objects.first()

            # Clear existing documents
            Document.objects.filter(application=application).delete()

            self.stdout.write(f'Test Setup:')
            self.stdout.write(f'  User: {user.username}')
            self.stdout.write(f'  Application: {application.id} - {application.program.name}')
            self.stdout.write(f'  Document Type: {doc_type.name}')

            # Test 1: Small PDF (like CombinedList.pdf might be)
            self.stdout.write(f'\n🎯 Test 1: Small PDF File')
            small_pdf_content = b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n174\n%%EOF"
            
            test_file = SimpleUploadedFile(
                "CombinedList.pdf",
                small_pdf_content,
                content_type="application/pdf"
            )
            
            self.stdout.write(f'  File name: {test_file.name}')
            self.stdout.write(f'  File size: {len(test_file)} bytes')
            self.stdout.write(f'  Content type: {test_file.content_type}')

            # Test serializer
            context = {'application_id': application.id}
            serializer = DocumentCreateSerializer(
                data={'document_type': doc_type.id, 'file': test_file},
                context=context
            )

            if serializer.is_valid():
                doc = serializer.save()
                self.stdout.write('✅ Serializer validation passed')
                self.stdout.write(f'   Document ID: {doc.id}')
                self.stdout.write(f'   Stored as: {doc.file.name}')
                self.stdout.write(f'   File size: {doc.file_size}')
                Document.objects.filter(id=doc.id).delete()
            else:
                self.stdout.write('❌ Serializer validation failed')
                self.stdout.write(f'   Errors: {serializer.errors}')
                return

            # Test 2: API call with CombinedList.pdf
            self.stdout.write(f'\n🎯 Test 2: API Call with CombinedList.pdf')
            client = APIClient()
            
            from rest_framework.authtoken.models import Token
            token, created = Token.objects.get_or_create(user=user)
            client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

            # Test different sizes
            test_sizes = [
                (100, "Small CombinedList.pdf"),
                (1000, "Medium CombinedList.pdf"),
                (10000, "Large CombinedList.pdf"),
                (100000, "Very Large CombinedList.pdf"),
                (1000000, "Huge CombinedList.pdf (1MB)"),
                (6000000, "Oversized CombinedList.pdf (6MB)")  # Over 5MB limit
            ]
            
            for size, description in test_sizes:
                self.stdout.write(f'\n   Testing {description} ({size} bytes)...')
                
                content = b"x" * size
                test_file = SimpleUploadedFile(
                    "CombinedList.pdf",
                    content,
                    content_type="application/pdf"
                )
                
                data = {
                    'application_id': str(application.id),
                    'document_type': str(doc_type.id),
                    'file': test_file
                }
                
                # Clear previous document
                Document.objects.filter(application=application).delete()
                
                try:
                    response = client.post('/api/documents/', data, format='multipart')
                    
                    if response.status_code == status.HTTP_201_CREATED:
                        self.stdout.write(f'   ✅ {description} successful')
                        self.stdout.write(f'      Response: {response.data.get("file_name", "N/A")} - {response.data.get("file_size", 0)} bytes')
                    else:
                        self.stdout.write(f'   ❌ {description} failed: {response.status_code}')
                        if response.status_code == status.HTTP_400_BAD_REQUEST:
                            errors = response.data
                            if 'file' in errors:
                                self.stdout.write(f'      File error: {errors["file"][0]}')
                            else:
                                self.stdout.write(f'      General error: {errors}')
                        else:
                            self.stdout.write(f'      Response: {response.content.decode()}')
                        
                        # If this is the size that fails, we can stop
                        if "Oversized" in description:
                            self.stdout.write('   ✅ Oversized file correctly rejected')
                            break
                        else:
                            self.stdout.write('   ⚠️  Unexpected failure at this size')
                            break
                            
                except Exception as e:
                    self.stdout.write(f'   ❌ {description} exception: {str(e)}')
                    break

            # Test 3: Test with invalid file name
            self.stdout.write(f'\n🎯 Test 3: Invalid File Scenarios')
            
            invalid_scenarios = [
                ("CombinedList.exe", b"fake exe content", "application/octet-stream"),
                ("CombinedList.txt", b"text content", "text/plain"),
                ("", b"no filename content", "application/pdf"),  # Empty filename
            ]
            
            for filename, content, content_type in invalid_scenarios:
                self.stdout.write(f'   Testing {filename or "empty filename"}...')
                
                test_file = SimpleUploadedFile(
                    filename or "test.pdf",
                    content,
                    content_type=content_type
                )
                
                data = {
                    'application_id': str(application.id),
                    'document_type': str(doc_type.id),
                    'file': test_file
                }
                
                Document.objects.filter(application=application).delete()
                
                try:
                    response = client.post('/api/documents/', data, format='multipart')
                    
                    if response.status_code == status.HTTP_400_BAD_REQUEST:
                        self.stdout.write(f'   ✅ {filename or "empty filename"} correctly rejected')
                        errors = response.data
                        if 'file' in errors:
                            self.stdout.write(f'      Error: {errors["file"][0]}')
                    else:
                        self.stdout.write(f'   ❌ {filename or "empty filename"} should have been rejected')
                        
                except Exception as e:
                    self.stdout.write(f'   ❌ {filename or "empty filename"} exception: {str(e)}')

        except Exception as e:
            self.stdout.write(f'❌ Test failed: {e}')
            import traceback
            traceback.print_exc()

        self.stdout.write(self.style.SUCCESS('\n✅ CombinedList.pdf testing completed!'))
