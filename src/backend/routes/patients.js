const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');

router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            'INSERT INTO patients (name, email, password) VALUES ($1, $2, $3)',
            [name, email, hashedPassword]
        );

        res.status(201).json({ message: 'Paciente registrado exitosamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al registrar paciente' });
    }
});

module.exports = router;
