import jwt from 'jsonwebtoken';

export async function getSessionFromRequest(req) {
    try {
        // Use simple JWT auth only
        const token = req.cookies.get('auth-token')?.value;
        if (!token) {
            return null;
        }

        const decoded = jwt.verify(token, process.env.BETTER_AUTH_SECRET);
        return {
            user: {
                id: decoded.userId,
                email: decoded.email,
                role: decoded.role
            }
        };
    } catch (error) {
        console.error('Session validation error:', error);
        return null;
    }
}