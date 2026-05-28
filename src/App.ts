import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import resumeRoutes from './routes/resumeRoutes';

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Route
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', message: 'ResumeAI API is running' });
});

// API Routes
app.use('/api/resume', resumeRoutes);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal Server Error'
    });
});

export default app;