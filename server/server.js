const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Lightweight health check.
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public assets: path.join(__dirname, "public") matches express.static("public") when run from server/, but works from any cwd.
app.use(express.static(path.join(__dirname, "public")));

// SPA fallback: anything else that isn’t a real file or /health gets index.html
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
    console.log(`[TubZi] Server http://localhost:${PORT}`);
    console.log(`[TubZi] Health: http://localhost:${PORT}/health`);
    console.log(`[TubZi] Static: ./public`);
});
