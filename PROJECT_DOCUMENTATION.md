# Intern Management System - Complete Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Features](#features)
4. [Technology Stack](#technology-stack)
5. [Installation Guide](#installation-guide)
6. [Configuration](#configuration)
7. [User Roles and Permissions](#user-roles-and-permissions)
8. [API Documentation](#api-documentation)
9. [Database Schema](#database-schema)
10. [Development Guide](#development-guide)
11. [Deployment Guide](#deployment-guide)
12. [Troubleshooting](#troubleshooting)
13. [Maintenance](#maintenance)

---

## Project Overview

### Introduction
The Intern Management System is a comprehensive web application designed to streamline the process of managing internship applications, document submissions, and administrative workflows. The system provides separate interfaces for applicants, administrators, and interns to handle their respective responsibilities efficiently.

### Purpose
- Automate the internship application process
- Centralize document management
- Provide role-based access control
- Streamline administrative workflows
- Track application status and history

### Key Benefits
- **Efficiency**: Reduces manual paperwork and processing time
- **Transparency**: Clear visibility of application status
- **Scalability**: Handles multiple applicants and programs simultaneously
- **Security**: Role-based access ensures data protection
- **User-Friendly**: Intuitive interfaces for all user types

---

## System Architecture

### Frontend Architecture
```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
│   ├── ApplicationForm.jsx
│   ├── MyApplications.jsx
│   ├── ApplicationDetail.jsx
│   ├── AdminDashboard.jsx
│   └── Programs.jsx
├── services/           # API service layer
│   └── api.js
├── context/            # React context providers
├── hooks/              # Custom React hooks
└── utils/             # Utility functions
```

### Backend Architecture
```
backend/
├── accounts/           # User authentication and profiles
├── applications/       # Application and program management
├── documents/          # Document handling and storage
├── intern_management/  # Main project settings
├── media/             # File storage
├── requirements.txt   # Python dependencies
└── manage.py          # Django management script
```

### Database Architecture
- **PostgreSQL/SQLite**: Primary database
- **Media Storage**: Local file system for documents
- **Migrations**: Django ORM for database versioning

---

## Features

### For Applicants
- **User Registration & Authentication**: Secure signup and login system
- **Program Browsing**: View available internship programs
- **Application Submission**: Complete application forms with validation
- **Document Upload**: Upload required documents (School Recommendation Letter or NYSC Orientation Camp Letter)
- **Application Tracking**: Monitor application status in real-time
- **Profile Management**: Update personal information

### For Administrators
- **Dashboard Overview**: Comprehensive system statistics
- **Application Management**: Review, approve, or reject applications
- **Program Management**: Create and manage internship programs
- **User Management**: View and manage user accounts
- **Document Verification**: Verify uploaded documents
- **Reporting**: Generate reports and analytics

### For Interns
- **Profile Management**: Maintain personal and professional information
- **Document Management**: Upload and manage required documents
- **Status Tracking**: Monitor internship progress
- **Communication**: Receive notifications and updates

---

## Technology Stack

### Frontend Technologies
- **React 18**: Modern JavaScript library for building user interfaces
- **React Router**: Client-side routing
- **Axios**: HTTP client for API communication
- **React Toastify**: Notification system
- **TailwindCSS**: Utility-first CSS framework
- **Lucide React**: Icon library

### Backend Technologies
- **Django 4.2**: Python web framework
- **Django REST Framework**: API development toolkit
- **PostgreSQL**: Primary database (SQLite for development)
- **JWT**: Token-based authentication
- **Celery**: Asynchronous task processing
- **Redis**: Message broker for Celery

### Development Tools
- **Node.js**: JavaScript runtime
- **npm**: Package manager
- **Python 3.12+**: Backend programming language
- **pip**: Python package manager
- **Git**: Version control

---

## Installation Guide

### Prerequisites
- **Operating System**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **Python**: Version 3.12 or higher
- **Node.js**: Version 16.0 or higher
- **npm**: Version 8.0 or higher
- **Git**: For version control
- **PostgreSQL**: Version 12 or higher (optional, SQLite for development)

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd Intern-management-system
```

### Step 2: Backend Setup

#### 2.1 Create Virtual Environment
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

#### 2.2 Install Dependencies
```bash
pip install -r requirements.txt
```

#### 2.3 Database Setup
```bash
# For development (SQLite - default)
python manage.py makemigrations
python manage.py migrate

# For production (PostgreSQL)
# First, create database in PostgreSQL
# Then update settings.py with database credentials
python manage.py makemigrations
python manage.py migrate
```

#### 2.4 Create Superuser
```bash
python manage.py createsuperuser
```

#### 2.5 Load Initial Data
```bash
python manage.py loaddata fixtures/initial_data.json
```

### Step 3: Frontend Setup

#### 3.1 Install Dependencies
```bash
cd ../src
npm install
```

#### 3.2 Environment Configuration
Create `.env` file in the `src` directory:
```env
REACT_APP_API_BASE_URL=http://localhost:8000/api
REACT_APP_MEDIA_URL=http://localhost:8000/media
```

### Step 4: Start the Application

#### 4.1 Start Backend Server
```bash
cd backend
python manage.py runserver
```

#### 4.2 Start Frontend Development Server
```bash
cd src
npm start
```

#### 4.3 Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **Admin Panel**: http://localhost:8000/admin

---

## Configuration

### Backend Configuration

#### Settings File (`backend/intern_management/settings.py`)

```python
# Database Configuration
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# For PostgreSQL (Production)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'intern_management',
        'USER': 'your_username',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# Media Files Configuration
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Allowed Hosts
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', 'your-domain.com']

# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Email Configuration (for notifications)
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@gmail.com'
EMAIL_HOST_PASSWORD = 'your-app-password'
```

### Frontend Configuration

#### API Configuration (`src/services/api.js`)
```javascript
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';
const MEDIA_URL = process.env.REACT_APP_MEDIA_URL || 'http://localhost:8000/media';
```

---

## User Roles and Permissions

### Role Hierarchy
1. **Administrator**: Full system access
2. **Applicant**: Can apply and manage own applications
3. **Intern**: Can manage profile and documents

### Permission Matrix

| Feature | Administrator | Applicant | Intern |
|---------|---------------|-----------|---------|
| View Programs | ✅ | ✅ | ✅ |
| Create Application | ❌ | ✅ | ❌ |
| View Own Applications | ❌ | ✅ | ✅ |
| View All Applications | ✅ | ❌ | ❌ |
| Approve Applications | ✅ | ❌ | ❌ |
| Manage Programs | ✅ | ❌ | ❌ |
| Manage Users | ✅ | ❌ | ❌ |
| Upload Documents | ❌ | ✅ | ✅ |
| Verify Documents | ✅ | ❌ | ❌ |

---

## API Documentation

### Authentication Endpoints

#### POST /api/auth/register/
Register a new user account.

**Request Body:**
```json
{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securepassword",
    "first_name": "John",
    "last_name": "Doe",
    "role": "applicant"
}
```

**Response:**
```json
{
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "applicant"
}
```

#### POST /api/auth/login/
Authenticate user and return token.

**Request Body:**
```json
{
    "username": "johndoe",
    "password": "securepassword"
}
```

**Response:**
```json
{
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "user": {
        "id": 1,
        "username": "johndoe",
        "role": "applicant"
    }
}
```

### Program Endpoints

#### GET /api/programs/
List all active programs.

**Response:**
```json
[
    {
        "id": 1,
        "name": "Summer Industrial Training 2025",
        "description": "Comprehensive training program...",
        "duration": "3 months",
        "start_date": "2025-06-01",
        "end_date": "2025-08-31",
        "is_active": true,
        "created_at": "2025-01-01T00:00:00Z"
    }
]
```

### Application Endpoints

#### POST /api/applications/
Submit a new application.

**Request Body:**
```json
{
    "program": 1,
    "cover_letter": "I am excited to apply...",
    "why_interested": "I am interested because...",
    "skills_and_experience": "I have experience in...",
    "availability_start_date": "2025-06-01"
}
```

**Response:**
```json
{
    "id": 1,
    "program": 1,
    "program_name": "Summer Industrial Training 2025",
    "applicant": 1,
    "status": "pending",
    "submitted_at": "2025-01-15T10:30:00Z",
    "cover_letter": "I am excited to apply...",
    "why_interested": "I am interested because...",
    "skills_and_experience": "I have experience in...",
    "availability_start_date": "2025-06-01"
}
```

#### GET /api/applications/my-applications/
Get current user's applications.

**Response:**
```json
[
    {
        "id": 1,
        "program_name": "Summer Industrial Training 2025",
        "status": "pending",
        "submitted_at": "2025-01-15T10:30:00Z",
        "documents": [
            {
                "id": 1,
                "document_type_name": "School Recommendation Letter",
                "file_name": "recommendation.pdf",
                "uploaded_at": "2025-01-15T10:35:00Z",
                "is_verified": false
            }
        ]
    }
]
```

### Document Endpoints

#### POST /api/documents/
Upload a document.

**Request Body (multipart/form-data):**
```
application_id: 1
document_type: 7
file: [PDF file]
```

**Response:**
```json
{
    "id": 1,
    "application": 1,
    "document_type_name": "School Recommendation Letter",
    "file_name": "recommendation.pdf",
    "file_url": "http://localhost:8000/media/documents/2025/01/recommendation.pdf",
    "file_size": 524288,
    "uploaded_at": "2025-01-15T10:35:00Z",
    "is_verified": false
}
```

#### GET /api/types/
Get available document types.

**Response:**
```json
[
    {
        "id": 7,
        "name": "School Recommendation Letter",
        "description": "Official recommendation from educational institution",
        "max_file_size": 5242880,
        "allowed_extensions": ["pdf", "doc", "docx"]
    },
    {
        "id": 8,
        "name": "NYSC Orientation Camp Letter",
        "description": "NYSC orientation camp completion letter",
        "max_file_size": 5242880,
        "allowed_extensions": ["pdf", "doc", "docx"]
    }
]
```

---

## Database Schema

### User Management

#### User Model (Django's built-in User)
- `id`: Primary key
- `username`: Unique username
- `email`: Email address
- `first_name`: First name
- `last_name`: Last name
- `password`: Encrypted password
- `is_staff`: Admin access flag
- `is_active`: Account status

#### Profile Model
```python
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone_number = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### Program Management

#### Program Model
```python
class Program(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    duration = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### Application Management

#### Application Model
```python
class Application(models.Model):
    applicant = models.ForeignKey(User, on_delete=models.CASCADE)
    program = models.ForeignKey(Program, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    cover_letter = models.TextField()
    why_interested = models.TextField()
    skills_and_experience = models.TextField()
    availability_start_date = models.DateField()
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_applications')
    admin_notes = models.TextField(blank=True)
```

#### ApplicationStatusHistory Model
```python
class ApplicationStatusHistory(models.Model):
    application = models.ForeignKey(Application, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    changed_by = models.ForeignKey(User, on_delete=models.CASCADE)
    changed_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)
```

### Document Management

#### DocumentType Model
```python
class DocumentType(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    max_file_size = models.PositiveIntegerField(default=5242880)  # 5MB
    allowed_extensions = models.JSONField(default=list)
    is_required = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
```

#### Document Model
```python
class Document(models.Model):
    application = models.ForeignKey(Application, on_delete=models.CASCADE)
    document_type = models.ForeignKey(DocumentType, on_delete=models.CASCADE)
    file = models.FileField(upload_to='documents/%Y/%m/')
    file_name = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField()
    uploaded_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)
    verification_notes = models.TextField(blank=True)
    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    verified_at = models.DateTimeField(null=True, blank=True)
```

---

## Development Guide

### Code Structure

#### Frontend Components
- **Components**: Reusable UI components (buttons, forms, modals)
- **Pages**: Full page components (ApplicationForm, Dashboard, etc.)
- **Services**: API communication layer
- **Context**: Global state management
- **Hooks**: Custom React hooks

#### Backend Structure
- **Models**: Database models
- **Views**: API viewsets and views
- **Serializers**: Data serialization/deserialization
- **Urls**: URL routing
- **Management Commands**: Custom Django commands

### Development Workflow

#### 1. Feature Development
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
# Test changes
# Commit changes
git add .
git commit -m "Add new feature"
git push origin feature/new-feature

# Create pull request
```

#### 2. Testing
```bash
# Backend tests
cd backend
python manage.py test

# Frontend tests
cd src
npm test
```

#### 3. Code Quality
```bash
# Python linting
pip install flake8
flake8 .

# JavaScript linting
npm run lint
```

### Best Practices

#### Frontend
- Use functional components with hooks
- Implement proper error handling
- Use consistent naming conventions
- Optimize component reusability
- Implement proper state management

#### Backend
- Follow Django best practices
- Use proper model validation
- Implement comprehensive error handling
- Use serializers for API responses
- Write comprehensive tests

---

## Deployment Guide

### Production Deployment

#### 1. Server Requirements
- **Operating System**: Ubuntu 20.04 LTS or CentOS 8
- **RAM**: Minimum 4GB, Recommended 8GB
- **Storage**: Minimum 50GB SSD
- **CPU**: Minimum 2 cores, Recommended 4 cores

#### 2. Software Requirements
- **Python 3.12+**
- **Node.js 18+**
- **PostgreSQL 12+**
- **Nginx**
- **Gunicorn**
- **Redis**
- **Supervisor**

#### 3. Deployment Steps

##### 3.1 Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install python3.12 python3.12-venv python3-pip nodejs npm postgresql nginx redis-server supervisor -y
```

##### 3.2 Database Setup
```bash
# Create database
sudo -u postgres createdb intern_management

# Create user
sudo -u postgres createuser --interactive
```

##### 3.3 Application Setup
```bash
# Clone repository
git clone <repository-url> /var/www/intern_management
cd /var/www/intern_management

# Backend setup
cd backend
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Update settings.py for production
# Set DEBUG=False
# Configure database
# Set ALLOWED_HOSTS
# Configure static files

# Collect static files
python manage.py collectstatic

# Database migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

##### 3.4 Frontend Build
```bash
cd src
npm install
npm run build
```

##### 3.5 Gunicorn Configuration
Create `/etc/systemd/system/gunicorn.service`:
```ini
[Unit]
Description=gunicorn daemon
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/intern_management/backend
ExecStart=/var/www/intern_management/backend/venv/bin/gunicorn --workers 3 --bind unix:/var/www/intern_management/backend/gunicorn.sock intern_management.wsgi:application

[Install]
WantedBy=multi-user.target
```

##### 3.6 Nginx Configuration
Create `/etc/nginx/sites-available/intern_management`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location = /favicon.ico { access_log off; log_not_found off; }
    
    location /static/ {
        root /var/www/intern_management/backend;
    }

    location /media/ {
        root /var/www/intern_management/backend;
    }

    location /api/ {
        proxy_pass http://unix:/var/www/intern_management/backend/gunicorn.sock;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
        proxy_redirect off;
    }

    location / {
        root /var/www/intern_management/src/build;
        try_files $uri $uri/ /index.html;
    }
}
```

##### 3.7 SSL Configuration
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com
```

##### 3.8 Start Services
```bash
# Start Gunicorn
sudo systemctl start gunicorn
sudo systemctl enable gunicorn

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Start Redis
sudo systemctl start redis
sudo systemctl enable redis
```

### Environment Variables

#### Production `.env` File
```env
# Backend
DEBUG=False
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://username:password@localhost:5432/intern_management
ALLOWED_HOSTS=your-domain.com,www.your-domain.com

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Frontend
REACT_APP_API_BASE_URL=https://your-domain.com/api
REACT_APP_MEDIA_URL=https://your-domain.com/media
```

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors
**Problem**: `OperationalError: could not connect to server`
**Solution**:
- Check PostgreSQL service status: `sudo systemctl status postgresql`
- Verify database credentials in settings.py
- Ensure database exists: `sudo -u postgres psql -l`

#### 2. Static Files Not Loading
**Problem**: CSS/JS files not loading in production
**Solution**:
- Run `python manage.py collectstatic`
- Check Nginx configuration for static files
- Verify file permissions

#### 3. CORS Issues
**Problem**: Browser blocks API requests
**Solution**:
- Add frontend URL to `CORS_ALLOWED_ORIGINS` in settings.py
- Restart Django server

#### 4. File Upload Issues
**Problem**: Documents not uploading
**Solution**:
- Check media directory permissions
- Verify `MEDIA_ROOT` and `MEDIA_URL` settings
- Ensure file size limits are appropriate

#### 5. Authentication Issues
**Problem**: Login/logout not working
**Solution**:
- Check JWT configuration
- Verify token expiration settings
- Clear browser cookies and localStorage

### Debug Mode

#### Enable Debug Logging
```python
# settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': 'debug.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}
```

#### Common Debug Commands
```bash
# Check Django version
python --version
python manage.py --version

# Check database status
python manage.py dbshell
python manage.py showmigrations

# Check installed apps
python manage.py shell
>>> from django.apps import apps
>>> apps.get_app_configs()
```

---

## Maintenance

### Regular Tasks

#### Daily
- Monitor system logs
- Check application performance
- Verify backup completion

#### Weekly
- Update security patches
- Review user activity
- Clean up temporary files

#### Monthly
- Database maintenance
- Update dependencies
- Performance optimization
- Security audit

### Backup Strategy

#### Database Backup
```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d)
pg_dump intern_management > /backups/db_backup_$DATE.sql
```

#### File Backup
```bash
# Backup media files
tar -czf /backups/media_backup_$DATE.tar.gz /var/www/intern_management/backend/media/
```

### Performance Optimization

#### Database Optimization
```sql
-- Create indexes
CREATE INDEX idx_application_status ON applications_application(status);
CREATE INDEX idx_document_application ON documents_document(application_id);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM applications_application WHERE status = 'pending';
```

#### Caching Strategy
```python
# Redis caching
from django.core.cache import cache

def get_programs():
    programs = cache.get('active_programs')
    if not programs:
        programs = Program.objects.filter(is_active=True)
        cache.set('active_programs', programs, 3600)  # 1 hour
    return programs
```

### Security Maintenance

#### Regular Security Updates
```bash
# Update Python packages
pip list --outdated
pip install --upgrade package_name

# Update Node.js packages
npm audit
npm audit fix
```

#### Security Best Practices
- Regularly update passwords
- Monitor access logs
- Implement rate limiting
- Use HTTPS everywhere
- Regular security audits

---

## Support and Contact

### Getting Help
- **Documentation**: This comprehensive guide
- **Issue Tracking**: GitHub Issues
- **Community**: Developer forums
- **Email Support**: support@your-domain.com

### Contributing
- Fork the repository
- Create feature branch
- Submit pull request
- Follow coding standards

### License
This project is licensed under the MIT License. See LICENSE file for details.

---

## Version History

### Version 1.0.0 (Current)
- Initial release
- Basic application functionality
- Document upload system
- Admin dashboard
- User authentication

### Future Roadmap
- Email notifications
- Advanced reporting
- Mobile app
- Integration with external systems
- AI-powered application screening

---

*This documentation is maintained and updated regularly. Last updated: January 2026*
