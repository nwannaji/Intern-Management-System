from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from applications.models import Program
from documents.models import DocumentType

User = get_user_model()


class Command(BaseCommand):
    help = 'Create initial data for the intern management system'

    def handle(self, *args, **options):
        # Create admin user
        if not User.objects.filter(email='admin@internship.com').exists():
            admin_user = User.objects.create_user(
                username='admin',
                email='admin@internship.com',
                first_name='Admin',
                last_name='User',
                password='admin123',
                role='admin',
                is_staff=True,
                is_superuser=True
            )
            self.stdout.write(self.style.SUCCESS('Admin user created successfully'))
        else:
            self.stdout.write(self.style.WARNING('Admin user already exists'))

        # Create document types
        document_types = [
            {
                'name': 'Resume/CV',
                'description': 'Current resume or curriculum vitae',
                'is_required': True,
                'max_file_size': 5242880,  # 5MB
                'allowed_extensions': 'pdf,doc,docx'
            },
            {
                'name': 'Cover Letter',
                'description': 'Cover letter for the application',
                'is_required': True,
                'max_file_size': 5242880,  # 5MB
                'allowed_extensions': 'pdf,doc,docx'
            },
            {
                'name': 'Academic Transcripts',
                'description': 'Official academic transcripts',
                'is_required': True,
                'max_file_size': 10485760,  # 10MB
                'allowed_extensions': 'pdf'
            },
            {
                'name': 'ID Document',
                'description': 'Government issued ID card or passport',
                'is_required': True,
                'max_file_size': 5242880,  # 5MB
                'allowed_extensions': 'pdf,jpg,jpeg,png'
            },
            {
                'name': 'Letter of Recommendation',
                'description': 'Letter of recommendation from professor or employer',
                'is_required': False,
                'max_file_size': 5242880,  # 5MB
                'allowed_extensions': 'pdf,doc,docx'
            },
            {
                'name': 'Portfolio',
                'description': 'Portfolio of previous work or projects',
                'is_required': False,
                'max_file_size': 20971520,  # 20MB
                'allowed_extensions': 'pdf,zip,rar'
            }
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
                'name': 'Summer Industrial Training 2024',
                'program_type': 'IT',
                'description': 'A comprehensive 3-month industrial training program focused on software development and web technologies. Students will work on real-world projects and gain hands-on experience with modern development tools and methodologies.',
                'duration_months': 3,
                'start_date': '2024-06-01',
                'end_date': '2024-08-31',
                'application_deadline': '2024-05-15'
            },
            {
                'name': 'NYSC Primary Assignment 2024',
                'program_type': 'NYSC',
                'description': 'National Youth Service Corps primary assignment for corps members. This program provides graduates with the opportunity to contribute to national development while gaining valuable work experience.',
                'duration_months': 12,
                'start_date': '2024-03-01',
                'end_date': '2025-02-28',
                'application_deadline': '2024-02-15'
            },
            {
                'name': 'Winter Industrial Training 2024',
                'program_type': 'IT',
                'description': 'An intensive 2-month winter training program focusing on data science and machine learning. Participants will learn Python, data analysis, and ML algorithms.',
                'duration_months': 2,
                'start_date': '2024-12-01',
                'end_date': '2025-01-31',
                'application_deadline': '2024-11-15'
            }
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
