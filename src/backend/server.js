const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Rutas
const patientsRouter = require('./routes/patients');
const authRouter = require('./routes/auth');
const appointmentsRouter = require('./routes/appointments');

app.use('/api/patients', patientsRouter);
app.use('/api/auth', authRouter);
app.use('/api/appointments', appointmentsRouter);

app.listen(PORT, () => {
    console.log(`Servidor backend escuchando en puerto ${PORT}`);
});
