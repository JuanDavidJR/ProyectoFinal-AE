const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Servir public (JS, CSS)
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Servir views
app.use('/views', express.static(path.join(__dirname, '../frontend/views')));

// Servir controllers, models, services para import desde main.js
app.use('/controllers', express.static(path.join(__dirname, '../frontend/controllers')));
app.use('/models', express.static(path.join(__dirname, '../frontend/models')));
app.use('/services', express.static(path.join(__dirname, '../frontend/services')));

// Rutas de la API
const patientsRouter = require('./routes/patients');
const authRouter = require('./routes/auth');
const appointmentsRouter = require('./routes/appointments');

app.use('/api/patients', patientsRouter);
app.use('/api/auth', authRouter);
app.use('/api/appointments', appointmentsRouter);

// Ruta principal (home)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/home.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor backend + frontend escuchando en http://localhost:${PORT}`);
});
