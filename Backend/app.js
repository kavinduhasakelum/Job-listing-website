import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import './config/dbConnection.js'; // Import database connection

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;


app.use(cors());

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

// Log all incoming requests
app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.url} | Auth: ${req.headers.authorization ? 'Yes' : 'No'}`);
    next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/job', (req, res, next) => {
    console.log('🔀 Job router - Path:', req.path, '| Method:', req.method);
    console.log('   Full URL:', req.url);
    console.log('   Original URL:', req.originalUrl);
    next();
}, jobRoutes);
app.use('/admin', adminRoutes);

app.get('/', (req, res) => {
    res.send('Job Listing Backend is running');
});

// 404 handler - must be after all routes
app.use((req, res, next) => {
    console.log('404 - Route not found:', req.method, req.url);
    res.status(404).json({ 
        error: 'Route not found',
        method: req.method,
        path: req.url
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
