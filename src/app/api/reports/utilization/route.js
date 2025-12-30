import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        await dbConnect();
        
        // Get session for authentication
        const session = await auth.api.getSession({ headers: req.headers });
        if (!session?.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // Check permissions - only admin and faculty can view analytics
        if (!['admin', 'faculty'].includes(session.user.role)) {
            return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
        }

        // Check for bookings with status 'confirmed' or 'completed'
        const utilization = await Booking.aggregate([
            {
                $match: { status: { $in: ['confirmed', 'completed'] } }
            },
            {
                $project: {
                    resource: 1,
                    durationHours: {
                        $divide: [{ $subtract: ["$endTime", "$startTime"] }, 1000 * 60 * 60]
                    }
                }
            },
            {
                $group: {
                    _id: "$resource",
                    totalHours: { $sum: "$durationHours" },
                    bookingCount: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "resources",
                    localField: "_id",
                    foreignField: "_id",
                    as: "resourceDetails"
                }
            },
            {
                $unwind: "$resourceDetails"
            },
            {
                $project: {
                    resourceName: "$resourceDetails.name",
                    resourceType: "$resourceDetails.type",
                    totalHours: 1,
                    bookingCount: 1
                }
            }
        ]);

        return NextResponse.json({ success: true, data: utilization });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
