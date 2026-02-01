import crypto from 'crypto';

// Generate a secure random token
export function generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

// Hash a token for storage
export function hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
}

// Generate token expiry time (1 hour from now)
export function getTokenExpiry(): Date {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1);
    return expiry;
}
