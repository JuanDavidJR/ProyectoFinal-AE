// models/User.js
const pool = require('../config/database');

class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.password = data.password;
    this.name = data.name;
    this.phone = data.phone;
    this.role = data.role;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async create(userData) {
    const { email, password, name, phone, role = 'user' } = userData;
    const query = `
      INSERT INTO users (email, password, name, phone, role) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *
    `;
    const result = await pool.query(query, [email, password, name, phone, role]);
    return new User(result.rows[0]);
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows.length > 0 ? new User(result.rows[0]) : null;
  }

  static async findById(id) {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? new User(result.rows[0]) : null;
  }

  static async findAll() {
    const query = 'SELECT id, email, name, phone, role, created_at FROM users ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows.map(row => new User(row));
  }

  static async updateById(id, updateData) {
    const fields = [];
    const values = [];
    let paramCounter = 1;

    Object.keys(updateData).forEach(key => {
      if (['name', 'phone', 'role'].includes(key)) {
        fields.push(`${key} = $${paramCounter}`);
        values.push(updateData[key]);
        paramCounter++;
      }
    });

    if (fields.length === 0) return null;

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE users 
      SET ${fields.join(', ')}
      WHERE id = $${paramCounter}
      RETURNING id, email, name, phone, role, created_at, updated_at
    `;

    const result = await pool.query(query, values);
    return result.rows.length > 0 ? new User(result.rows[0]) : null;
  }
}

// models/Specialty.js
class Specialty {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.created_at = data.created_at;
  }

  static async create(specialtyData) {
    const { name, description } = specialtyData;
    const query = 'INSERT INTO specialties (name, description) VALUES ($1, $2) RETURNING *';
    const result = await pool.query(query, [name, description]);
    return new Specialty(result.rows[0]);
  }

  static async findAll() {
    const query = `
      SELECT s.*, COUNT(d.id) as doctors_count
      FROM specialties s
      LEFT JOIN doctors d ON s.id = d.specialty_id
      GROUP BY s.id, s.name, s.description, s.created_at
      ORDER BY s.name
    `;
    const result = await pool.query(query);
    return result.rows.map(row => ({ ...new Specialty(row), doctors_count: row.doctors_count }));
  }

  static async findAvailable() {
    const query = `
      SELECT s.id, s.name, s.description, COUNT(d.id) as doctors_count
      FROM specialties s
      LEFT JOIN doctors d ON s.id = d.specialty_id
      GROUP BY s.id, s.name, s.description
      HAVING COUNT(d.id) > 0
      ORDER BY s.name
    `;
    const result = await pool.query(query);
    return result.rows.map(row => ({ ...new Specialty(row), doctors_count: row.doctors_count }));
  }

  static async findById(id) {
    const query = 'SELECT * FROM specialties WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? new Specialty(result.rows[0]) : null;
  }
}

// models/Doctor.js
class Doctor {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.specialty_id = data.specialty_id;
    this.license_number = data.license_number;
    this.created_at = data.created_at;
  }

  static async create(doctorData) {
    const { user_id, specialty_id, license_number } = doctorData;
    const query = 'INSERT INTO doctors (user_id, specialty_id, license_number) VALUES ($1, $2, $3) RETURNING *';
    const result = await pool.query(query, [user_id, specialty_id, license_number]);
    return new Doctor(result.rows[0]);
  }

  static async findAll() {
    const query = `
      SELECT 
        d.id, d.license_number, d.created_at,
        u.id as user_id, u.name, u.email, u.phone,
        s.id as specialty_id, s.name as specialty_name
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      JOIN specialties s ON d.specialty_id = s.id
      ORDER BY u.name
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async findBySpecialty(specialtyId) {
    const query = `
      SELECT d.id, u.name, d.license_number, s.name as specialty_name
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      JOIN specialties s ON d.specialty_id = s.id
      WHERE d.specialty_id = $1
      ORDER BY u.name
    `;
    const result = await pool.query(query, [specialtyId]);
    return result.rows;
  }

  static async findByUserId(userId) {
    const query = `
      SELECT d.id, d.license_number, s.name as specialty_name, s.id as specialty_id
      FROM doctors d
      JOIN specialties s ON d.specialty_id = s.id
      WHERE d.user_id = $1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  static async findById(id) {
    const query = 'SELECT * FROM doctors WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? new Doctor(result.rows[0]) : null;
  }
}

// models/Appointment.js
class Appointment {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.doctor_id = data.doctor_id;
    this.appointment_date = data.appointment_date;
    this.appointment_time = data.appointment_time;
    this.status = data.status;
    this.notes = data.notes;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async create(appointmentData) {
    const { user_id, doctor_id, appointment_date, appointment_time, notes } = appointmentData;
    const query = `
      INSERT INTO appointments (user_id, doctor_id, appointment_date, appointment_time, notes, status)
      VALUES ($1, $2, $3, $4, $5, 'scheduled')
      RETURNING *
    `;
    const result = await pool.query(query, [user_id, doctor_id, appointment_date, appointment_time, notes]);
    return new Appointment(result.rows[0]);
  }

  static async findByUserId(userId) {
    const query = `
      SELECT 
        a.id, a.appointment_date, a.appointment_time, a.status, a.notes,
        u.name as doctor_name, s.name as specialty_name,
        d.license_number
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      JOIN specialties s ON d.specialty_id = s.id
      WHERE a.user_id = $1
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async findByDoctorId(doctorId) {
    const query = `
      SELECT 
        a.id, a.appointment_date, a.appointment_time, a.status, a.notes,
        u.name as patient_name, u.phone as patient_phone
      FROM appointments a
      JOIN users u ON a.user_id = u.id
      WHERE a.doctor_id = $1
      ORDER BY a.appointment_date ASC, a.appointment_time ASC
    `;
    const result = await pool.query(query, [doctorId]);
    return result.rows;
  }

  static async findAll() {
    const query = `
      SELECT 
        a.id, a.appointment_date, a.appointment_time, a.status, a.notes, a.created_at,
        patient.name as patient_name, patient.email as patient_email, patient.phone as patient_phone,
        doctor.name as doctor_name, d.license_number,
        s.name as specialty_name
      FROM appointments a
      JOIN users patient ON a.user_id = patient.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users doctor ON d.user_id = doctor.id
      JOIN specialties s ON d.specialty_id = s.id
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM appointments WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? new Appointment(result.rows[0]) : null;
  }

  static async updateById(id, updateData) {
    const fields = [];
    const values = [];
    let paramCounter = 1;

    Object.keys(updateData).forEach(key => {
      if (['appointment_date', 'appointment_time', 'status', 'notes'].includes(key)) {
        fields.push(`${key} = $${paramCounter}`);
        values.push(updateData[key]);
        paramCounter++;
      }
    });

    if (fields.length === 0) return null;

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE appointments 
      SET ${fields.join(', ')}
      WHERE id = $${paramCounter}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows.length > 0 ? new Appointment(result.rows[0]) : null;
  }

  static async checkConflict(doctorId, appointmentDate, appointmentTime, excludeId = null) {
    let query = `
      SELECT 1 FROM appointments
      WHERE doctor_id = $1 AND appointment_date = $2 AND appointment_time = $3 AND status != 'cancelled'
    `;
    const values = [doctorId, appointmentDate, appointmentTime];

    if (excludeId) {
      query += ` AND id != $4`;
      values.push(excludeId);
    }

    const result = await pool.query(query, values);
    return result.rows.length > 0;
  }

  static async checkUserSpecialtyConflict(userId, specialtyId) {
    const query = `
      SELECT a.id
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      WHERE a.user_id = $1 AND d.specialty_id = $2 AND a.status = 'scheduled'
    `;
    const result = await pool.query(query, [userId, specialtyId]);
    return result.rows.length > 0;
  }
}

// models/TokenBlacklist.js
class TokenBlacklist {
  static async add(token, expiresAt) {
    const query = 'INSERT INTO token_blacklist (token, expires_at) VALUES ($1, $2)';
    await pool.query(query, [token, expiresAt]);
  }

  static async isBlacklisted(token) {
    const query = 'SELECT 1 FROM token_blacklist WHERE token = $1 AND expires_at > NOW()';
    const result = await pool.query(query, [token]);
    return result.rows.length > 0;
  }

  static async cleanExpired() {
    const query = 'DELETE FROM token_blacklist WHERE expires_at < NOW()';
    await pool.query(query);
  }
}

module.exports = {
  User,
  Specialty,
  Doctor,
  Appointment,
  TokenBlacklist
};