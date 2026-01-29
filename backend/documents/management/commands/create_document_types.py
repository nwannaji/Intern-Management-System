from django.core.management.base import BaseCommand
from documents.models import DocumentType


class Command(BaseCommand):
    help = 'Create default document types for the internship management system'

    def handle(self, *args, **options):
        # Define default document types
        default_document_types = [
            {
                'name': 'Resume/CV',
                'description': 'Current resume or curriculum vitae',
                'is_required': True,
                'max_file_size': 5242880,  # 5MB
                'allowed_extensions': 'pdf,doc,docx'
            },
            {
                'name': 'Cover Letter',
                'description': 'Cover letter for the internship application',
                'is_required': True,
                'max_file_size': 5242880,  # 5MB
                'allowed_extensions': 'pdf,doc,docx'
            },
            {
                'name': 'Academic Transcript',
                'description': 'Official academic transcript',
                'is_required': False,
                'max_file_size': 10485760,  # 10MB
                'allowed_extensions': 'pdf'
            },
            {
                'name': 'Portfolio',
                'description': 'Portfolio of work or projects',
                'is_required': False,
                'max_file_size': 20971520,  # 20MB
                'allowed_extensions': 'pdf,jpg,jpeg,png'
            },
            {
                'name': 'Recommendation Letter',
                'description': 'Letter of recommendation',
                'is_required': False,
                'max_file_size': 5242880,  # 5MB
                'allowed_extensions': 'pdf,doc,docx'
            },
            {
                'name': 'Certificate',
                'description': 'Relevant certificates or achievements',
                'is_required': False,
                'max_file_size': 5242880,  # 5MB
                'allowed_extensions': 'pdf,jpg,jpeg,png'
            }
        ]

        created_count = 0
        updated_count = 0

        for doc_type_data in default_document_types:
            doc_type, created = DocumentType.objects.get_or_create(
                name=doc_type_data['name'],
                defaults=doc_type_data
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created document type: {doc_type.name}')
                )
            else:
                # Update existing document type with latest defaults
                for key, value in doc_type_data.items():
                    setattr(doc_type, key, value)
                doc_type.save()
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'Updated document type: {doc_type.name}')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'\nDocument types setup complete!\n'
                f'Created: {created_count} new document types\n'
                f'Updated: {updated_count} existing document types\n'
                f'Total document types: {DocumentType.objects.count()}'
            )
        )

        # Display all document types
        self.stdout.write('\nAvailable document types:')
        for doc_type in DocumentType.objects.all().order_by('name'):
            status = '✓' if doc_type.is_required else '○'
            self.stdout.write(
                f'  {status} {doc_type.name} (ID: {doc_type.id}) - '
                f'{doc_type.allowed_extensions} - {doc_type.max_file_size // 1024 // 1024}MB'
            )
