from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from applications.models import Application, Program
from documents.models import DocumentType, Document
from django.test import TestCase
import json

User = get_user_model()

class Command(BaseCommand):
    help = 'Test the complete document submission flow'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🧪 Testing Document Submission Flow'))
        self.stdout.write('=' * 50)

        # Test 1: Check Document Types
        self.test_document_types()

        # Test 2: Check Database Models
        self.test_database_models()

        # Test 3: Test API Endpoints (if running)
        self.test_api_endpoints()

        # Test 4: Create Test Data
        self.create_test_data()

        self.stdout.write(self.style.SUCCESS('✅ All tests completed!'))

    def test_document_types(self):
        self.stdout.write('\n📋 Testing Document Types...')
        
        doc_types = DocumentType.objects.all()
        self.stdout.write(f'   Found {doc_types.count()} document types')
        
        for doc_type in doc_types:
            self.stdout.write(f'   ✓ {doc_type.name} (ID: {doc_type.id}) - Required: {doc_type.is_required}')
        
        if doc_types.count() == 0:
            self.stdout.write(self.style.ERROR('   ❌ No document types found! Run: python manage.py create_document_types'))
            return False
        
        return True

    def test_database_models(self):
        self.stdout.write('\n🗄️ Testing Database Models...')
        
        # Test users
        users = User.objects.all()
        self.stdout.write(f'   Users: {users.count()}')
        
        # Test programs
        programs = Program.objects.all()
        self.stdout.write(f'   Programs: {programs.count()}')
        
        # Test applications
        applications = Application.objects.all()
        self.stdout.write(f'   Applications: {applications.count()}')
        
        # Test documents
        documents = Document.objects.all()
        self.stdout.write(f'   Documents: {documents.count()}')
        
        return True

    def test_api_endpoints(self):
        self.stdout.write('\n🌐 Testing API Endpoints...')
        
        # This would require running Django test server
        # For now, just check URL patterns
        try:
            from documents.urls import urlpatterns
            self.stdout.write('   ✓ Document URLs configured')
            
            for pattern in urlpatterns:
                self.stdout.write(f'   - {pattern.pattern}')
        except Exception as e:
            self.stdout.write(f'   ❌ URL configuration error: {e}')
        
        return True

    def create_test_data(self):
        self.stdout.write('\n🔧 Creating Test Data...')
        
        try:
            # Create test user if not exists
            test_user, created = User.objects.get_or_create(
                username='testuser',
                defaults={
                    'email': 'test@example.com',
                    'first_name': 'Test',
                    'last_name': 'User',
                    'role': 'applicant'
                }
            )
            if created:
                test_user.set_password('testpass123')
                test_user.save()
                self.stdout.write('   ✓ Created test user')
            else:
                self.stdout.write('   ✓ Test user already exists')

            # Create test program if not exists
            test_program, created = Program.objects.get_or_create(
                name='Test Internship Program',
                defaults={
                    'program_type': 'IT',
                    'description': 'A test internship program for testing purposes',
                    'duration_months': 3,
                    'start_date': '2024-01-01',
                    'end_date': '2024-04-01',
                    'application_deadline': '2023-12-31',
                    'is_active': True
                }
            )
            if created:
                self.stdout.write('   ✓ Created test program')
            else:
                self.stdout.write('   ✓ Test program already exists')

            # Create test application if not exists
            test_application, created = Application.objects.get_or_create(
                applicant=test_user,
                program=test_program,
                defaults={
                    'cover_letter': 'Test cover letter for testing purposes.',
                    'why_interested': 'I am interested in this program for testing.',
                    'skills_and_experience': 'I have test skills and experience.',
                    'availability_start_date': '2024-01-01',
                    'status': 'pending'
                }
            )
            if created:
                self.stdout.write('   ✓ Created test application')
            else:
                self.stdout.write('   ✓ Test application already exists')

            # Display test data summary
            self.stdout.write('\n📊 Test Data Summary:')
            self.stdout.write(f'   User ID: {test_user.id}')
            self.stdout.write(f'   Program ID: {test_program.id}')
            self.stdout.write(f'   Application ID: {test_application.id}')
            
            # Show available document types for upload
            doc_types = DocumentType.objects.all()
            self.stdout.write('\n📄 Available Document Types for Upload:')
            for doc_type in doc_types:
                self.stdout.write(f'   - {doc_type.name} (ID: {doc_type.id}) - Max: {doc_type.max_file_size // 1024 // 1024}MB')

        except Exception as e:
            self.stdout.write(f'   ❌ Error creating test data: {e}')
            return False
        
        return True
