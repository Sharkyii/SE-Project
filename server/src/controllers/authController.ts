import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { supabase } from '../config/db';

const generateToken = (id: number, role: string) => {
    return jwt.sign({ id, role }, env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password, role, name, ...profileData } = req.body;

        const { data: userExists } = await supabase.from('users').select('*').eq('email', email).single();

        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Supabase SDK doesn't support basic transactions across tables directly without RPC,
        // so we do sequential inserts.
        const { data: userRes, error: userError } = await supabase
            .from('users')
            .insert([{ email, password: hashedPassword, role }])
            .select()
            .single();

        if (userError) throw userError;
        const userId = userRes.id;

        if (role === 'student') {
            const { rollNumber, department, semester } = profileData;
            const { data: studentRes, error: studentError } = await supabase
                .from('students')
                .insert([{ user_id: userId, name, roll_number: rollNumber, department, semester: semester || 1 }])
                .select()
                .single();

            if (studentError) throw studentError;
            await supabase.from('users').update({ profile_id: studentRes.id }).eq('id', userId);
        } else if (role === 'faculty') {
            const { department, designation } = profileData;
            const { data: facultyRes, error: facultyError } = await supabase
                .from('faculty')
                .insert([{ user_id: userId, name, department, designation }])
                .select()
                .single();

            if (facultyError) throw facultyError;
            await supabase.from('users').update({ profile_id: facultyRes.id }).eq('id', userId);
        }

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        const { data: user, error } = await supabase.from('users').select('*').eq('email', email).single();

        if (user && (await bcrypt.compare(password, user.password))) {
            const token = generateToken(user.id, user.role);
            res.cookie('jwt', token, {
                httpOnly: true,
                secure: env.NODE_ENV !== 'development',
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000
            });
            res.json({ id: user.id, email: user.email, role: user.role });
        } else {
            res.status(401);
            throw new Error('Invalid email or password');
        }
    } catch (error) {
        next(error);
    }
};

export const logout = (req: Request, res: Response) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out' });
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('id, email, role, profile_id')
            .eq('id', req.user.id)
            .single();

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }
        res.json(user);
    } catch (error) {
        next(error);
    }
};
