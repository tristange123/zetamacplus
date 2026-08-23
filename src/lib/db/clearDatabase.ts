import prisma from './prisma'

export default async function clearDatabase(): Promise<void> {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error('Refusing to run — DATABASE_URL is not configured.');
    }

    const hostname = new URL(databaseUrl).hostname;
    const localHosts = new Set(['localhost', '127.0.0.1', '::1']);
    if (!localHosts.has(hostname)) {
        throw new Error('Refusing to run — DATABASE_URL does not point to a local database.');
    }

    await prisma.$transaction([
        prisma.problem.deleteMany(),
        prisma.test.deleteMany(),
        prisma.profile.deleteMany(),
        prisma.session.deleteMany(),
        prisma.account.deleteMany(),

        prisma.user.deleteMany(),

        prisma.verification.deleteMany(),
        prisma.daily.deleteMany(),
        prisma.dailyDate.deleteMany(),
    ]);
}