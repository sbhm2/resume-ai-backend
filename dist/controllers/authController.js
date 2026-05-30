"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.getMe = exports.signin = exports.signup = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../config/prisma");
const validators_1 = require("../utils/validators");
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is missing from environment variables');
}
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ?? '7d');
const generateToken = (id, email) => {
    const options = { expiresIn: JWT_EXPIRES_IN };
    return jsonwebtoken_1.default.sign({ id, email }, JWT_SECRET, options);
};
const signup = async (req, res, next) => {
    try {
        const validatedData = validators_1.signupSchema.parse(req.body);
        const existingUser = await prisma_1.prisma.user.findUnique({ where: { email: validatedData.email } });
        if (existingUser) {
            res.status(400).json({ success: false, error: 'Email already in use' });
            return;
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(validatedData.password, salt);
        const user = await prisma_1.prisma.user.create({
            data: {
                name: validatedData.name,
                email: validatedData.email,
                passwordHash
            }
        });
        const token = generateToken(user.id, user.email);
        res.status(201).json({
            success: true,
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });
    }
    catch (error) {
        if (error.name === 'ZodError') {
            res.status(400).json({ success: false, error: error.errors });
            return;
        }
        next(error);
    }
};
exports.signup = signup;
const signin = async (req, res, next) => {
    try {
        const validatedData = validators_1.signinSchema.parse(req.body);
        const user = await prisma_1.prisma.user.findUnique({ where: { email: validatedData.email } });
        if (!user || !user.isActive) {
            res.status(401).json({ success: false, error: 'Invalid credentials' });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(validatedData.password, user.passwordHash);
        if (!isMatch) {
            res.status(401).json({ success: false, error: 'Invalid credentials' });
            return;
        }
        const token = generateToken(user.id, user.email);
        res.status(200).json({
            success: true,
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.signin = signin;
const getMe = async (req, res, next) => {
    try {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, name: true, email: true, createdAt: true }
        });
        if (!user) {
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }
        res.status(200).json({ success: true, user });
    }
    catch (error) {
        next(error);
    }
};
exports.getMe = getMe;
const logout = async (req, res) => {
    // Client-side will delete the JWT token. We just return a success response.
    res.status(200).json({ success: true, message: 'Logged out successfully' });
};
exports.logout = logout;
