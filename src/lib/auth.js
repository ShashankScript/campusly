
import { betterAuth } from "better-auth";
import { z } from "zod";

// Zod schema for environment variables
const envSchema = z.object({
    MONGODB_URI: z.string().url(),
    BETTER_AUTH_SECRET: z.string().min(1),
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
    database: {
        provider: "mongodb",
        url: process.env.MONGODB_URI,
    },
    secret: process.env.BETTER_AUTH_SECRET,
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false, // Disable for development
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false,
                defaultValue: "student",
                input: true, // Allow role to be set during registration
            },
        },
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day
    },
});
