import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET!;
const SALT_ROUNDS = 10;
const COOKIE_NAME = 'auth-token';

// Password hashing with automatic salt generation
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

// Verify password against hash
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

// JWT token generation
export interface TokenPayload {
    userId: number;
    email: string;
    role: string;
}

export function generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: '7d', // 7 days
    });
}

// JWT token verification
export function verifyToken(token: string): TokenPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (error) {
        return null;
    }
}

// Set authentication cookie
export async function setAuthCookie(token: string) {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true, // Prevents XSS attacks
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'lax', // CSRF protection
        maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
        path: '/',
    });
}

// Clear authentication cookie
export async function clearAuthCookie() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}

// Get token from cookie
export async function getAuthToken(): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get(COOKIE_NAME)?.value;
}

// Get current user from cookie
export async function getCurrentUser(): Promise<TokenPayload | null> {
    const token = await getAuthToken();
    if (!token) return null;
    return verifyToken(token);
}
