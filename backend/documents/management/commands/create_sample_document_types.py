from django.core.management.base import BaseCommand
from documents.models import DocumentType


class Command(BaseCommand):
    help = 'Create sample document types for the Intern Management System'

    def handle(self, *args, **options):
        # Clear existing document types
        DocumentType.objects.all().delete()
        
        # Sample document types
        document_types = [
            {
                'name': 'School Recommendation Letter',
                'description': 'Official recommendation letter from your school supporting your internship application',
                'is_required': False,
                'max_file_size': 5242880,  # 5MB
                'allowed_extensions': 'pdf,doc,docx,jpg,jpeg,png'
            },
            {
                'name': 'NYSC Orientation Camp Letter',
                'description': 'Letter showing completion of 3 weeks NYSC orientation camp',
                'is_required': False,
                'max_file_size': 5242880,  # 5MB
                'allowed_extensions': 'pdf,doc,docx,jpg,jpeg,png'
            },
            {
                'name': 'Resume/CV',
                'description': 'Your current resume or curriculum vitae',
                'is_required': True,
                'max_file_size': 5242880,  # 5MB
                'allowed_extensions': 'pdf,doc,docx'
            },
            {
                'name': 'Academic Transcripts',
                'description': 'Latest academic transcripts from your institution',
                'is_required': False,
                'max_file_size': 5242880,  # 5MB
                'allowed_extensions': 'pdf,doc,docx,jpg,jpeg,png'
            },
            {
                'name': 'ID Document',
                'description': 'Government-issued identification document',
                'is_required': True,
                'max_file_size': 5242880,  # 5MB
                'allowed_extensions': 'pdf,jpg,jpeg,png'
            }
        ]

        # Create document types
        created_types = []
        for doc_type_data in document_types:
            doc_type = DocumentType.objects.create(**doc_type_data)
            created_types.append(doc_type)
            self.stdout.write(
                self.style.SUCCESS(f'Created document type: {doc_type.name}')
            )

        self.stdout.write(
            self.style.SUCCESS(f'\nSuccessfully created {len(created_types)} document types!')
        )
        self.stdout.write('Available document types:')
        for doc_type in created_types:
            required_status = 'Required' if doc_type.is_required else 'Optional'
            self.stdout.write(f'  - {doc_type.name} ({required_status})')
