// routes/adminRoutes.js
const express = require('express');
const { AdminController } = require('../controllers');
const { authenticateToken, requireRole } = require('../middleware');
const { 
  validateCreateSpecialty, 
  validateCreateDoctor, 
  validateUpdateUser,
  validateDoctorAvailability 
} = require('../middleware');

const router = express.Router();

// Todas las rutas requieren rol de administrador
router.use(authenticateToken);
router.use(requireRole('admin'));

// Especialidades
router.get('/specialties', AdminController.getSpecialties);
router.post('/specialties', validateCreateSpecialty, AdminController.createSpecialty);

// Doctores
router.get('/doctors', AdminController.getDoctors);
router.post('/doctors', validateCreateDoctor, AdminController.createDoctor);
router.get('/doctors/:doctorId/availability', AdminController.getDoctorAvailability);
router.put('/doctors/:doctorId/availability', validateDoctorAvailability, AdminController.updateDoctorAvailability);

// Usuarios
router.get('/users', AdminController.getUsers);
router.put('/users/:userId', validateUpdateUser, AdminController.updateUser);

// Estadísticas
router.get('/stats', AdminController.getStats);

module.exports = router;