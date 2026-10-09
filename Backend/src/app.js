const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.routes');
const musicRoutes = require('./routes/music.routes');

const app = express();
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('Melodify Backend is running 🚀');
});

app.use('/api/auth', authRoutes);

app.use("/api/music", musicRoutes);


module.exports = app;