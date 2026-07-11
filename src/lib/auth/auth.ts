import { betterAuth } from "better-auth"

import { prismaAdapter } from "better-auth/adapters/prisma";
import type { User } from "better-auth";
import { sendEmail } from "./emailVerification";
import prisma from "@/lib/db/prisma";

function profileUsernameBase(name: string, email: string) {
    const fallbackName = email.split("@")[0] || "user";
    return (name.trim() || fallbackName).trim();
}

export async function createProfileForUser(user: User) {
    const existingProfile = await prisma.profile.findUnique({
        where: {
            userId: user.id,
        },
    });

    if (existingProfile) {
        return existingProfile;
    }

    const baseUsername = profileUsernameBase(user.name, user.email);
    let username = baseUsername;
    let suffix = 1;

    while (await prisma.profile.findUnique({ where: { username } })) {
        username = `${baseUsername}-${suffix}`;
        suffix += 1;
    }

    return await prisma.profile.create({
        data: {
            username,
            email: user.email,
            timeJoined: user.createdAt,
            userId: user.id,
        },
    });
}

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        google: { 
            prompt: "select_account", 
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        }, 
    },
    emailVerification: {
        sendOnSignUp: true,
        sendVerificationEmail: async ({ user, url }) => {
            void sendEmail({
                to: user.email,
                subject: "Verify your email address",
                name: user.name,
                verificationUrl: url,
            });
        },
    },
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    await createProfileForUser(user);
                },
            },
        },
    },
    trustedOrigins: [
    "http://localhost:3000",
    "https://zetamacplus.com",
    "https://zetamacplus.vercel.app",
    ]
});
