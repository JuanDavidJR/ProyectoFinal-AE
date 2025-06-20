// middleware/errorMiddleware.js
const errorHandler = (error, req, res, next) => {
  console.error('Error no manejado:', error);
  
  // Error de validación de Joi o express-validator
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Error de validación',
      details: error.details || error.message
    });
  }

  // Error de JWT
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Token inválido' });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expirado' });
  }

  // Error de base de datos
  if (error.code) {
    switch (error.code) {
      case '23505': // Unique violation
        return res.status(400).json({ error: 'Ya existe un registro con esos datos' });
      case '23503': // Foreign key violation
        return res.status(400).json({ error: 'Referencias inválidas en los datos' });
      case '23502': // Not null violation
        return res.status(400).json({ error: 'Campos requeridos faltantes' });
      default:
        return res.status(500).json({ error: 'Error de base de datos' });
    }
  }

  // Error genérico del servidor
  res.status(error.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Error interno del servidor' 
      : error.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  });
};

// Middleware para rutas no encontradas
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    path: req.originalUrl,
    method: req.method
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};