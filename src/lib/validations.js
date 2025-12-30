
import { z } from 'zod';

export const resourceSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    type: z.enum(['room', 'equipment', 'book', 'faculty_hour']),
    description: z.string().max(500).optional(),
    capacity: z.number().min(1).default(1),
    location: z.string().optional(),
    meta: z.record(z.any()).optional(),
});

export const bookingSchema = z.object({
    user: z.string().min(1, 'User ID is required'),
    resource: z.string().min(1, 'Resource ID is required'),
    startTime: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid start time'),
    endTime: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid end time'),
    notes: z.string().max(200).optional(),
}).refine((data) => {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    return end > start;
}, {
    message: "End time must be after start time",
    path: ["endTime"],
});

export const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    role: z.enum(['admin', 'faculty', 'student']).default('student'),
});
