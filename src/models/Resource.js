
import mongoose from 'mongoose';

const ResourceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a resource name'],
        trim: true,
    },
    type: {
        type: String,
        required: [true, 'Please specify the resource type'],
        enum: ['room', 'equipment', 'book', 'faculty_hour'],
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    capacity: {
        type: Number, // For rooms or equipment count
        default: 1,
    },
    location: {
        type: String, // Physical location like "Building A, Room 101"
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    meta: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        description: "Flexible metadata for specific resource types (e.g., ISBN for books, specs for equipment)",
    },
}, { timestamps: true });

const Resource = mongoose.models.Resource || mongoose.model('Resource', ResourceSchema);

export default Resource;
