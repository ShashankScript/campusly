
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import mongoose from "mongoose";
import { z } from "zod";
import dbConnect from "./db";

// Zod schema for environment variables
const envSchema = z.object({
    MONGODB_URI: z.string().url(),
    BETTER_AUTH_SECRET: z.string().min(1),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
});

// Validate environment variables using process.env
const env = envSchema.safeParse(process.env);

if (!env.success) {
    if (process.env.NODE_ENV === 'production') {
        console.error("CRITICAL: Missing environment variables for Auth:", env.error.flatten());
    } else {
        console.warn("Missing environment variables for Auth. Auth features may not work:", env.error.flatten());
    }
}

export const auth = betterAuth({
    database: async () => {
        // Ensure DB is connected before adapter tries to use it
        const conn = await dbConnect();
        return mongodbAdapter(conn.connection.db, mongoose);
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false,
                defaultValue: "student",
                input: false,
            },
        },
    },
});
