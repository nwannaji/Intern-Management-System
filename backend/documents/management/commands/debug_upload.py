from django.core.management.base import BaseCommand
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth import get_user_model
from documents.models import DocumentType, Document
from applications.models import Application
from documents.serializers import DocumentCreateSerializer
from django.test import RequestFactory
import json

User = get_user_model()

class Command(BaseCommand):
    help = 'Debug document upload process'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🔍 Debugging Document Upload Process'))
        self.stdout.write('=' * 50)

        try:
            # Get test data
            user = User.objects.filter(role__in=['applicant', 'intern']).first()
            application = Application.objects.filter(applicant=user).order_by('-submitted_at').first()
            doc_type = DocumentType.objects.first()

            self.stdout.write(f'Test Data:')
            self.stdout.write(f'  User: {user.username} (ID: {user.id}) - Role: {user.role}')
            self.stdout.write(f'  Application: {application.id} - {application.program.name}')
            self.stdout.write(f'  Document Type: {doc_type.name} (ID: {doc_type.id})')

            # Check existing documents for this application
            existing_docs = Document.objects.filter(application=application)
            self.stdout.write(f'  Existing documents for this app: {existing_docs.count()}')
            for doc in existing_docs:
                self.stdout.write(f'    - {doc.document_type.name}: {doc.file_name}')

            # Create test file like frontend would
            test_file = SimpleUploadedFile(
                "school_recommendation.pdf",
                b"test pdf content for school recommendation",
                content_type="application/pdf"
            )

            # Test 1: Try to upload to application with existing document
            if existing_docs.exists():
                self.stdout.write(f'\n🎯 Test 1: Upload to application with existing document (should fail)')
                context = {'application_id': application.id}
                serializer = DocumentCreateSerializer(
                    data={'document_type': doc_type.id, 'file': test_file},
                    context=context
                )

                if serializer.is_valid():
                    self.stdout.write('❌ Upload should have failed but passed')
                else:
                    self.stdout.write('✅ Upload correctly rejected')
                    self.stdout.write(f'   Error: {serializer.errors.get("non_field_errors", ["Unknown error"])[0]}')

            # Test 2: Clear documents and try upload
            self.stdout.write(f'\n🎯 Test 2: Clear documents and upload (should work)')
            Document.objects.filter(application=application).delete()
            self.stdout.write('✅ Existing documents cleared')

            context = {'application_id': application.id}
            serializer2 = DocumentCreateSerializer(
                data={'document_type': doc_type.id, 'file': test_file},
                context=context
            )

            if serializer2.is_valid():
                doc = serializer2.save()
                self.stdout.write('✅ Upload successful')
                self.stdout.write(f'   Document ID: {doc.id}')
                self.stdout.write(f'   File: {doc.file_name}')
                self.stdout.write(f'   Size: {doc.file_size}')
            else:
                self.stdout.write('❌ Upload failed')
                self.stdout.write(f'   Errors: {serializer2.errors}')

            # Test 3: Simulate exact frontend request
            self.stdout.write(f'\n🎯 Test 3: Simulate exact frontend request')
            factory = RequestFactory()
            request = factory.post('/api/documents/', {
                'application_id': str(application.id),
                'document_type': str(doc_type.id),
                'file': test_file
            }, format='multipart')
            request.user = user

            # Clear document first
            Document.objects.filter(application=application).delete()

            # Test the view directly
            from documents.views import DocumentViewSet
            view = DocumentViewSet()
            view.request = request
            view.format_kwarg = None
            view.action = 'create'

            try:
                response = view.create(request)
                self.stdout.write('✅ View upload successful')
                self.stdout.write(f'   Response status: {response.status_code}')
                if hasattr(response, 'data'):
                    self.stdout.write(f'   Response data: {response.data}')
            except Exception as e:
                self.stdout.write('❌ View upload failed')
                self.stdout.write(f'   Error: {str(e)}')
                import traceback
                traceback.print_exc()

        except Exception as e:
            self.stdout.write(f'❌ Debug test failed: {e}')
            import traceback
            traceback.print_exc()

        self.stdout.write(self.style.SUCCESS('\n✅ Debug completed!'))
