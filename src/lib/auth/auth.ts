import { betterAuth } from "better-auth"

import { prismaAdapter } from "better-auth/adapters/prisma";
// If your Prisma file is located elsewhere, you can change the path
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { sendEmail } from "./emailVerification";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
    emailAndPassword: {
        enabled: true,
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
    trustedOrigins: [
    "http://localhost:3000",
    "https://zetamacplus.com",
    "https://zetamacplus.vercel.app",
    ]
});
