import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes';
import resumeRoutes from './routes/resumeRoutes';
import analysisRoutes from './routes/analysisRoutes';

const app: Application = express();

// Security Middleware
app.use(helmet()); // Adds security headers (prevents XSS, clickjacking, etc.)

// CORS — explicit allow for Vercel frontend + local dev
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'https://resume-ai-git-feature-5d44e6-singhshubhamkumar80-5095s-projects.vercel.app',
];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow any Vercel preview/branch deployment
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle preflight explicitly
app.options('*', (_, res) => res.sendStatus(204));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Rate Limiting (Prevent Brute Force / DDoS)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/analysis', analysisRoutes);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    
    // Handle Prisma Errors cleanly
    if (err.code === 'P2002') {
        res.status(409).json({ success: false, error: 'A record with this value already exists.' });
        return;
    }

    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal Server Error'
    });
});

export default app;