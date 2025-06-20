// middleware/index.js
const { authenticateToken, requireRole } = require('./authMiddleware');
const { errorHandler, notFoundHandler } = require('./errorMiddleware');
const { 
  validateRegister, 
  validateLogin, 
  validateCreateAppointment,
  validateUpdateAppointment,
  validateCreateSpecialty,
  validateCreateDoctor,
  validateUpdateUser,
  validateDoctorAvailability
} = require('./validationMiddleware');

module.exports = {
  authenticateToken,
  requireRole,
  errorHandler,
  notFoundHandler,
  validateRegister,
  validateLogin,
  validateCreateAppointment,
  validateUpdateAppointment,
  validateCreateSpecialty,
  validateCreateDoctor,
  validateUpdateUser,
  validateDoctorAvailability
};