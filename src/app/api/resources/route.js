import dbConnect from '@/lib/db';
import Resource from '@/models/Resource';
import { resourceSchema } from '@/lib/validations';
import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        await dbConnect();
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
        const body = await req.json();

        const validation = resourceSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ success: false, error: validation.error.flatten() }, { status: 400 });
        }

        const resource = await Resource.create(validation.data);
        return NextResponse.json({ success: true, data: resource }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
