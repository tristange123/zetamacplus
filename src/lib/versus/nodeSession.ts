import { auth } from "@/lib/auth/auth";
import prisma from "@/lib/db/prisma";

export type VersusSessionUser = {
    userId: string,
    username: string,
};

function headersFromCookie(cookieHeader: string | undefined): Headers {
    const headers = new Headers();
    if (cookieHeader) {
        headers.set("cookie", cookieHeader);
    }
    return headers;
}

export async function getVersusUserFromCookie(
    cookieHeader: string | undefined,
): Promise<VersusSessionUser | null> {
    const session = await auth.api.getSession({
        headers: headersFromCookie(cookieHeader),
    });

    if (!session || !session.user.emailVerified) {
        return null;
    }

    const profile = await prisma.profile.findUnique({
        where: { userId: session.user.id },
        select: { username: true },
    });

    return {
        userId: session.user.id,
        username: profile?.username ?? session.user.name,
    };
}
