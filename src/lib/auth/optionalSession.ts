import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export default async function optionalSession() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session || !session.user.emailVerified) {
        return null;
    }

    return session;
}

// does not throw if there is no session