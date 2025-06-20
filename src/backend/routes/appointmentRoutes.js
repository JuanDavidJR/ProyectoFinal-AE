// routes/appointmentRoutes.js
const express = require('express');
const { AppointmentController } = require('../controllers');
const { authenticateToken, requireRole } = require('../middleware');
const { validateCreateAppointment, validateUpdateAppointment } = require('../middleware');

const router = express.Router();

// GET /api/appointments/specialties
router.get('/specialties', authenticateToken, AppointmentController.getSpecialties);

// GET /api/appointments/doctors/:specialtyId
router.get('/doctors/:specialtyId', authenticateToken, AppointmentController.getDoctorsBySpecialty);

// GET /api/appointments/availability/:doctorId
router.get('/availability/:doctorId', authenticateToken, AppointmentController.getAvailability);

// POST /api/appointments
router.post('/', 
  authenticateToken, 
  requireRole('user'), 
  validateCreateAppointment, 
  AppointmentController.createAppointment
);

// GET /api/appointments/my-appointments
router.get('/my-appointments', 
  authenticateToken, 
  requireRole('user'), 
  AppointmentController.getMyAppointments
);

// GET /api/appointments/doctor-appointments
router.get('/doctor-appointments', 
  authenticateToken, 
  requireRole('doctor'), 
  AppointmentController.getDoctorAppointments
);

// GET /api/appointments/all
router.get('/all', 
  authenticateToken, 
  requireRole('admin'), 
  AppointmentController.getAllAppointments
);

// PUT /api/appointments/:appointmentId
router.put('/:appointmentId', 
  authenticateToken, 
  requireRole('admin'), 
  validateUpdateAppointment, 
  AppointmentController.updateAppointment
);

// DELETE /api/appointments/:appointmentId
router.delete('/:appointmentId', 
  authenticateToken, 
  AppointmentController.cancelAppointment
);

module.exports = router;