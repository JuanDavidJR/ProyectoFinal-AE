// server.js
const app = require('./app');
const express = require('express'); // ✅ ¡IMPORTANTE!
const pool = require('./config/database');
const path = require('path');

const PORT = process.env.PORT || 3000;

// Función para verificar la conexión a la base de datos
const checkDatabaseConnection = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('✅ Conexión a PostgreSQL establecida correctamente');
  } catch (error) {
    console.error('❌ Error al conectar con PostgreSQL:', error);
    process.exit(1);
  }
};

// Manejo de cierre graceful
const gracefulShutdown = () => {
  console.log('🔄 Cerrando servidor...');
  pool.end(() => {
    console.log('🔌 Conexión a PostgreSQL cerrada');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Iniciar servidor
const startServer = async () => {
  await checkDatabaseConnection();
  
  // ✅ Servir archivos estáticos
  app.use(express.static(path.join(__dirname, '../frontend')));
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
  });
  
  app.listen(PORT, () => {
    console.log('🚀 MEDIAGENDA Backend iniciado');
    console.log(`📍 Servidor corriendo en puerto ${PORT}`);
    console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3001'}`);
    console.log('📋 Endpoints disponibles:');
    console.log('   - GET  /health - Estado del servidor');
    console.log('   - POST /api/auth/register - Registro de usuarios');
    console.log('   - POST /api/auth/login - Inicio de sesión');
    console.log('   - POST /api/auth/logout - Cerrar sesión');
    console.log('   - GET  /api/auth/me - Información del usuario');
    console.log('   - GET  /api/appointments/specialties - Lista de especialidades');
    console.log('   - GET  /api/appointments/my-appointments - Citas del usuario');
    console.log('   - POST /api/appointments - Crear nueva cita');
    console.log('   - GET  /api/admin/stats - Estadísticas (Admin)');
    console.log('═'.repeat(2));
  });
};

startServer();