from django.core.management.base import BaseCommand
from django.core.files.uploadedfile import SimpleUploadedFile
from documents.models import DocumentType, Document
from applications.models import Application
from django.contrib.auth import get_user_model
from documents.serializers import DocumentCreateSerializer

User = get_user_model()

class Command(BaseCommand):
    help = 'Test complete document upload flow'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🧪 Testing Complete Document Upload Flow'))
        self.stdout.write('=' * 50)

        try:
            # Clear existing documents
            Document.objects.all().delete()
            self.stdout.write('✅ Cleared existing documents')

            # Setup test data
            user = User.objects.first()
            application = Application.objects.first()
            school_doc_type = DocumentType.objects.filter(name__icontains='school').first()
            nysc_doc_type = DocumentType.objects.filter(name__icontains='nysc').first()

            self.stdout.write(f'\n📋 Test Data:')
            self.stdout.write(f'  User: {user.username}')
            self.stdout.write(f'  Application: {application.id}')
            self.stdout.write(f'  School Doc Type: {school_doc_type.name} (ID: {school_doc_type.id})')
            self.stdout.write(f'  NYSC Doc Type: {nysc_doc_type.name} (ID: {nysc_doc_type.id})')

            # Test 1: Upload School Recommendation Letter
            self.stdout.write(f'\n🎯 Test 1: Upload School Recommendation Letter')
            test_file1 = SimpleUploadedFile(
                "school_recommendation.pdf",
                b"school recommendation letter content",
                content_type="application/pdf"
            )

            context = {'application_id': application.id}
            serializer1 = DocumentCreateSerializer(
                data={'document_type': school_doc_type.id, 'file': test_file1},
                context=context
            )

            if serializer1.is_valid():
                doc1 = serializer1.save()
                self.stdout.write('✅ School document uploaded successfully')
                self.stdout.write(f'   Document ID: {doc1.id}')
            else:
                self.stdout.write('❌ School document upload failed')
                self.stdout.write(f'   Errors: {serializer1.errors}')
                return

            # Test 2: Try to upload NYSC letter (should fail)
            self.stdout.write(f'\n🎯 Test 2: Try to upload NYSC letter (should fail)')
            test_file2 = SimpleUploadedFile(
                "nysc_orientation.pdf",
                b"nysc orientation letter content",
                content_type="application/pdf"
            )

            serializer2 = DocumentCreateSerializer(
                data={'document_type': nysc_doc_type.id, 'file': test_file2},
                context=context
            )

            if serializer2.is_valid():
                self.stdout.write('❌ NYSC document upload should have failed but passed')
                return
            else:
                self.stdout.write('✅ NYSC document correctly rejected')
                self.stdout.write(f'   Error: {serializer2.errors.get("non_field_errors", ["Unknown error"])[0]}')

            # Test 3: Remove school document and upload NYSC
            self.stdout.write(f'\n🎯 Test 3: Remove school document and upload NYSC')
            doc1.delete()
            self.stdout.write('✅ School document removed')

            serializer3 = DocumentCreateSerializer(
                data={'document_type': nysc_doc_type.id, 'file': test_file2},
                context=context
            )

            if serializer3.is_valid():
                doc3 = serializer3.save()
                self.stdout.write('✅ NYSC document uploaded successfully')
                self.stdout.write(f'   Document ID: {doc3.id}')
            else:
                self.stdout.write('❌ NYSC document upload failed')
                self.stdout.write(f'   Errors: {serializer3.errors}')
                return

            # Test 4: Try to upload another document (should fail)
            self.stdout.write(f'\n🎯 Test 4: Try to upload another document (should fail)')
            test_file4 = SimpleUploadedFile(
                "another_document.pdf",
                b"another document content",
                content_type="application/pdf"
            )

            serializer4 = DocumentCreateSerializer(
                data={'document_type': school_doc_type.id, 'file': test_file4},
                context=context
            )

            if serializer4.is_valid():
                self.stdout.write('❌ Second document upload should have failed but passed')
                return
            else:
                self.stdout.write('✅ Second document correctly rejected')
                self.stdout.write(f'   Error: {serializer4.errors.get("non_field_errors", ["Unknown error"])[0]}')

            # Final check
            self.stdout.write(f'\n📊 Final Status:')
            documents = Document.objects.filter(application=application)
            self.stdout.write(f'  Total documents for application {application.id}: {documents.count()}')
            for doc in documents:
                self.stdout.write(f'    - {doc.document_type.name}: {doc.file_name}')

            self.stdout.write(self.style.SUCCESS('\n✅ All tests passed! Either/Or logic working correctly'))

        except Exception as e:
            self.stdout.write(f'❌ Test failed: {e}')
            import traceback
            traceback.print_exc()
