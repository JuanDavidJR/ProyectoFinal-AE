// controllers/index.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const pool = require('../config/database');

// Importar modelos (solo una vez)
const { 
  User, 
  Specialty, 
  Doctor, 
  Appointment, 
  TokenBlacklist 
} = require('../models');

// ===== CONTROLADOR DE AUTENTICACIÓN =====
class AuthController {
  // POST /api/auth/register
  static async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, name, phone } = req.body;

      // Verificar si el usuario ya existe
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }

      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crear usuario
      const user = await User.create({
        email,
        password: hashedPassword,
        name,
        phone,
        role: 'user'
      });

      // Generar token
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // POST /api/auth/login
  static async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Buscar usuario
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      // Verificar contraseña
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      // Generar token
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.json({
        message: 'Login exitoso',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // POST /api/auth/logout
  static async logout(req, res) {
    try {
      const decoded = jwt.decode(req.token);
      const expiresAt = new Date(decoded.exp * 1000);
      
      await TokenBlacklist.add(req.token, expiresAt);
      res.json({ message: 'Logout exitoso' });
    } catch (error) {
      console.error('Error en logout:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // GET /api/auth/me
  static async getCurrentUser(req, res) {
    try {
      let userInfo = { ...req.user };

      // Si es doctor, obtener información adicional
      if (req.user.role === 'doctor') {
        const doctorInfo = await Doctor.findByUserId(req.user.id);
        if (doctorInfo) {
          userInfo.doctorInfo = doctorInfo;
        }
      }

      res.json({ user: userInfo });
    } catch (error) {
      console.error('Error al obtener información del usuario:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

// ===== CONTROLADOR DE CITAS =====
class AppointmentController {
  // GET /api/appointments/specialties
  static async getSpecialties(req, res) {
    try {
      const specialties = await Specialty.findAvailable();
      res.json(specialties);
    } catch (error) {
      console.error('Error al obtener especialidades:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // GET /api/appointments/doctors/:specialtyId
  static async getDoctorsBySpecialty(req, res) {
    try {
      const { specialtyId } = req.params;
      const doctors = await Doctor.findBySpecialty(specialtyId);
      res.json(doctors);
    } catch (error) {
      console.error('Error al obtener doctores:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // GET /api/appointments/availability/:doctorId
  static async getAvailability(req, res) {
    try {
      const { doctorId } = req.params;
      const { date } = req.query;

      if (!date) {
        return res.status(400).json({ error: 'Fecha requerida' });
      }

      const appointmentDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      appointmentDate.setHours(0, 0, 0, 0);

      // Verificar que la fecha sea al menos un día en el futuro
      if (appointmentDate <= today) {
        return res.status(400).json({ error: 'La cita debe ser agendada con al menos un día de anticipación' });
      }

      const dayOfWeek = appointmentDate.getDay() === 0 ? 7 : appointmentDate.getDay();

      // Obtener disponibilidad del doctor para ese día
      const availabilityResult = await pool.query(`
        SELECT start_time, end_time
        FROM doctor_availability
        WHERE doctor_id = $1 AND day_of_week = $2
      `, [doctorId, dayOfWeek]);

      if (availabilityResult.rows.length === 0) {
        return res.json({ availableSlots: [] });
      }

      const { start_time, end_time } = availabilityResult.rows[0];

      // Obtener citas ya agendadas para ese día
      const bookedResult = await pool.query(`
        SELECT appointment_time
        FROM appointments
        WHERE doctor_id = $1 AND appointment_date = $2 AND status != 'cancelled'
      `, [doctorId, date]);

      const bookedTimes = bookedResult.rows.map(row => row.appointment_time);

      // Generar slots disponibles (cada 2 horas)
      const availableSlots = [];
      const startHour = parseInt(start_time.split(':')[0]);
      const endHour = parseInt(end_time.split(':')[0]);

      for (let hour = startHour; hour < endHour; hour += 2) {
        const timeSlot = `${hour.toString().padStart(2, '0')}:00:00`;
        
        // Verificar si este slot no está ocupado
        const isBooked = bookedTimes.some(bookedTime => bookedTime === timeSlot);
        
        if (!isBooked) {
          availableSlots.push({
            time: timeSlot,
            displayTime: `${hour.toString().padStart(2, '0')}:00`
          });
        }
      }

      res.json({ availableSlots });
    } catch (error) {
      console.error('Error al obtener disponibilidad:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // POST /api/appointments
  static async createAppointment(req, res) {
    const client = await pool.connect();
    
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { doctorId, appointmentDate, appointmentTime, notes } = req.body;
      const userId = req.user.id;

      await client.query('BEGIN');

      // Verificar que la fecha sea al menos un día en el futuro
      const appointmentDateTime = new Date(appointmentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      appointmentDateTime.setHours(0, 0, 0, 0);

      if (appointmentDateTime <= today) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'La cita debe ser agendada con al menos un día de anticipación' });
      }

      // Obtener especialidad del doctor
      const doctorResult = await client.query(`
        SELECT d.specialty_id, s.name as specialty_name
        FROM doctors d
        JOIN specialties s ON d.specialty_id = s.id
        WHERE d.id = $1
      `, [doctorId]);

      if (doctorResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Doctor no encontrado' });
      }

      const specialtyId = doctorResult.rows[0].specialty_id;

      // Verificar que el usuario no tenga ya una cita para esa especialidad
      const hasConflict = await Appointment.checkUserSpecialtyConflict(userId, specialtyId);
      if (hasConflict) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Ya tienes una cita agendada para esta especialidad' });
      }

      // Verificar disponibilidad del doctor
      const dayOfWeek = appointmentDateTime.getDay() === 0 ? 7 : appointmentDateTime.getDay();
      
      const availabilityCheck = await client.query(`
        SELECT 1
        FROM doctor_availability
        WHERE doctor_id = $1 AND day_of_week = $2 AND start_time <= $3 AND end_time > $3
      `, [doctorId, dayOfWeek, appointmentTime]);

      if (availabilityCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'El doctor no está disponible en ese horario' });
      }

      // Verificar que el slot no esté ocupado
      const hasTimeConflict = await Appointment.checkConflict(doctorId, appointmentDate, appointmentTime);
      if (hasTimeConflict) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Este horario ya está ocupado' });
      }

      // Crear la cita
      const appointment = await Appointment.create({
        user_id: userId,
        doctor_id: doctorId,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        notes
      });

      await client.query('COMMIT');

      // Obtener información completa de la cita creada
      const fullAppointmentResult = await pool.query(`
        SELECT 
          a.id, a.appointment_date, a.appointment_time, a.status, a.notes,
          u.name as doctor_name, s.name as specialty_name
        FROM appointments a
        JOIN doctors d ON a.doctor_id = d.id
        JOIN users u ON d.user_id = u.id
        JOIN specialties s ON d.specialty_id = s.id
        WHERE a.id = $1
      `, [appointment.id]);

      res.status(201).json({
        message: 'Cita agendada exitosamente',
        appointment: fullAppointmentResult.rows[0]
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error al crear cita:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    } finally {
      client.release();
    }
  }

  // GET /api/appointments/my-appointments
  static async getMyAppointments(req, res) {
    try {
      const appointments = await Appointment.findByUserId(req.user.id);
      res.json(appointments);
    } catch (error) {
      console.error('Error al obtener citas del usuario:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // GET /api/appointments/doctor-appointments
  static async getDoctorAppointments(req, res) {
    try {
      // Obtener ID del doctor
      const doctorInfo = await Doctor.findByUserId(req.user.id);
      
      if (!doctorInfo) {
        return res.status(404).json({ error: 'Información de doctor no encontrada' });
      }

      const appointments = await Appointment.findByDoctorId(doctorInfo.id);
      res.json(appointments);
    } catch (error) {
      console.error('Error al obtener citas del doctor:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // GET /api/appointments/all
  static async getAllAppointments(req, res) {
    try {
      const appointments = await Appointment.findAll();
      res.json(appointments);
    } catch (error) {
      console.error('Error al obtener todas las citas:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // PUT /api/appointments/:appointmentId
  static async updateAppointment(req, res) {
    const client = await pool.connect();
    
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { appointmentId } = req.params;
      const updates = req.body;

      await client.query('BEGIN');

      // Verificar que la cita existe
      const currentAppointment = await Appointment.findById(appointmentId);
      if (!currentAppointment) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Cita no encontrada' });
      }

      // Si se está cambiando fecha/hora, verificar disponibilidad
      if (updates.appointment_date || updates.appointment_time) {
        const newDate = updates.appointment_date || currentAppointment.appointment_date;
        const newTime = updates.appointment_time || currentAppointment.appointment_time;

        // Verificar conflictos (excluyendo la cita actual)
        const hasConflict = await Appointment.checkConflict(
          currentAppointment.doctor_id, 
          newDate, 
          newTime, 
          appointmentId
        );

        if (hasConflict) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: 'El nuevo horario ya está ocupado' });
        }
      }

      // Actualizar la cita
      const updatedAppointment = await Appointment.updateById(appointmentId, updates);
      
      await client.query('COMMIT');

      // Obtener información completa de la cita actualizada
      const fullAppointmentResult = await pool.query(`
        SELECT 
          a.id, a.appointment_date, a.appointment_time, a.status, a.notes,
          patient.name as patient_name, patient.email as patient_email,
          doctor.name as doctor_name, s.name as specialty_name
        FROM appointments a
        JOIN users patient ON a.user_id = patient.id
        JOIN doctors d ON a.doctor_id = d.id
        JOIN users doctor ON d.user_id = doctor.id
        JOIN specialties s ON d.specialty_id = s.id
        WHERE a.id = $1
      `, [appointmentId]);

      res.json({
        message: 'Cita actualizada exitosamente',
        appointment: fullAppointmentResult.rows[0]
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error al actualizar cita:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    } finally {
      client.release();
    }
  }

  // DELETE /api/appointments/:appointmentId
  static async cancelAppointment(req, res) {
    try {
      const { appointmentId } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      let updatedAppointment;

      if (userRole === 'admin') {
        // Los administradores pueden cancelar cualquier cita
        updatedAppointment = await Appointment.updateById(appointmentId, { status: 'cancelled' });
      } else if (userRole === 'user') {
        // Los usuarios solo pueden cancelar sus propias citas
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment || appointment.user_id !== userId) {
          return res.status(404).json({ error: 'Cita no encontrada o no tienes permisos para cancelarla' });
        }
        updatedAppointment = await Appointment.updateById(appointmentId, { status: 'cancelled' });
      } else {
        return res.status(403).json({ error: 'No tienes permisos para cancelar citas' });
      }

      if (!updatedAppointment) {
        return res.status(404).json({ error: 'Cita no encontrada' });
      }

      res.json({ message: 'Cita cancelada exitosamente' });
    } catch (error) {
      console.error('Error al cancelar cita:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

// ===== CONTROLADOR DE ADMINISTRACIÓN =====
class AdminController {
  // GET /api/admin/specialties
  static async getSpecialties(req, res) {
    try {
      const specialties = await Specialty.findAll();
      res.json(specialties);
    } catch (error) {
      console.error('Error al obtener especialidades:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // POST /api/admin/specialties
  static async createSpecialty(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const specialty = await Specialty.create(req.body);
      res.status(201).json({
        message: 'Especialidad creada exitosamente',
        specialty
      });
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        return res.status(400).json({ error: 'Ya existe una especialidad con ese nombre' });
      }
      console.error('Error al crear especialidad:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // GET /api/admin/doctors
  static async getDoctors(req, res) {
    try {
      const doctors = await Doctor.findAll();
      res.json(doctors);
    } catch (error) {
      console.error('Error al obtener doctores:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // POST /api/admin/doctors
  static async createDoctor(req, res) {
    const client = await pool.connect();
    
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, name, phone, specialtyId, licenseNumber } = req.body;

      await client.query('BEGIN');

      // Verificar si el email ya existe
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'El email ya está registrado' });
      }

      // Verificar si el número de licencia ya existe
      const existingLicense = await client.query('SELECT id FROM doctors WHERE license_number = $1', [licenseNumber]);
      if (existingLicense.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'El número de licencia ya está registrado' });
      }

      // Verificar que la especialidad existe
      const specialty = await Specialty.findById(specialtyId);
      if (!specialty) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Especialidad no encontrada' });
      }

      // Crear usuario
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        email,
        password: hashedPassword,
        name,
        phone,
        role: 'doctor'
      });

      // Crear doctor
      const doctor = await Doctor.create({
        user_id: user.id,
        specialty_id: specialtyId,
        license_number: licenseNumber
      });

      // Crear disponibilidad por defecto (Lunes a Viernes, 8AM-5PM)
      for (let day = 1; day <= 5; day++) {
        await client.query(
          'INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time) VALUES ($1, $2, $3, $4)',
          [doctor.id, day, '08:00:00', '17:00:00']
        );
      }

      await client.query('COMMIT');

      // Obtener información completa del doctor creado
      const fullDoctorResult = await pool.query(`
        SELECT 
          d.id, d.license_number,
          u.id as user_id, u.name, u.email, u.phone,
          s.id as specialty_id, s.name as specialty_name
        FROM doctors d
        JOIN users u ON d.user_id = u.id
        JOIN specialties s ON d.specialty_id = s.id
        WHERE d.id = $1
      `, [doctor.id]);

      res.status(201).json({
        message: 'Doctor creado exitosamente',
        doctor: fullDoctorResult.rows[0]
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error al crear doctor:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    } finally {
      client.release();
    }
  }

  // GET /api/admin/stats
  static async getStats(req, res) {
    try {
      const stats = {};

      // Total de usuarios por rol
      const usersResult = await pool.query(`
        SELECT role, COUNT(*) as count
        FROM users
        GROUP BY role
      `);
      stats.users = usersResult.rows;

      // Total de citas por estado
      const appointmentsResult = await pool.query(`
        SELECT status, COUNT(*) as count
        FROM appointments
        GROUP BY status
      `);
      stats.appointments = appointmentsResult.rows;

      // Citas por especialidad
      const specialtyResult = await pool.query(`
        SELECT s.name, COUNT(a.id) as count
        FROM specialties s
        LEFT JOIN doctors d ON s.id = d.specialty_id
        LEFT JOIN appointments a ON d.id = a.doctor_id
        GROUP BY s.id, s.name
        ORDER BY count DESC
      `);
      stats.appointmentsBySpecialty = specialtyResult.rows;

      // Citas por mes (últimos 6 meses)
      const monthlyResult = await pool.query(`
        SELECT 
          TO_CHAR(appointment_date, 'YYYY-MM') as month,
          COUNT(*) as count
        FROM appointments
        WHERE appointment_date >= CURRENT_DATE - INTERVAL '6 months'
        GROUP BY TO_CHAR(appointment_date, 'YYYY-MM')
        ORDER BY month
      `);
      stats.monthlyAppointments = monthlyResult.rows;

      res.json(stats);
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // GET /api/admin/users
  static async getUsers(req, res) {
    try {
      const users = await User.findAll();
      res.json(users);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // PUT /api/admin/users/:userId
  static async updateUser(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { userId } = req.params;
      const updatedUser = await User.updateById(userId, req.body);

      if (!updatedUser) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json({
        message: 'Usuario actualizado exitosamente',
        user: updatedUser
      });

    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // GET /api/admin/doctors/:doctorId/availability
  static async getDoctorAvailability(req, res) {
    try {
      const { doctorId } = req.params;

      const result = await pool.query(`
        SELECT day_of_week, start_time, end_time
        FROM doctor_availability
        WHERE doctor_id = $1
        ORDER BY day_of_week
      `, [doctorId]);

      // Convertir días numéricos a nombres
      const dayNames = {
        1: 'Lunes',
        2: 'Martes',
        3: 'Miércoles',
        4: 'Jueves',
        5: 'Viernes',
        6: 'Sábado',
        7: 'Domingo'
      };

      const availability = result.rows.map(row => ({
        ...row,
        day_name: dayNames[row.day_of_week]
      }));

      res.json(availability);
    } catch (error) {
      console.error('Error al obtener disponibilidad:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // PUT /api/admin/doctors/:doctorId/availability
  static async updateDoctorAvailability(req, res) {
    const client = await pool.connect();
    
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { doctorId } = req.params;
      const { availability } = req.body;

      await client.query('BEGIN');

      // Verificar que el doctor existe
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Doctor no encontrado' });
      }

      // Eliminar disponibilidad existente
      await client.query('DELETE FROM doctor_availability WHERE doctor_id = $1', [doctorId]);

      // Insertar nueva disponibilidad
      for (const slot of availability) {
        await client.query(
          'INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time) VALUES ($1, $2, $3, $4)',
          [doctorId, slot.day_of_week, slot.start_time, slot.end_time]
        );
      }

      await client.query('COMMIT');

      res.json({ message: 'Disponibilidad actualizada exitosamente' });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error al actualizar disponibilidad:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    } finally {
      client.release();
    }
  }
}

module.exports = {
  AuthController,
  AppointmentController,
  AdminController
};