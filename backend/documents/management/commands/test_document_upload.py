from django.core.management.base import BaseCommand
from django.core.files.uploadedfile import SimpleUploadedFile
from documents.models import DocumentType
from applications.models import Application
from django.contrib.auth import get_user_model
from documents.serializers import DocumentCreateSerializer

User = get_user_model()

class Command(BaseCommand):
    help = 'Test document upload functionality'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🧪 Testing Document Upload'))
        self.stdout.write('=' * 50)

        try:
            # Get test data
            user = User.objects.first()
            application = Application.objects.first()
            doc_type = DocumentType.objects.first()

            self.stdout.write(f'User: {user.username}')
            self.stdout.write(f'Application: {application.id}')
            self.stdout.write(f'Document Type: {doc_type.name}')

            # Create a test file
            test_file = SimpleUploadedFile(
                "test_document.pdf",
                b"file_content",
                content_type="application/pdf"
            )

            # Test serializer
            context = {'application_id': application.id}
            serializer = DocumentCreateSerializer(
                data={'document_type': doc_type.id, 'file': test_file},
                context=context
            )

            if serializer.is_valid():
                self.stdout.write('✅ Serializer validation passed')
                document = serializer.save()
                self.stdout.write(f'✅ Document created: {document.id}')
                self.stdout.write(f'   File: {document.file_name}')
                self.stdout.write(f'   Size: {document.file_size} bytes')
                self.stdout.write(f'   Type: {document.document_type.name}')
            else:
                self.stdout.write('❌ Serializer validation failed:')
                self.stdout.write(f'   Errors: {serializer.errors}')

            # Test duplicate prevention
            test_file2 = SimpleUploadedFile(
                "test_document2.pdf",
                b"file_content_2",
                content_type="application/pdf"
            )

            serializer2 = DocumentCreateSerializer(
                data={'document_type': doc_type.id, 'file': test_file2},
                context=context
            )

            if serializer2.is_valid():
                self.stdout.write('❌ Duplicate prevention failed - should not allow second document')
            else:
                self.stdout.write('✅ Duplicate prevention working')
                self.stdout.write(f'   Expected error: {serializer2.errors}')

        except Exception as e:
            self.stdout.write(f'❌ Test failed with error: {e}')
            import traceback
            traceback.print_exc()

        self.stdout.write(self.style.SUCCESS('\n✅ Document upload test completed!'))
