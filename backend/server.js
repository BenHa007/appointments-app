require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const managerRoutes = require('./routes/managers');
const hoursRoutes = require('./routes/workHours');
const appointmentRoutes = require('./routes/appointments');

console.log('🟢 server.js loaded');

const app = express();

app.get('/', (req, res) => res.json({ status: 'ok', service: 'appointments-api' }));
app.get('/ping', (req, res) => res.send('pong'));
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));


app.use((req, res, next) => {
    console.log('➡️', req.method, req.originalUrl);
    next();
});

app.use(cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim()) : '*',
}));
app.use(express.json());

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/managers', managerRoutes);
app.use('/api/work-hours', hoursRoutes);
app.use('/api/appointments', appointmentRoutes);

app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));
