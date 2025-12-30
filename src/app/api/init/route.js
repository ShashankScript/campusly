import dbConnect from '@/lib/db';
import Resource from '@/models/Resource';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        await dbConnect();
        
        // Check if resources already exist
        const existingResources = await Resource.countDocuments();
        if (existingResources > 0) {
            return NextResponse.json({ 
                success: true, 
                message: `Database already has ${existingResources} resources`,
                data: [] 
            });
        }
        
        // Sample resources for testing
        const sampleResources = [
            {
                name: "Conference Room A",
                type: "room",
                description: "Large conference room with projector and whiteboard",
                capacity: 20,
                location: "Building A, Floor 2",
                isActive: true
            },
            {
                name: "Conference Room B",
                type: "room", 
                description: "Small meeting room for team discussions",
                capacity: 8,
                location: "Building A, Floor 1",
                isActive: true
            },
            {
                name: "Laptop - Dell XPS 13",
                type: "equipment",
                description: "High-performance laptop for development work",
                capacity: 1,
                location: "IT Department",
                isActive: true
            },
            {
                name: "Projector - Epson",
                type: "equipment",
                description: "Portable projector for presentations",
                capacity: 1,
                location: "AV Equipment Room",
                isActive: true
            },
            {
                name: "JavaScript: The Good Parts",
                type: "book",
                description: "Essential JavaScript programming book by Douglas Crockford",
                capacity: 1,
                location: "Library - Section B",
                isActive: true
            },
            {
                name: "Clean Code",
                type: "book",
                description: "A handbook of agile software craftsmanship",
                capacity: 1,
                location: "Library - Section B",
                isActive: true
            },
            {
                name: "Dr. Smith Office Hours",
                type: "faculty_hour",
                description: "Computer Science consultation and tutoring",
                capacity: 5,
                location: "Office 301, CS Building",
                isActive: true
            },
            {
                name: "Prof. Johnson Lab Time",
                type: "faculty_hour",
                description: "Physics lab assistance and experiments",
                capacity: 3,
                location: "Physics Lab 201",
                isActive: true
            }
        ];

        // Insert sample resources
        const resources = await Resource.insertMany(sampleResources);
        
        return NextResponse.json({ 
            success: true, 
            message: `Created ${resources.length} sample resources`,
            data: resources 
        });
    } catch (error) {
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}