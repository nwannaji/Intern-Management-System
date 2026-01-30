from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()

class Command(BaseCommand):
    help = 'Create admin user for the application'

    def handle(self, *args, **options):
        email = 'edenwannaji1980@gmail.com'
        password = '@admin123'
        
        try:
            with transaction.atomic():
                # Check if user already exists
                if User.objects.filter(email=email).exists():
                    user = User.objects.get(email=email)
                    self.stdout.write(
                        self.style.WARNING(f'User {email} already exists')
                    )
                    # Update password
                    user.set_password(password)
                    user.is_staff = True
                    user.is_superuser = True
                    user.save()
                    self.stdout.write(
                        self.style.SUCCESS(f'Updated password and admin status for {email}')
                    )
                else:
                    # Create new user
                    user = User.objects.create_user(
                        email=email,
                        password=password,
                        first_name='Henry',
                        last_name='Nwatu',
                        is_staff=True,
                        is_superuser=True
                    )
                    self.stdout.write(
                        self.style.SUCCESS(f'Successfully created admin user: {email}')
                    )
                
                self.stdout.write(
                    self.style.SUCCESS('Admin user is ready for login')
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating admin user: {str(e)}')
            )
