# Community Volunteer Platform

This is a full-stack application for managing community volunteering and campaigns. The platform consists of a **React + Vite** frontend and a **Laravel (PHP)** backend.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

- **Node.js**: (Version 18.x or higher is recommended)
- **Composer**: For PHP dependency management
- **PHP**: (Version 8.1 or higher)
- **MySQL / PostgreSQL** or any other compatible database server

---

## Getting Started (Backend - Laravel)

The backend is located in the `backend/` directory.

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install PHP dependencies**:
   ```bash
   composer install
   ```

3. **Set up the environment variables**:
   Create a copy of the `.env.example` file and name it `.env`:
   ```bash
   copy .env.example .env
   ```
   *(For macOS/Linux, use `cp .env.example .env`)*

4. **Generate application key**:
   ```bash
   php artisan key:generate
   ```

5. **Configure the Database**:
   Open the `.env` file and configure your database connection settings:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=your_database_name
   DB_USERNAME=your_database_user
   DB_PASSWORD=your_database_password
   ```

6. **Configure Stripe (Backend)**:
   In the same `.env` file, add your Stripe test secret key and webhook secret (optional, for local webhook testing):
   ```env
   STRIPE_SECRET=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

7. **Run Migrations (Create database tables)**:
   Make sure your database server is running and the database exists, then run:
   ```bash
   php artisan migrate
   ```

8. **Link Storage**:
   To ensure file uploads work properly, create a symbolic link:
   ```bash
   php artisan storage:link
   ```

9. **Start the Laravel Development Server**:
   ```bash
   php artisan serve
   ```
   *The backend will now be running on http://127.0.0.1:8000*

---

## Getting Started (Frontend - React)

The frontend is located at the root of the project. Open a new terminal tab to run these commands so the backend can keep running.

1. **Navigate to the project root** (if you are in the `backend` folder):
   ```bash
   cd ..
   ```

2. **Install Node dependencies**:
   ```bash
   npm install
   ```

3. **Set up frontend environment variables**:
   Create a copy of `.env.example` and name it `.env` in the root folder, then configure your Stripe Publishable Key:
   ```bash
   copy .env.example .env
   ```
   ```env
   VITE_STRIPE_PK=pk_test_...
   ```

4. **Start the Vite Development Server**:
   ```bash
   npm run dev
   ```
   *The frontend will now be running (usually on http://localhost:5173).*

---

## Usage

You can now visit the Vite development server URL in your browser to view the application interactively! Make sure *both* the backend server (`php artisan serve`) and the frontend server (`npm run dev`) are running simultaneously.
