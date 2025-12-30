import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';
import Resource from '@/models/Resource';
import { bookingSchema } from '@/lib/validations';
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
        const userId = searchParams.get('userId');
        const resourceId = searchParams.get('resourceId');
        const start = searchParams.get('start');
        const end = searchParams.get('end');

        const query = {};
        
        // Role-based filtering
        if (session.user.role === 'student') {
            // Students can only see their own bookings
            query.user = session.user.id;
        } else if (userId) {
            // Admin and faculty can filter by userId
            query.user = userId;
        }
        
        if (resourceId) query.resource = resourceId;

        // Date range filter
        if (start && end) {
            query.startTime = { $lt: new Date(end) };
            query.endTime = { $gt: new Date(start) };
        }

        const bookings = await Booking.find(query)
            .populate('resource', 'name type')
            .populate('user', 'name email')
            .sort({ startTime: 1 });

        return NextResponse.json({ success: true, data: bookings });
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

        const body = await req.json();

        // Validation
        const validation = bookingSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ success: false, error: validation.error.flatten() }, { status: 400 });
        }

        const { resource: resourceId, startTime, endTime, notes } = validation.data;
        const start = new Date(startTime);
        const end = new Date(endTime);

        // Fetch resource to get capacity
        const resourceDoc = await Resource.findById(resourceId);
        if (!resourceDoc) {
            return NextResponse.json({ success: false, error: 'Resource not found' }, { status: 404 });
        }

        // Check for conflicts with capacity
        const hasConflict = await Booking.checkConflict(resourceId, start, end, resourceDoc.capacity);
        if (hasConflict) {
            return NextResponse.json({ success: false, error: 'Resource capacity exceeded for this time slot' }, { status: 409 });
        }

        const booking = await Booking.create({
            user: session.user.id,
            resource: resourceId,
            startTime: start,
            endTime: end,
            notes
        });

        return NextResponse.json({ success: true, data: booking }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
