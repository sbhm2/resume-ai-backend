import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { prisma } from '../config/prisma';  
import { signupSchema, signinSchema } from '../utils/validators';

const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ?? '7d') as SignOptions['expiresIn'];

const generateToken = (id: string, email: string): string => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is missing from environment variables');
    }
    const options: SignOptions = { expiresIn: JWT_EXPIRES_IN };
    return jwt.sign({ id, email }, secret, options);
};

export const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const validatedData = signupSchema.parse(req.body);
        
        const existingUser = await prisma.user.findUnique({ where: { email: validatedData.email } });
        if (existingUser) {
            res.status(400).json({ success: false, error: 'Email already in use' });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(validatedData.password, salt);

        const user = await prisma.user.create({
            data: {
                name: validatedData.name,
                email: validatedData.email,
                passwordHash
            }
        });

        const token = generateToken(user.id, user.email);

        res.status(201).json({
            success: true,
            accessToken: token,
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (error: any) {
        console.log({error});
        if (error.name === 'ZodError') {
             res.status(400).json({ success: false, error: error.errors });
             return;
        }
        next(error);
    }
};

export const signin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const validatedData = signinSchema.parse(req.body);

        const user = await prisma.user.findUnique({ where: { email: validatedData.email } });
        if (!user || !user.isActive) {
            res.status(401).json({ success: false, error: 'Invalid credentials' });
            return;
        }

        const isMatch = await bcrypt.compare(validatedData.password, user.passwordHash);
        if (!isMatch) {
            res.status(401).json({ success: false, error: 'Invalid credentials' });
            return;
        }

        const token = generateToken(user.id, user.email);

        res.status(200).json({
            success: true,
            accessToken:token,
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (error: any) {
        next(error);
    }
};

export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.id },
            select: { id: true, name: true, email: true, createdAt: true }
        });
        
        if (!user) {
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        next(error);
    }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
    // Client-side will delete the JWT token. We just return a success response.
    res.status(200).json({ success: true, message: 'Logged out successfully' });
};