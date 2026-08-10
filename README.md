# 🎓 Academic Management System

A modern, full-stack Academic Management System built with **FastAPI**, **PostgreSQL**, **SQLAlchemy**, and **React**. The platform streamlines school administration by providing secure role-based access for **Administrators**, **Teachers**, and **Students**, with features including authentication, student records management, course administration, score management, automatic result computation, transcript generation, PDF report cards, QR code verification, and audit logging.

---

## 🚀 Project Overview

The Academic Management System is designed to simplify and automate the daily operations of educational institutions. It provides a centralized platform for managing academic data while ensuring security, scalability, and maintainability through modern software engineering practices.

The system supports three primary user roles:

- **Administrator** — Manages the entire system, including users, academic sessions, courses, subjects, results, and school settings.
- **Teacher** — Manages assigned courses, enters student scores, and monitors academic performance.
- **Student** — Accesses personal profile information, academic results, report cards, and transcripts.

The backend exposes a secure REST API developed with FastAPI, while the frontend delivers a responsive user experience using React and Vite. PostgreSQL serves as the primary relational database, with SQLAlchemy providing ORM support for efficient data management.



## 🚀 Tech Stack

![Python](https://img.shields.io/badge/Python-3.13-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?logo=postgresql)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-ORM-red)
![Pydantic](https://img.shields.io/badge/Pydantic-Validation-E92063)
![JWT](https://img.shields.io/badge/JWT-Authentication-black?logo=jsonwebtokens)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-Build-646CFF?logo=vite)
![Git](https://img.shields.io/badge/Git-Version_Control-F05032?logo=git)
![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?logo=github)



## 📖 Project Overview

The Academic Management System is a modern, full-stack web application designed to simplify and automate school administration. It provides a secure, role-based platform where administrators, teachers, students, and parents can efficiently manage academic activities from a single system.

The application is built with a RESTful FastAPI backend and a modern React frontend, using PostgreSQL as the primary database. Authentication is secured using JSON Web Tokens (JWT), ensuring protected access to resources based on user roles.

The project focuses on performance, scalability, maintainability, and real-world deployment practices, making it suitable for educational institutions of different sizes.



## ✨ Features

### 👨‍💼 Administrator
- User Management
- Student Registration
- Teacher Management
- Parent Management
- Course Management
- Subject Management
- Academic Sessions
- School Terms
- Result Publishing
- Transcript Generation
- PDF Result Printing
- Audit Logging
- Role & Permission Management

### 👨‍🏫 Teacher
- Teacher Dashboard
- Assigned Courses
- Student Score Entry
- Bulk Score Upload
- Result Preview
- Online Classes
- Student Performance Tracking

### 👨‍🎓 Student
- Secure Login
- Personal Profile
- View Results
- Download PDF Results
- View Academic Transcript
- Online Classes

### 🔐 Authentication
- JWT Authentication
- Password Hashing
- Password Reset
- Email Verification
- Protected Routes
- Role-Based Authorization



## 🏗️ Project Architecture

```
Academic Management System
│
├── Backend (FastAPI)
│   ├── Authentication
│   ├── CRUD Operations
│   ├── SQLAlchemy Models
│   ├── Pydantic Schemas
│   ├── PostgreSQL Database
│   ├── JWT Security
│   └── PDF Report Generation
│
├── Frontend (React + Vite)
│   ├── Admin Dashboard
│   ├── Teacher Dashboard
│   ├── Student Portal
│   ├── Protected Routes
│   ├── API Services
│   └── Responsive UI
│
└── PostgreSQL Database
```




## 📂 Folder Structure

```
academic-management-system/
│
├── backend/
│   ├── auth.py
│   ├── crud.py
│   ├── database.py
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   └── requirements.txt
│
├── frontend/
│   └── vite-project/
│       ├── src/
│       ├── public/
│       └── package.json
│
├── .gitignore
├── README.md
└── LICENSE
```

The application emphasizes security through JWT authentication, password hashing, role-based authorization, audit logging, email verification, and password reset functionality.
