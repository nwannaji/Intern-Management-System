from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import date, timedelta
from applications.models import Program


class Command(BaseCommand):
    help = 'Create sample programs for the Intern Management System'

    def handle(self, *args, **options):
        # Clear existing programs
        Program.objects.all().delete()
        
        # Sample programs data
        programs_data = [
            {
                'name': 'Summer Industrial Training 2024',
                'program_type': 'IT',
                'description': 'A comprehensive 3-month industrial training program focusing on software development, web technologies, and IT infrastructure. Students will gain hands-on experience with real-world projects.',
                'duration_months': 3,
                'start_date': date(2024, 6, 1),
                'end_date': date(2024, 8, 31),
                'application_deadline': date(2024, 5, 15),
                'is_active': True,
            },
            {
                'name': 'NYSC Primary Assignment 2024',
                'program_type': 'NYSC',
                'description': 'National Youth Service Corps primary assignment program for corps members to contribute to national development while gaining valuable work experience in various sectors.',
                'duration_months': 12,
                'start_date': date(2024, 3, 1),
                'end_date': date(2025, 2, 28),
                'application_deadline': date(2024, 2, 15),
                'is_active': True,
            },
            {
                'name': 'Winter Industrial Training 2024',
                'program_type': 'IT',
                'description': 'Intensive 2-month winter training program focused on advanced programming, database management, and system administration. Perfect for students looking to enhance their technical skills during the winter break.',
                'duration_months': 2,
                'start_date': date(2024, 12, 1),
                'end_date': date(2025, 1, 31),
                'application_deadline': date(2024, 11, 15),
                'is_active': True,
            },
            {
                'name': 'Frontend Development Bootcamp 2024',
                'program_type': 'IT',
                'description': 'A specialized 6-week bootcamp covering modern frontend technologies including React, Vue.js, responsive design, and modern CSS frameworks.',
                'duration_months': 2,
                'start_date': date(2024, 7, 15),
                'end_date': date(2024, 9, 15),
                'application_deadline': date(2024, 7, 1),
                'is_active': True,
            },
            {
                'name': 'Data Science Internship 2024',
                'program_type': 'IT',
                'description': 'A 4-month intensive program covering data analysis, machine learning, statistical modeling, and data visualization using Python and R.',
                'duration_months': 4,
                'start_date': date(2024, 9, 1),
                'end_date': date(2024, 12, 31),
                'application_deadline': date(2024, 8, 15),
                'is_active': True,
            }
        ]

        # Create programs
        created_programs = []
        for program_data in programs_data:
            program = Program.objects.create(**program_data)
            created_programs.append(program)
            self.stdout.write(
                self.style.SUCCESS(f'Created program: {program.name}')
            )

        self.stdout.write(
            self.style.SUCCESS(f'\nSuccessfully created {len(created_programs)} sample programs!')
        )
        self.stdout.write('Available programs:')
        for program in created_programs:
            self.stdout.write(f'  - {program.name} ({program.get_program_type_display()})')
