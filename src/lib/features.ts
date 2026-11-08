// Versus needs the custom Socket.IO server (server.ts), so it only runs on the AWS/ECS deploy.
// NEXT_PUBLIC_ vars are inlined at build time; the Dockerfile sets this, Vercel leaves it unset.
export const versusEnabled = process.env.NEXT_PUBLIC_ENABLE_VERSUS === "true";
