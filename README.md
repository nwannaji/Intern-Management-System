# Intern Management System

A comprehensive web application for managing internship applications, document submissions, and administrative workflows.

## � Password Reset Feature Status

### ✅ Implementation Complete

- **Backend API**: Fully functional on Render
- **Frontend UI**: Implemented and ready
- **Email Integration**: Console backend for testing
- **Security**: Token-based with UUID and expiration

### 🌐 Deployment Status

#### Backend (Render) - ✅ WORKING

```
API Base URL: https://intern-management-backend-gi46.onrender.com/api/
Password Reset Endpoint: /auth/password-reset/
Status: ✅ Fully Functional
```

#### Frontend (Vercel) - 🔒 SSO PROTECTED

```
Frontend URL: https://intern-management-system-5q9u-mkkfnjmwo.vercel.app/
Status: 🔒 Protected by Vercel SSO
Issue: Authentication required for access
```

### 🧪 Testing Instructions

#### 1. Backend API Test (Working)

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}' \
  https://intern-management-backend-gi46.onrender.com/api/auth/password-reset/
```

#### 2. Local Development Test

```bash
# Start frontend locally
npm run dev

# Visit: http://localhost:5173/password-reset
```

#### 3. Password Reset Flow

1. Submit email → Creates token in database
2. Check backend logs for reset URL
3. Visit reset URL to set new password
4. Confirm password change

### 🔧 Technical Details

#### Backend Features

- ✅ Token generation with UUID
- ✅ 1-hour expiration
- ✅ Email logging to console
- ✅ Comprehensive error handling
- ✅ Security (no email enumeration)

#### Frontend Features

- ✅ Password reset request form
- ✅ Password reset confirmation
- ✅ Token validation
- ✅ Password strength indicators
- ✅ Error handling and user feedback

### �🚀 Quick Start

### Prerequisites

- Python 3.12+
- Node.js 16+
- PostgreSQL (optional, SQLite for development)

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd Intern-management-system
```

2. **Backend Setup**

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

3. **Frontend Setup**

```bash
cd src
npm install
```

4. **Start the Application**

```bash
# Terminal 1 - Backend
cd backend
python manage.py runserver

# Terminal 2 - Frontend
cd src
npm start
```

5. **Access the Application**

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api
- Admin Panel: http://localhost:8000/admin

## 📋 Features

### For Applicants

- ✅ User registration and authentication
- ✅ Browse available internship programs
- ✅ Submit applications with validation
- ✅ Upload required documents
- ✅ Track application status
- ✅ Profile management

### For Administrators

- ✅ Dashboard with system statistics
- ✅ Application management (approve/reject)
- ✅ Program management
- ✅ User management
- ✅ Document verification
- ✅ Reporting and analytics

### For Interns

- ✅ Profile management
- ✅ Document management
- ✅ Status tracking
- ✅ Communication notifications

## 🛠️ Technology Stack

### Frontend

- **React 18** - UI framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **TailwindCSS** - Styling
- **React Toastify** - Notifications

### Backend

- **Django 4.2** - Web framework
- **Django REST Framework** - API toolkit
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Celery** - Task processing

## 📁 Project Structure

```
Intern-management-system/
├── backend/                 # Django backend
│   ├── accounts/           # User authentication
│   ├── applications/       # Application management
│   ├── documents/          # Document handling
│   ├── intern_management/  # Main project settings
│   └── media/             # File storage
├── src/                    # React frontend
│   ├── components/         # Reusable components
│   ├── pages/             # Page components
│   ├── services/          # API services
│   └── utils/             # Utilities
├── PROJECT_DOCUMENTATION.md    # Complete documentation
├── Intern_Management_System_Documentation.docx  # Word documentation
└── README.md              # This file
```

## 🔧 Configuration

### Environment Variables

Create `.env` file in `src/` directory:

```env
REACT_APP_API_BASE_URL=http://localhost:8000/api
REACT_APP_MEDIA_URL=http://localhost:8000/media
```

### Database Configuration

For development (SQLite - default):

```python
# backend/intern_management/settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

For production (PostgreSQL):

```python
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
```

## 📚 Documentation

- **Complete Documentation**: `PROJECT_DOCUMENTATION.md`
- **Word Document**: `Intern_Management_System_Documentation.docx`
- **API Documentation**: Available in the complete documentation
- **Installation Guide**: Step-by-step setup instructions
- **Development Guide**: Code structure and best practices

## 🧪 Testing

### Backend Tests

```bash
cd backend
python manage.py test
```

### Frontend Tests

```bash
cd src
npm test
```

## 🚀 Deployment

### Production Deployment

1. **Server Setup**
   - Ubuntu 20.04 LTS or CentOS 8
   - 4GB+ RAM, 50GB+ SSD
   - Python 3.12+, Node.js 18+, PostgreSQL 12+

2. **Application Setup**
   - Configure production settings
   - Set up database
   - Configure static files
   - Set up SSL certificate

3. **Web Server**
   - Nginx for reverse proxy
   - Gunicorn for Django
   - Supervisor for process management

For detailed deployment instructions, see `PROJECT_DOCUMENTATION.md`.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

- **Documentation**: `PROJECT_DOCUMENTATION.md`
- **Issues**: GitHub Issues
- **Email**: support@your-domain.com

## 📄 License

This project is licensed under the MIT License.

## 🔑 Default Credentials

After setup, you can use:

- **Admin**: http://localhost:8000/admin
- **Default User**: Create during `python manage.py createsuperuser`

## 📊 System Status

- ✅ Application submission
- ✅ Document upload
- ✅ User authentication
- ✅ Admin dashboard
- ✅ Email notifications (configurable)

---

**For complete documentation, installation guide, and API reference, see `PROJECT_DOCUMENTATION.md`**

# Updated 01/30/2026 16:37:48
