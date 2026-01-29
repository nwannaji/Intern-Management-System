from django.core.management.base import BaseCommand
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth import get_user_model
from documents.models import DocumentType, Document
from applications.models import Application
from documents.serializers import DocumentCreateSerializer
import tempfile
import os

User = get_user_model()

class Command(BaseCommand):
    help = 'Test file upload with different file types and sizes'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🧪 Testing File Upload Scenarios'))
        self.stdout.write('=' * 50)

        try:
            # Setup
            user = User.objects.filter(role__in=['applicant', 'intern']).first()
            application = Application.objects.filter(applicant=user).order_by('-submitted_at').first()
            doc_type = DocumentType.objects.first()

            # Clear existing documents
            Document.objects.filter(application=application).delete()

            self.stdout.write(f'Testing with:')
            self.stdout.write(f'  User: {user.username}')
            self.stdout.write(f'  Application: {application.id}')
            self.stdout.write(f'  Document Type: {doc_type.name}')

            # Test 1: Small PDF file
            self.stdout.write(f'\n🎯 Test 1: Small PDF file')
            small_pdf = SimpleUploadedFile(
                "small.pdf",
                b"small pdf content",
                content_type="application/pdf"
            )
            
            context = {'application_id': application.id}
            serializer1 = DocumentCreateSerializer(
                data={'document_type': doc_type.id, 'file': small_pdf},
                context=context
            )

            if serializer1.is_valid():
                doc1 = serializer1.save()
                self.stdout.write('✅ Small PDF upload successful')
                self.stdout.write(f'   Size: {doc1.file_size} bytes')
                Document.objects.filter(id=doc1.id).delete()
            else:
                self.stdout.write('❌ Small PDF upload failed')
                self.stdout.write(f'   Errors: {serializer1.errors}')

            # Test 2: Large PDF file (within limits)
            self.stdout.write(f'\n🎯 Test 2: Large PDF file (1MB)')
            large_content = b"x" * (1024 * 1024)  # 1MB
            large_pdf = SimpleUploadedFile(
                "large.pdf",
                large_content,
                content_type="application/pdf"
            )
            
            serializer2 = DocumentCreateSerializer(
                data={'document_type': doc_type.id, 'file': large_pdf},
                context=context
            )

            if serializer2.is_valid():
                doc2 = serializer2.save()
                self.stdout.write('✅ Large PDF upload successful')
                self.stdout.write(f'   Size: {doc2.file_size} bytes')
                Document.objects.filter(id=doc2.id).delete()
            else:
                self.stdout.write('❌ Large PDF upload failed')
                self.stdout.write(f'   Errors: {serializer2.errors}')

            # Test 3: Invalid file type
            self.stdout.write(f'\n🎯 Test 3: Invalid file type (.exe)')
            invalid_file = SimpleUploadedFile(
                "malware.exe",
                b"fake malware content",
                content_type="application/octet-stream"
            )
            
            serializer3 = DocumentCreateSerializer(
                data={'document_type': doc_type.id, 'file': invalid_file},
                context=context
            )

            if serializer3.is_valid():
                self.stdout.write('❌ Invalid file should have been rejected')
            else:
                self.stdout.write('✅ Invalid file correctly rejected')
                self.stdout.write(f'   Error: {serializer3.errors.get("file", ["Unknown error"])[0]}')

            # Test 4: Oversized file
            self.stdout.write(f'\n🎯 Test 4: Oversized file (10MB)')
            oversized_content = b"x" * (10 * 1024 * 1024)  # 10MB
            oversized_file = SimpleUploadedFile(
                "oversized.pdf",
                oversized_content,
                content_type="application/pdf"
            )
            
            serializer4 = DocumentCreateSerializer(
                data={'document_type': doc_type.id, 'file': oversized_file},
                context=context
            )

            if serializer4.is_valid():
                self.stdout.write('❌ Oversized file should have been rejected')
            else:
                self.stdout.write('✅ Oversized file correctly rejected')
                self.stdout.write(f'   Error: {serializer4.errors.get("file", ["Unknown error"])[0]}')

            # Test 5: Edge case - empty file
            self.stdout.write(f'\n🎯 Test 5: Empty file')
            empty_file = SimpleUploadedFile(
                "empty.pdf",
                b"",
                content_type="application/pdf"
            )
            
            serializer5 = DocumentCreateSerializer(
                data={'document_type': doc_type.id, 'file': empty_file},
                context=context
            )

            if serializer5.is_valid():
                doc5 = serializer5.save()
                self.stdout.write('✅ Empty file upload successful')
                self.stdout.write(f'   Size: {doc5.file_size} bytes')
                Document.objects.filter(id=doc5.id).delete()
            else:
                self.stdout.write('❌ Empty file upload failed')
                self.stdout.write(f'   Errors: {serializer5.errors}')

        except Exception as e:
            self.stdout.write(f'❌ Test failed: {e}')
            import traceback
            traceback.print_exc()

        self.stdout.write(self.style.SUCCESS('\n✅ File upload testing completed!'))
