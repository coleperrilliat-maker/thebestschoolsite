const express = require("express");
const path = require("path");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const PORT = process.env.PORT || 3000;

const IS_PRODUCTION = process.env.NODE_ENV === "production";

let PROXY_TARGET = (process.env.PROXY_TARGET && String(process.env.PROXY_TARGET).trim()) || "";
if (!PROXY_TARGET) {
    console.warn(
        "[TubZi] PROXY_TARGET is not set in the environment (.env). " +
            "Configure it for production. Using https://httpbin.org as a temporary fallback."
    );
    PROXY_TARGET = "https://httpbin.org";
}

const proxyMiddlewareOptions = {
    target: PROXY_TARGET,
    changeOrigin: true,
    secure: false,
    pathRewrite: {
        "^/api-proxy": "" // Removes /api-proxy from the URL before sending to target
    },
    onProxyReq: (proxyReq, req, res) => {
        // Sets a realistic User-Agent to avoid bot detection
        proxyReq.setHeader(
            "User-Agent",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        );
    },
    onError: (err, req, res) => {
        console.error("[TubZi] Proxy Error:", err);
        if (!res.headersSent) {
            res.status(500).send("Proxy encountered an error.");
        }
    }
};

if (!IS_PRODUCTION) {
    proxyMiddlewareOptions.logLevel = "debug";
}

// Health first (above /api-proxy): lightweight check, never touches the proxy or body stream.
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

// Proxy before body parsers so POST /api-proxy/* is not consumed by express.json / urlencoded.
app.use("/api-proxy", createProxyMiddleware(proxyMiddlewareOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public assets — path.join(__dirname, "public") matches express.static("public") when run from server/, but works from any cwd.
app.use(express.static(path.join(__dirname, "public")));

// SPA fallback: anything else that isn’t a real file or /health / /api-proxy gets index.html
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Catch-all for errors from non-proxy routes/middleware (call next(err) to reach this).
app.use((err, req, res, next) => {
    console.error("[TubZi] Server error:", err);
    if (res.headersSent) {
        return next(err);
    }
    const status = err.statusCode || err.status || 500;
    res.status(status).json({
        error: err.message || "Internal Server Error"
    });
});

app.listen(PORT, () => {
    console.log(`[TubZi] Proxy server http://localhost:${PORT}`);
    console.log(`[TubZi] Health: http://localhost:${PORT}/health`);
    console.log(`[TubZi] Static: ./public`);
    console.log(`[TubZi] Proxy: /api-proxy/* -> ${PROXY_TARGET}/*`);
    console.log(
        `[TubZi] NODE_ENV: ${process.env.NODE_ENV || "(not set)"} — proxy debug logs ${IS_PRODUCTION ? "off" : "on"}`
    );
});
