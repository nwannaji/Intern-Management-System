from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from applications.models import Program, Application
from applications.serializers import ApplicationCreateSerializer
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()

class Command(BaseCommand):
    help = 'Test application creation returns proper ID'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🧪 Testing Application ID Return'))
        self.stdout.write('=' * 50)

        try:
            # Setup
            user = User.objects.filter(role__in=['applicant', 'intern']).first()
            program = Program.objects.filter(is_active=True).first()

            self.stdout.write(f'Test Setup:')
            self.stdout.write(f'  User: {user.username} (ID: {user.id})')
            self.stdout.write(f'  Program: {program.name} (ID: {program.id})')

            # Clear existing applications for this user and program
            Application.objects.filter(applicant=user, program=program).delete()

            # Test API call
            client = APIClient()
            from rest_framework.authtoken.models import Token
            token, created = Token.objects.get_or_create(user=user)
            client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

            application_data = {
                'program': program.id,
                'cover_letter': 'Test cover letter for ID verification',
                'why_interested': 'Test why interested for ID verification',
                'skills_and_experience': 'Test skills for ID verification',
                'availability_start_date': '2024-01-01'
            }

            self.stdout.write(f'\n🎯 Creating Application...')
            response = client.post('/api/applications/', application_data)

            self.stdout.write(f'Response Status: {response.status_code}')
            self.stdout.write(f'Response Data: {response.data}')

            if response.status_code == status.HTTP_201_CREATED:
                self.stdout.write('✅ Application created successfully!')
                self.stdout.write(f'   Application ID: {response.data.get("id", "MISSING")}')
                self.stdout.write(f'   Program: {response.data.get("program_name", "MISSING")}')
                self.stdout.write(f'   Applicant: {response.data.get("applicant_name", "MISSING")}')
                
                # Test document upload with this application ID
                app_id = response.data.get('id')
                if app_id:
                    self.stdout.write(f'\n✅ Application ID is available for document upload: {app_id}')
                else:
                    self.stdout.write('\n❌ Application ID is missing - this will cause document upload to fail')
            else:
                self.stdout.write('❌ Application creation failed')
                self.stdout.write(f'   Error: {response.data}')

        except Exception as e:
            self.stdout.write(f'❌ Test failed: {e}')
            import traceback
            traceback.print_exc()

        self.stdout.write(self.style.SUCCESS('\n✅ Application ID test completed!'))
