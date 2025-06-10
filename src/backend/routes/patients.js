const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcryptjs");

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO patients (name, email, password) VALUES ($1, $2, $3) RETURNING id",
      [name, email, hashedPassword]
    );

    const newPatientId = result.rows[0].id;

    res.status(201).json({ id: newPatientId });
  } catch (err) {
    console.error("Error en /register:", err);

    if (err.code === "23505") {
      // Unique violation (email duplicado)
      return res.status(409).json({ error: "El email ya está registrado" });
    }

    res.status(500).json({ error: "Error al registrar paciente" });
  }
});

module.exports = router;
