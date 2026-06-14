require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const { errorHandler, notFound } = require('./middleware/error');

const app = express();

app.use((req, _res, next) => { req.url = req.url.replace(/(%0A|%0D|%0a|%0d|[\r\n])+$/g, ''); next(); });
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

try {
  require('./db');
    console.log('Connected to SQLite');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
} catch (err) {
    console.error('SQLite connection error:', err.message);
  process.exit(1);
}

module.exports = app;
