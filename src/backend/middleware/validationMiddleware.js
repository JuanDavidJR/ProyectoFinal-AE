// middleware/validationMiddleware.js
const { body } = require('express-validator');

// Validaciones para autenticación
const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Formato de correo inválido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('El nombre debe tener al menos 2 caracteres'),
  body('phone')
    .optional()
    .trim()
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Formato de correo inválido'),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
];

// Validaciones para citas
const validateCreateAppointment = [
  body('doctorId')
    .isInt()
    .withMessage('ID de doctor inválido'),
  body('appointmentDate')
    .isDate()
    .withMessage('Fecha inválida'),
  body('appointmentTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
    .withMessage('Formato de hora inválido'),
  body('notes')
    .optional()
    .trim()
];

const validateUpdateAppointment = [
  body('appointmentDate')
    .optional()
    .isDate()
    .withMessage('Fecha inválida'),
  body('appointmentTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
    .withMessage('Formato de hora inválido'),
  body('status')
    .optional()
    .isIn(['scheduled', 'completed', 'cancelled'])
    .withMessage('Estado inválido'),
  body('notes')
    .optional()
    .trim()
];

// Validaciones para administración
const validateCreateSpecialty = [
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('El nombre debe tener al menos 2 caracteres'),
  body('description')
    .optional()
    .trim()
];

const validateCreateDoctor = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Formato de correo inválido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('El nombre debe tener al menos 2 caracteres'),
  body('phone')
    .optional()
    .trim(),
  body('specialtyId')
    .isInt()
    .withMessage('ID de especialidad inválido'),
  body('licenseNumber')
    .trim()
    .isLength({ min: 5 })
    .withMessage('El número de licencia debe tener al menos 5 caracteres')
];

const validateUpdateUser = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('El nombre debe tener al menos 2 caracteres'),
  body('phone')
    .optional()
    .trim(),
  body('role')
    .optional()
    .isIn(['user', 'doctor', 'admin'])
    .withMessage('Rol inválido')
];

const validateDoctorAvailability = [
  body('availability')
    .isArray()
    .withMessage('La disponibilidad debe ser un array'),
  body('availability.*.day_of_week')
    .isInt({ min: 1, max: 7 })
    .withMessage('Día de la semana inválido'),
  body('availability.*.start_time')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
    .withMessage('Formato de hora de inicio inválido'),
  body('availability.*.end_time')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
    .withMessage('Formato de hora de fin inválido')
];

module.exports = {
  validateRegister,
  validateLogin,
  validateCreateAppointment,
  validateUpdateAppointment,
  validateCreateSpecialty,
  validateCreateDoctor,
  validateUpdateUser,
  validateDoctorAvailability
};