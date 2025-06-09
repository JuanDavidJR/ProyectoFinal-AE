const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middlewares/auth');

// Crear nueva cita
router.post('/', authenticateToken, async (req, res) => {
    const { doctor_name, appointment_date } = req.body;
    const patient_id = req.user.id;

    console.log(`Paciente ${patient_id} crea cita con ${doctor_name} el ${appointment_date}`);

    try {
        await pool.query(
            'INSERT INTO appointments (patient_id, doctor_name, appointment_date) VALUES ($1, $2, $3)',
            [patient_id, doctor_name, appointment_date]
        );

        res.status(201).json({ message: 'Cita creada exitosamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al crear la cita' });
    }
});

// Listar citas del paciente autenticado
router.get('/', authenticateToken, async (req, res) => {
    const patient_id = req.user.id;

    console.log(`Paciente ${patient_id} consulta citas`);

    try {
        const result = await pool.query(
            'SELECT id, doctor_name, appointment_date, status, created_at FROM appointments WHERE patient_id = $1 ORDER BY appointment_date',
            [patient_id]
        );

        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener citas' });
    }
});

module.exports = router;
