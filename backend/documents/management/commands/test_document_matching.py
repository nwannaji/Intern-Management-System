from django.core.management.base import BaseCommand
from documents.models import DocumentType

class Command(BaseCommand):
    help = 'Test document type matching logic'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🧪 Testing Document Type Matching Logic'))
        self.stdout.write('=' * 50)

        # Get current document types
        doc_types = DocumentType.objects.all()
        
        # Test file names and expected matches
        test_files = [
            ('school_recommendation_letter.pdf', 'School Recommendation Letter'),
            ('school_it_support.pdf', 'School Recommendation Letter'),
            ('recommendation_from_school.docx', 'School Recommendation Letter'),
            ('it_recommendation_letter.pdf', 'School Recommendation Letter'),
            ('nysc_orientation_letter.pdf', 'NYSC Orientation Camp Letter'),
            ('nysc_camp_completion.jpg', 'NYSC Orientation Camp Letter'),
            ('orientation_camp_nysc.pdf', 'NYSC Orientation Camp Letter'),
            ('nysc_three_weeks_camp.png', 'NYSC Orientation Camp Letter'),
        ]

        self.stdout.write('\n📋 Testing File Matching:')
        
        for filename, expected_type in test_files:
            # Simulate the frontend matching logic
            matched_doc_type = None
            fileName = filename.lower()
            
            if 'recommendation' in fileName or 'school' in fileName or 'it' in fileName:
                matched_doc_type = doc_types.filter(name__icontains='school').first()
            elif 'nysc' in fileName or 'orientation' in fileName or 'camp' in fileName:
                matched_doc_type = doc_types.filter(name__icontains='nysc').first()
            
            # Check if match is correct
            if matched_doc_type and matched_doc_type.name == expected_type:
                status = '✅'
                result = f"Matched to: {matched_doc_type.name}"
            else:
                status = '❌'
                result = f"Expected: {expected_type}, Got: {matched_doc_type.name if matched_doc_type else 'None'}"
            
            self.stdout.write(f'   {status} {filename} -> {result}')

        self.stdout.write(self.style.SUCCESS('\n✅ Document matching test completed!'))
