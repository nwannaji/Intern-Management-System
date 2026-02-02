from django.core.management.base import BaseCommand
from documents.models import DocumentType


class Command(BaseCommand):
    help = 'Seed document types for the intern management system'

    def handle(self, *args, **options):
        # Clear existing document types
        DocumentType.objects.all().delete()
        
        # Create document types
        document_types = [
            {
                'name': 'School Recommendation Letter',
                'description': 'Recommendation letter from your school supporting your application',
                'is_required': True,
                'max_file_size': 5242880,  # 5MB
                'allowed_extensions': 'pdf,doc,docx,jpg,jpeg,png'
            },
            {
                'name': 'NYSC Orientation Camp Letter',
                'description': 'Letter showing completion of 3 weeks NYSC orientation camp',
                'is_required': True,
                'max_file_size': 5242880,  # 5MB
                'allowed_extensions': 'pdf,doc,docx,jpg,jpeg,png'
            }
        ]
        
        created_types = []
        for doc_type_data in document_types:
            doc_type = DocumentType.objects.create(**doc_type_data)
            created_types.append(doc_type)
            self.stdout.write(
                self.style.SUCCESS(f'Created document type: {doc_type.name}')
            )
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {len(created_types)} document types')
        )
