-- PostgreSQL Database Setup Script for Intern Management System
-- Run these commands in PostgreSQL as a superuser

-- Create database
CREATE DATABASE intern_management_db;

-- Create user (optional - you can use existing postgres user)
-- CREATE USER intern_user WITH PASSWORD 'your_secure_password';

-- Grant privileges (if you created a new user)
-- GRANT ALL PRIVILEGES ON DATABASE intern_management_db TO intern_user;

-- Connect to the database
\c intern_management_db;

-- Grant schema privileges (if you created a new user)
-- GRANT ALL ON SCHEMA public TO intern_user;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO intern_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO intern_user;

-- Test connection
SELECT current_database(), current_user;
