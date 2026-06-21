"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const resumeRoutes_1 = __importDefault(require("./routes/resumeRoutes"));
const analysisRoutes_1 = __importDefault(require("./routes/analysisRoutes"));
const statusRoutes_1 = __importDefault(require("./routes/statusRoutes"));
const app = (0, express_1.default)();
// Security Middleware
app.use((0, helmet_1.default)()); // Adds security headers (prevents XSS, clickjacking, etc.)
// CORS — explicit allow for Vercel frontend + local dev
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:4173',
    'https://resume-ai-git-feature-5d44e6-singhshubhamkumar80-5095s-projects.vercel.app',
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (server-to-server, curl, etc.)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin))
            return callback(null, true);
        // Allow any Vercel preview/branch deployment
        if (origin.endsWith('.vercel.app'))
            return callback(null, true);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Handle preflight explicitly
app.options('*', (_, res) => res.sendStatus(204));
app.use(express_1.default.json({ limit: '1mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '1mb' }));
// Rate Limiting (Prevent Brute Force / DDoS)
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', limiter);
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/resume', resumeRoutes_1.default);
app.use('/api/analysis', analysisRoutes_1.default);
app.use('/', statusRoutes_1.default);
// Global Error Handler
app.use((err, req, res, next) => {
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
exports.default = app;
