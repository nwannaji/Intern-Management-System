from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from decouple import config
from applications.models import Program
from documents.models import DocumentType

User = get_user_model()


class Command(BaseCommand):
    help = 'Create initial data for the intern management system'

    def handle(self, *args, **options):
        # Create admin user
        admin_email = config('ADMIN_EMAIL', default='admin@internship.com')
        admin_password = config('ADMIN_PASSWORD', default='')

        if admin_password:
            if not User.objects.filter(email=admin_email).exists():
                User.objects.create_user(
                    username='admin',
                    email=admin_email,
                    first_name='Admin',
                    last_name='User',
                    password=admin_password,
                    role='admin',
                    is_staff=True,
                    is_superuser=True,
                )
                self.stdout.write(self.style.SUCCESS('Admin user created successfully'))
            else:
                self.stdout.write(self.style.WARNING('Admin user already exists'))
        else:
            self.stdout.write(self.style.WARNING('Skipping admin user creation: ADMIN_PASSWORD not set'))

        # Create document types
        document_types = [
            {
                'name': 'School Recommendation Letter',
                'description': 'Recommendation letter from your school supporting your application',
                'is_required': True,
                'max_file_size': 5242880,
                'allowed_extensions': 'pdf,doc,docx,jpg,jpeg,png'
            },
            {
                'name': 'NYSC Orientation Camp Letter',
                'description': 'Letter showing completion of 3 weeks NYSC orientation camp',
                'is_required': True,
                'max_file_size': 5242880,
                'allowed_extensions': 'pdf,doc,docx,jpg,jpeg,png'
            },
        ]

        for doc_type_data in document_types:
            doc_type, created = DocumentType.objects.get_or_create(
                name=doc_type_data['name'],
                defaults=doc_type_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Document type "{doc_type.name}" created'))
            else:
                self.stdout.write(self.style.WARNING(f'Document type "{doc_type.name}" already exists'))

        # Create sample programs
        programs = [
            {
                'name': 'Industrial Training Program',
                'program_type': 'IT',
                'description': 'A comprehensive industrial training program focused on software development and web technologies. Students will work on real-world projects and gain hands-on experience.',
                'duration_months': 3,
                'start_date': '2026-06-01',
                'end_date': '2026-08-31',
                'application_deadline': '2026-05-15'
            },
            {
                'name': 'NYSC Primary Assignment',
                'program_type': 'NYSC',
                'description': 'National Youth Service Corps primary assignment for corps members. This program provides graduates with the opportunity to contribute to national development while gaining valuable work experience.',
                'duration_months': 12,
                'start_date': '2026-03-01',
                'end_date': '2027-02-28',
                'application_deadline': '2026-02-15'
            },
        ]

        for program_data in programs:
            program, created = Program.objects.get_or_create(
                name=program_data['name'],
                defaults=program_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Program "{program.name}" created'))
            else:
                self.stdout.write(self.style.WARNING(f'Program "{program.name}" already exists'))

        self.stdout.write(self.style.SUCCESS('Initial data creation completed!'))