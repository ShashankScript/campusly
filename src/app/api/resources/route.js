import dbConnect from '@/lib/db';
import Resource from '@/models/Resource';
import { resourceSchema } from '@/lib/validations';
import { getSessionFromRequest } from '@/lib/auth-middleware';
import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        await dbConnect();
        
        // Get session for authentication
        const session = await getSessionFromRequest(req);
        if (!session?.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type');
        const search = searchParams.get('search');

        const query = { isActive: true };
        if (type && type !== 'all') query.type = type;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const resources = await Resource.find(query).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: resources });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        
        // Get session for authentication
        const session = await getSessionFromRequest(req);
        if (!session?.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // Check permissions
        if (!['admin', 'faculty'].includes(session.user.role)) {
            return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
        }

        const body = await req.json();

        const validation = resourceSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ success: false, error: validation.error.flatten() }, { status: 400 });
        }

        const resource = await Resource.create({
            ...validation.data,
            createdBy: session.user.id
        });
        
        return NextResponse.json({ success: true, data: resource }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
