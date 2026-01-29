from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from applications.models import Program, Application
from applications.serializers import ApplicationCreateSerializer
from django.test import RequestFactory
from datetime import date

User = get_user_model()

class Command(BaseCommand):
    help = 'Test application creation'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🧪 Testing Application Creation'))
        self.stdout.write('=' * 50)

        try:
            # Setup test data
            user = User.objects.filter(role='applicant').first()
            program = Program.objects.filter(is_active=True).first()

            self.stdout.write(f'Test Data:')
            self.stdout.write(f'  User: {user.username} (ID: {user.id}) - Role: {user.role}')
            self.stdout.write(f'  Program: {program.name} (ID: {program.id}) - Type: {program.program_type}')

            # Create mock request
            factory = RequestFactory()
            request = factory.post('/api/applications/')
            request.user = user

            # Test application data like frontend would send
            application_data = {
                'program': program.id,
                'cover_letter': 'This is my cover letter for the application.',
                'why_interested': 'I am interested in this program because...',
                'skills_and_experience': 'I have skills in...',
                'availability_start_date': '2024-01-01'
            }

            self.stdout.write(f'\n📋 Application Data:')
            for key, value in application_data.items():
                self.stdout.write(f'  {key}: {value}')

            # Test serializer
            context = {'request': request}
            serializer = ApplicationCreateSerializer(data=application_data, context=context)

            if serializer.is_valid():
                self.stdout.write('\n✅ Serializer validation passed')
                application = serializer.save()
                self.stdout.write(f'✅ Application created successfully:')
                self.stdout.write(f'   ID: {application.id}')
                self.stdout.write(f'   Applicant: {application.applicant.username}')
                self.stdout.write(f'   Program: {application.program.name}')
                self.stdout.write(f'   Status: {application.status}')
                self.stdout.write(f'   Submitted: {application.submitted_at}')
            else:
                self.stdout.write('\n❌ Serializer validation failed:')
                for field, errors in serializer.errors.items():
                    for error in errors:
                        self.stdout.write(f'   {field}: {error}')

            # Test duplicate application prevention
            self.stdout.write(f'\n🔄 Testing duplicate prevention...')
            serializer2 = ApplicationCreateSerializer(data=application_data, context=context)
            if serializer2.is_valid():
                self.stdout.write('❌ Duplicate prevention failed - should not allow second application')
            else:
                self.stdout.write('✅ Duplicate prevention working')
                self.stdout.write(f'   Error: {serializer2.errors.get("program", ["Unknown error"])[0]}')

        except Exception as e:
            self.stdout.write(f'❌ Test failed: {e}')
            import traceback
            traceback.print_exc()

        self.stdout.write(self.style.SUCCESS('\n✅ Application creation test completed!'))
