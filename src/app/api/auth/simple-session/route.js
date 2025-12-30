import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        const token = req.cookies.get('auth-token')?.value;
        
        if (!token) {
            return NextResponse.json({ 
                success: true, 
                user: null,
                authenticated: false 
            });
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.BETTER_AUTH_SECRET);
        
        return NextResponse.json({
            success: true,
            user: {
                id: decoded.userId,
                email: decoded.email,
                role: decoded.role
            },
            authenticated: true
        });
    } catch (error) {
        // Token is invalid or expired
        const response = NextResponse.json({ 
            success: true, 
            user: null,
            authenticated: false 
        });
        
        // Clear invalid token
        response.cookies.delete('auth-token');
        
        return response;
    }
}