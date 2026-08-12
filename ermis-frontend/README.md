# ERMIS - Examination Records Management Information System

A full-stack web application for managing student records, ICT infrastructure 
and educational data across institutions.

## 🚀 Tech Stack

**Frontend:**

- React 19 + Vite
- Tailwind CSS
- React Router DOM
- Tabler Icons

**Backend:**

- Node.js + Express
- MongoDB Atlas
- JWT Authentication
- Multer (file uploads)

**DevOps:**

- Docker + Docker Compose
- Nginx (reverse proxy)
- MongoDB Atlas (cloud database)
- AWS EC2 (deployment)

## 📋 Features

- Schools examination and records management
- ICT records and inventory tracking
- Role-based access control (Admin, Supervisor, ICT, Records_Officer)
- Secure JWT authentication
- File upload support
- Responsive dashboard interface

## 🐳 Running with Docker

### Prerequisites
- Docker installed
- Docker Compose installed

### Setup

1. Clone the repository:
```bash
   git clone https://github.com/saidabiola/ERMIS-SYSTEM.git
   cd ERMIS-SYSTEM
```

2. Create environment file:
```bash
   cp ermis-backend/.env.example ermis-backend/.env
   # Edit .env with your MongoDB URI and JWT Secret
```

3. Start all services:
```bash
   docker compose up --build -d
```

4. Access the application:
   - Frontend: http://localhost
   - Backend API: http://localhost:5000

### Stop services:
```bash
docker compose down
```

## 🔧 Environment Variables

Create a `.env` file in `ermis-backend/` with:


## 📁 Project Structure

ERMIS-SYSTEM/
├── ermis-backend/ # Node.js/Express API
│ ├── middleware/ # Auth middleware
│ ├── models/ # MongoDB models
│ ├── routes/ # API routes
│ ├── uploads/ # File uploads
│ ├── server.js # Entry point
│ └── Dockerfile
├── ermis-frontend/ # React/Vite frontend
│ ├── src/
│ │ ├── components/ # Reusable components
│ │ ├── pages/ # Page components
│ │ └── App.jsx
│ ├── nginx.conf # Nginx configuration
│ └── Dockerfile
└── docker-compose.yml # Container orchestration


## 👨‍💻 Author

**Benson Abiola Said**
- GitHub: [@saidabiola](https://github.com/saidabiola)
- Email: bensaid1924@gmail.com
- Location: Nairobi, Kenya
