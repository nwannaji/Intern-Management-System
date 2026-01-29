# PostgreSQL Migration Instructions

## Prerequisites

1. Install PostgreSQL 17 on your system
2. Make sure PostgreSQL service is running
3. Install psycopg2-binary: `pip install psycopg2-binary`

## Setup Steps

### 1. Create Database

Run these commands in PostgreSQL (psql or pgAdmin):

```sql
CREATE DATABASE intern_management_db;
```

Or run the setup script:

```bash
psql -U postgres -f setup_postgresql.sql
```

### 2. Update .env File

Edit your `.env` file with your PostgreSQL credentials:

```
DB_NAME=intern_management_db
DB_USER=postgres
DB_PASSWORD=your_actual_postgres_password
DB_HOST=localhost
DB_PORT=5432
```

### 3. Migrate Data from SQLite to PostgreSQL

#### Option A: Fresh Start (Recommended)

```bash
# Delete old migrations (optional, for fresh start)
rm -rf */migrations/0*.py
rm -rf */migrations/__pycache__

# Create new migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Load fixtures if you have any
python manage.py loaddata fixtures/your_data.json
```

#### Option B: Keep Existing Data

```bash
# Install data migration tool
pip install django-postgres-copy

# Export data from SQLite
python manage.py dumpdata > data.json

# Apply migrations to PostgreSQL
python manage.py migrate

# Import data to PostgreSQL
python manage.py loaddata data.json
```

### 4. Test the Setup

```bash
python manage.py runserver
```

### 5. Update requirements.txt

Add psycopg2-binary to requirements.txt:

```
psycopg2-binary==2.9.11
```

## Troubleshooting

### Connection Issues

- Make sure PostgreSQL service is running
- Check firewall settings
- Verify credentials in .env file

### Permission Issues

- Grant proper privileges to the database user
- Check PostgreSQL pg_hba.conf configuration

### Migration Issues

- Backup your SQLite data first
- Check for any custom SQL that might be SQLite-specific
- Review migration files for PostgreSQL compatibility
