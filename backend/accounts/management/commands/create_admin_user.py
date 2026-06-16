from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from decouple import config

User = get_user_model()


class Command(BaseCommand):
    help = 'Create admin user for the application'

    def handle(self, *args, **options):
        email = config('ADMIN_EMAIL', default='admin@internship.com')
        password = config('ADMIN_PASSWORD', default='')
        first_name = config('ADMIN_FIRST_NAME', default='Admin')
        last_name = config('ADMIN_LAST_NAME', default='User')

        if not password:
            self.stdout.write(
                self.style.ERROR('ADMIN_PASSWORD environment variable is required')
            )
            return

        try:
            with transaction.atomic():
                if User.objects.filter(email=email).exists():
                    user = User.objects.get(email=email)
                    user.set_password(password)
                    user.role = 'admin'
                    user.is_staff = True
                    user.is_superuser = True
                    user.save()
                    self.stdout.write(
                        self.style.SUCCESS(f'Updated password and admin status for {email}')
                    )
                else:
                    user = User.objects.create_user(
                        email=email,
                        password=password,
                        first_name=first_name,
                        last_name=last_name,
                        role='admin',
                        is_staff=True,
                        is_superuser=True,
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