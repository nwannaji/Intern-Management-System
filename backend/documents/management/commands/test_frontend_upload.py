from django.core.management.base import BaseCommand
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import RequestFactory
from django.contrib.auth import get_user_model
from documents.views import DocumentViewSet
from documents.models import DocumentType
from applications.models import Application
import json

User = get_user_model()

class Command(BaseCommand):
    help = 'Test frontend upload simulation'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🧪 Testing Frontend Upload Simulation'))
        self.stdout.write('=' * 50)

        try:
            # Setup
            factory = RequestFactory()
            user = User.objects.first()
            application = Application.objects.first()
            doc_type = DocumentType.objects.first()

            self.stdout.write(f'Testing with:')
            self.stdout.write(f'  User: {user.username} (ID: {user.id})')
            self.stdout.write(f'  Application: {application.id}')
            self.stdout.write(f'  Document Type: {doc_type.name} (ID: {doc_type.id})')

            # Create test file like frontend would
            test_file = SimpleUploadedFile(
                "school_recommendation.pdf",
                b"test pdf content for school recommendation",
                content_type="application/pdf"
            )

            # Test serializer directly with context like frontend would provide
            context = {'application_id': application.id}
            self.stdout.write(f'Testing with context: {context}')

            from documents.serializers import DocumentCreateSerializer
            serializer = DocumentCreateSerializer(
                data={
                    'document_type': doc_type.id,
                    'file': test_file
                },
                context=context
            )

            if serializer.is_valid():
                self.stdout.write('✅ Serializer validation passed')
                document = serializer.save()
                self.stdout.write(f'✅ Document created successfully:')
                self.stdout.write(f'   ID: {document.id}')
                self.stdout.write(f'   File: {document.file_name}')
                self.stdout.write(f'   Size: {document.file_size}')
                self.stdout.write(f'   Application: {document.application.id}')
                self.stdout.write(f'   Document Type: {document.document_type.name}')
            else:
                self.stdout.write('❌ Serializer validation failed:')
                for field, errors in serializer.errors.items():
                    for error in errors:
                        self.stdout.write(f'   {field}: {error}')

        except Exception as e:
            self.stdout.write(f'❌ Test failed: {e}')
            import traceback
            traceback.print_exc()

        self.stdout.write(self.style.SUCCESS('\n✅ Frontend upload simulation completed!'))
