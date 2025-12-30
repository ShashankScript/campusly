import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const response = NextResponse.json({
            success: true,
            message: 'Logged out successfully'
        });

        // Clear auth token cookie
        response.cookies.delete('auth-token');

        return response;
    } catch (error) {
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}