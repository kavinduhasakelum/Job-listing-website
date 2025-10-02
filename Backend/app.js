import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import jobRoutes from './routes/jobRoutes.js';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json())

// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/job',  jobRoutes);

app.get('/', (req, res) => {
    res.send('Job Listing Backend is running');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

