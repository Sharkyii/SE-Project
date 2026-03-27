import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler';

// Import Routes
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import facultyRoutes from './routes/faculty.routes';
import studentRoutes from './routes/student.routes';
import feeRoutes from './routes/fee.routes';
import enrollmentRoutes from './routes/enrollment.routes';

const app: Application = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: env.CLIENT_URL,
    credentials: true,
}));
app.use(cookieParser());
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/enrollments', enrollmentRoutes);

// Health Check
app.get('/', (req, res) => {
    res.send('Academic ERP API is running...');
});

// Error Handler
app.use(errorHandler);

export default app;
