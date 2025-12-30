
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        maxlength: [60, 'Name cannot be more than 60 characters'],
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false, // Don't include password in queries by default
    },
    role: {
        type: String,
        enum: ['admin', 'faculty', 'student'],
        default: 'student',
    },
}, { timestamps: true });

// Prevent recompilation of model
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;
