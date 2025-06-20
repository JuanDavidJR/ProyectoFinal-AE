// scripts/initDatabase.js
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const initDatabase = async () => {
  const client = await pool.connect();
  
  try {
    console.log('Inicializando base de datos...');

    // Crear tablas
    await client.query(`
      -- Tabla de usuarios
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'doctor', 'admin')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabla de especialidades
      CREATE TABLE IF NOT EXISTS specialties (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabla de doctores
      CREATE TABLE IF NOT EXISTS doctors (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        specialty_id INTEGER REFERENCES specialties(id) ON DELETE CASCADE,
        license_number VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabla de disponibilidad de doctores
      CREATE TABLE IF NOT EXISTS doctor_availability (
        id SERIAL PRIMARY KEY,
        doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,
        day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1=Lunes, 7=Domingo
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabla de citas
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(doctor_id, appointment_date, appointment_time)
      );

      -- Tabla de blacklist de tokens
      CREATE TABLE IF NOT EXISTS token_blacklist (
        id SERIAL PRIMARY KEY,
        token TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Índices para optimización
      CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
      CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
      CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
      CREATE INDEX IF NOT EXISTS idx_token_blacklist_token ON token_blacklist(token);
      CREATE INDEX IF NOT EXISTS idx_doctor_availability_doctor_id ON doctor_availability(doctor_id);
    `);

    // Insertar especialidades básicas
    await client.query(`
      INSERT INTO specialties (name, description) VALUES
      ('Medicina General', 'Atención médica general y consultas básicas'),
      ('Cardiología', 'Especialidad en enfermedades del corazón y sistema cardiovascular'),
      ('Dermatología', 'Especialidad en enfermedades de la piel'),
      ('Pediatría', 'Especialidad en atención médica infantil'),
      ('Ginecología', 'Especialidad en salud femenina y reproductiva'),
      ('Traumatología', 'Especialidad en lesiones del sistema musculoesquelético'),
      ('Neurología', 'Especialidad en enfermedades del sistema nervioso')
      ON CONFLICT (name) DO NOTHING;
    `);

    // Crear usuario administrador por defecto
    const adminPassword = await bcrypt.hash('admin123', 10);
    await client.query(`
      INSERT INTO users (email, password, name, role) VALUES
      ('admin@mediagenda.com', $1, 'Administrador Principal', 'admin')
      ON CONFLICT (email) DO NOTHING;
    `, [adminPassword]);

    // Crear algunos doctores de ejemplo
    const doctorPassword = await bcrypt.hash('doctor123', 10);
    
    // Doctor 1 - Cardiología
    const doctor1Result = await client.query(`
      INSERT INTO users (email, password, name, phone, role) VALUES
      ('dr.cardio@mediagenda.com', $1, 'Dr. Juan Pérez', '+57 300 123 4567', 'doctor')
      ON CONFLICT (email) DO NOTHING
      RETURNING id;
    `, [doctorPassword]);

    if (doctor1Result.rows.length > 0) {
      const cardioSpecialty = await client.query('SELECT id FROM specialties WHERE name = $1', ['Cardiología']);
      await client.query(`
        INSERT INTO doctors (user_id, specialty_id, license_number) VALUES
        ($1, $2, 'MED-001-2024')
        ON CONFLICT (license_number) DO NOTHING;
      `, [doctor1Result.rows[0].id, cardioSpecialty.rows[0].id]);

      // Agregar disponibilidad (Lunes a Viernes, 8AM-5PM)
      const doctorRecord = await client.query('SELECT id FROM doctors WHERE license_number = $1', ['MED-001-2024']);
      if (doctorRecord.rows.length > 0) {
        for (let day = 1; day <= 5; day++) { // Lunes a Viernes
          await client.query(`
            INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time) VALUES
            ($1, $2, '08:00:00', '17:00:00')
            ON CONFLICT DO NOTHING;
          `, [doctorRecord.rows[0].id, day]);
        }
      }
    }

    // Doctor 2 - Dermatología
    const doctor2Result = await client.query(`
      INSERT INTO users (email, password, name, phone, role) VALUES
      ('dr.dermato@mediagenda.com', $1, 'Dra. María González', '+57 310 987 6543', 'doctor')
      ON CONFLICT (email) DO NOTHING
      RETURNING id;
    `, [doctorPassword]);

    if (doctor2Result.rows.length > 0) {
      const dermaSpecialty = await client.query('SELECT id FROM specialties WHERE name = $1', ['Dermatología']);
      await client.query(`
        INSERT INTO doctors (user_id, specialty_id, license_number) VALUES
        ($1, $2, 'MED-002-2024')
        ON CONFLICT (license_number) DO NOTHING;
      `, [doctor2Result.rows[0].id, dermaSpecialty.rows[0].id]);

      const doctorRecord = await client.query('SELECT id FROM doctors WHERE license_number = $1', ['MED-002-2024']);
      if (doctorRecord.rows.length > 0) {
        for (let day = 1; day <= 5; day++) {
          await client.query(`
            INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time) VALUES
            ($1, $2, '09:00:00', '16:00:00')
            ON CONFLICT DO NOTHING;
          `, [doctorRecord.rows[0].id, day]);
        }
      }
    }

    console.log('✅ Base de datos inicializada correctamente');
    console.log('📧 Admin: admin@mediagenda.com / admin123');
    console.log('👨‍⚕️ Doctor Cardiología: dr.cardio@mediagenda.com / doctor123');
    console.log('👩‍⚕️ Doctor Dermatología: dr.dermato@mediagenda.com / doctor123');

  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
  } finally {
    client.release();
    await pool.end();
  }
};

if (require.main === module) {
  initDatabase();
}

module.exports = { initDatabase };