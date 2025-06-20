# Mediagenda Backend

This is the backend component of the **Mediagenda** application — a medical appointment management system designed to handle user authentication, doctor-patient scheduling, and administrative tasks through a secure RESTful API.

## 🚀 Features

- User registration and login (admin, doctor, patient)
- Role-based access control
- Appointment creation, cancellation, and completion
- Doctor specialty management
- JWT-based authentication with token blacklist
- Rate limiting and security middleware
- PostgreSQL integration

## 📁 Project Structure

```
mediagenda-backend/
├── controllers/         # Business logic
├── middleware/          # Custom middleware (auth, error handling)
├── models/              # Database queries and utilities
├── routes/              # API route definitions
├── sql/                 # Database schema and seed data
├── frontend/            # Static HTML, CSS, JS served by backend
├── .env                 # Environment configuration
├── app.js               # App initialization
├── server.js            # Server entry point
└── package.json         # Dependencies and scripts
```

## 🧪 Running Locally

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your `.env` file with the following:
   ```
   PORT=3000
   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=mediagenda_db
   FRONTEND_URL=http://localhost:3000
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 🛡️ Security & Best Practices

- Uses `helmet`, `cors`, and rate-limiting for enhanced protection.
- JWTs are stored in HTTP-only cookies and are blacklisted upon logout.
- Tokens expire and are periodically cleaned from the database.

## 🗃️ Database

PostgreSQL is required. To set up the schema and initial data:

```bash
psql -U your_user -d mediagenda_db -f sql/01-init-schema.sql
psql -U your_user -d mediagenda_db -f sql/02-create-tables.sql
psql -U your_user -d mediagenda_db -f sql/03-insert-data.sql
```
