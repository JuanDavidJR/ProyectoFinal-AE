// app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Importar rutas
const { authRoutes, appointmentRoutes, adminRoutes } = require('./routes');

// Importar middleware
const { errorHandler, notFoundHandler } = require('./middleware');
const { TokenBlacklist } = require('./models');

const app = express();

// Middleware de seguridad
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000000, // máximo 100 requests por IP por ventana de tiempo
  message: {
    error: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.'
  }
});
app.use(limiter);

// Rate limiting más estricto para auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error: 'Demasiados intentos de autenticación, intenta de nuevo más tarde.'
  }
});

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Middleware para parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

//app.use((req, res, next) => {
//  res.setHeader('Content-Type', 'application/json; charset=utf-8');
//  next();
//});

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas principales
//app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'MEDIAGENDA Backend'
  });
});

// Ruta raíz original (comentada para evitar conflicto)
// app.get('/', (req, res) => {
//   res.json({
//     message: 'MEDIAGENDA API v1.0',
//     status: 'Funcionando correctamente',
//     endpoints: {
//       auth: '/api/auth',
//       appointments: '/api/appointments',
//       admin: '/api/admin'
//     }
//   });
// });

// ✅ Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', '../frontendindex.html'));
});

// Middleware de manejo de errores 404
app.use('*', notFoundHandler);

// Middleware de manejo de errores global
app.use(errorHandler);

// Limpiar tokens expirados cada hora
setInterval(() => {
  TokenBlacklist.cleanExpired();
}, 60 * 60 * 1000);

module.exports = app;
