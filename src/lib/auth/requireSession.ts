import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export default async function requireSession() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        throw new Error("Unauthorized");
    }

    return session;
}

// throws if there is no session