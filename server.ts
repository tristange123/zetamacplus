import "./server-env";
import { createServer } from "node:http";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import { attachVersusSockets } from "@/lib/versus/versusSockets";
import { handleVersusHttp } from "@/lib/versus/versusHttp";

const port = parseInt(process.env.PORT || "3000", 10);
const listenHost = process.env.LISTEN_HOST || "0.0.0.0";
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";

const httpServer = createServer();
httpServer.keepAliveTimeout = 65_000;
httpServer.headersTimeout = 66_000;

const app = next({
    dev,
    hostname,
    port,
    httpServer,
});
const handle = app.getRequestHandler();
const prepared = app.prepare();

function isSocketIoPath(url: string | undefined) {
    return url != null && (url === "/socket.io" || url.startsWith("/socket.io?") || url.startsWith("/socket.io/"));
}

httpServer.on("request", async (req, res) => {
    try {
        await prepared;
        if (isSocketIoPath(req.url)) {
            return;
        }
        if (await handleVersusHttp(req, res)) {
            return;
        }
        await handle(req, res);
    }
    catch (error) {
        console.error("Request failed", error);
        if (!res.headersSent) {
            res.statusCode = 500;
            res.end("Internal server error");
        }
    }
});

const io = new SocketIOServer(httpServer, {
    path: "/socket.io",
    addTrailingSlash: false,
    destroyUpgrade: false,
    serveClient: false,
    cors: {
        origin: true,
        credentials: true,
    },
});

attachVersusSockets(io);

httpServer.listen(port, listenHost, () => {
    console.log(`> Listening on http://${listenHost}:${port}`);
});

await prepared;
console.log(`> Next.js ready on http://${listenHost}:${port}`);

let shuttingDown = false;
async function shutdown(signal: string) {
    if (shuttingDown) {
        return;
    }
    shuttingDown = true;
    console.log(`${signal} received, shutting down`);

    io.close();
    await new Promise<void>((resolve) => {
        httpServer.close(() => resolve());
    });
    await app.close();
    process.exit(0);
}

process.on("SIGINT", () => {
    void shutdown("SIGINT");
});
process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
});
