
import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    resource: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resource',
        required: true,
    },
    startTime: {
        type: Date,
        required: [true, 'Start time is required'],
    },
    endTime: {
        type: Date,
        required: [true, 'End time is required'],
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'confirmed',
    },
    notes: {
        type: String,
        maxlength: 200,
    }
}, { timestamps: true });

BookingSchema.index({ resource: 1, startTime: 1, endTime: 1 });

/**
 * Checks for conflicts considering resource capacity.
 * @param {string} resourceId 
 * @param {Date} startTime 
 * @param {Date} endTime 
 * @param {number} capacity - max capacity of the resource
 * @param {string|null} excludeBookingId 
 * @returns {Promise<boolean>} true if conflict exists
 */
BookingSchema.statics.checkConflict = async function (resourceId, startTime, endTime, capacity = 1, excludeBookingId = null) {
    const query = {
        resource: resourceId,
        status: { $in: ['confirmed', 'pending'] },
        $or: [
            { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
        ]
    };

    if (excludeBookingId) {
        query._id = { $ne: excludeBookingId };
    }

    const count = await this.countDocuments(query);
    return count >= capacity;
};

const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);

export default Booking;
