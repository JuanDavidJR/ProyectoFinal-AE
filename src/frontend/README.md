# Mediagenda Frontend

This is the frontend interface of the **Mediagenda** project — a responsive and role-based UI for patients, doctors, and administrators to manage and monitor medical appointments effectively.

## 🧩 Features

- Clean and modern UI with role-specific dashboards
- Login and registration forms
- Appointment scheduling and history views
- Real-time feedback and notifications
- Seamless integration with the backend via REST API

## 📁 Folder Structure

```
frontend/
├── css/
│   └── custom.css              # Custom styles
├── js/
│   ├── api.js                  # API client abstraction
│   ├── auth.js                 # Authentication logic
│   ├── dashboard.js            # Dynamic dashboard population
│   ├── appointments.js         # Appointment loading and actions
│   └── utils.js                # Utilities and helpers
├── index.html                  # Home redirection (optional)
├── login.html                  # User login
├── register.html               # Registration page
├── dashboard.html              # Shared dashboard (dynamic per role)
├── new-appointment.html        # Appointment creation page
├── my-appointments.html        # Patient view of appointments
├── admin-doctors.html          # Admin: manage doctors
├── admin-appointments.html     # Admin: manage all appointments
├── admin-stats.html            # Admin: analytics and statistics
└── doctor-appointments.html    # Doctor's upcoming appointments
```

## ⚙️ Usage

The frontend is served statically by the backend using Express. Simply place it under the `/frontend` directory of the backend project. Access the app via:

```
http://localhost:3000/login.html
```

## 🖥️ Technologies

- HTML5
- CSS3 (custom and responsive)
- JavaScript (vanilla)
- FontAwesome for icons
- REST API integration

## 🔐 Security Considerations

- Sessions and tokens are managed by the backend via secure HTTP-only cookies.
- Frontend displays are restricted based on user roles.

