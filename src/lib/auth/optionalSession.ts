import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export default async function requireSession() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return null;
    }

    return session;
}

// does not throw if there is no session