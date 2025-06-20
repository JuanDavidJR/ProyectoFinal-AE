
// routes/authRoutes.js
const express = require('express');
const { AuthController } = require('../controllers');
const { authenticateToken } = require('../middleware');
const { validateRegister, validateLogin } = require('../middleware');

const router = express.Router();

// POST /api/auth/register
router.post('/register', validateRegister, AuthController.register);

// POST /api/auth/login
router.post('/login', validateLogin, AuthController.login);

// POST /api/auth/logout
router.post('/logout', authenticateToken, AuthController.logout);

// GET /api/auth/me
router.get('/me', authenticateToken, AuthController.getCurrentUser);

module.exports = router;
