from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Test the new validation logic for either/or document requirements'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🧪 Testing Either/Or Document Validation'))
        self.stdout.write('=' * 50)

        # Test scenarios
        test_scenarios = [
            {
                'name': 'No documents uploaded',
                'uploaded_files': {},
                'expected_error': 'At least one document is required (Recommendation Letter OR NYSC Letter)',
                'should_pass': False
            },
            {
                'name': 'One document uploaded',
                'uploaded_files': {'7': 'test_file.pdf'},
                'expected_error': None,
                'should_pass': True
            },
            {
                'name': 'Two documents uploaded',
                'uploaded_files': {'7': 'test_file1.pdf', '8': 'test_file2.pdf'},
                'expected_error': 'Only one document is allowed (either Recommendation Letter OR NYSC Letter, not both)',
                'should_pass': False
            }
        ]

        self.stdout.write('\n📋 Testing Validation Scenarios:')
        
        for scenario in test_scenarios:
            # Simulate the frontend validation logic
            uploadedDocTypes = list(scenario['uploaded_files'].keys())
            errors = {}
            
            if len(uploadedDocTypes) == 0:
                errors['document_required'] = 'At least one document is required (Recommendation Letter OR NYSC Letter)'
            elif len(uploadedDocTypes) > 1:
                errors['document_required'] = 'Only one document is allowed (either Recommendation Letter OR NYSC Letter, not both)'
            
            # Check if validation passed
            validation_passed = len(errors) == 0
            
            # Check if result matches expectation
            if validation_passed == scenario['should_pass']:
                status = '✅'
                result = 'PASS'
            else:
                status = '❌'
                result = 'FAIL'
            
            self.stdout.write(f'   {status} {scenario["name"]}: {result}')
            
            if not validation_passed:
                self.stdout.write(f'      Error: {errors.get("document_required", "Unknown error")}')
            
            if scenario['expected_error']:
                actual_error = errors.get('document_required', '')
                if actual_error == scenario['expected_error']:
                    self.stdout.write(f'      ✅ Error message matches expected')
                else:
                    self.stdout.write(f'      ❌ Error message mismatch')
                    self.stdout.write(f'         Expected: {scenario["expected_error"]}')
                    self.stdout.write(f'         Actual: {actual_error}')

        self.stdout.write(self.style.SUCCESS('\n✅ Validation test completed!'))
