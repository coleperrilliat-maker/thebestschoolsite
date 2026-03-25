/**
 * API client for TubZi: dev uses same-origin /api-proxy (Express); production uses your real API host.
 *
 * Optional: before loading this script, set window.__TUBZI_PRODUCTION_API__ = "https://api.yourdomain.com"
 * to override the default production base URL.
 */
(function (global) {
    "use strict";

    /** Production API origin (no trailing slash). Change for your deployment. */
    var DEFAULT_PRODUCTION_API_ORIGIN = "https://api.tubzi.io";

    function getProductionApiOrigin() {
        if (typeof global.__TUBZI_PRODUCTION_API__ === "string" && global.__TUBZI_PRODUCTION_API__.trim()) {
            return global.__TUBZI_PRODUCTION_API__.replace(/\/+$/, "");
        }
        return DEFAULT_PRODUCTION_API_ORIGIN;
    }

    /**
     * In the browser, `global` is `window` — so this reads window.location.hostname
     * (localhost / 127.0.0.1 / [::1] / *.local => dev => /api-proxy; else production API).
     */
    function isDevelopmentUrl() {
        if (typeof global.location === "undefined") {
            return true;
        }
        var host = global.location.hostname || "";
        if (!host) {
            return true;
        }
        return (
            host === "localhost" ||
            host === "127.0.0.1" ||
            host === "[::1]" ||
            host.endsWith(".local")
        );
    }

    var BASE_URL = isDevelopmentUrl() ? "/api-proxy" : getProductionApiOrigin();

    /**
     * @param {string} path - Path after the base (e.g. "users" or "/v1/status")
     * @param {RequestInit} [options] - fetch options
     * @returns {Promise<Response>}
     */
    function apiFetch(path, options) {
        var p = String(path || "").replace(/^\/+/, "");
        var base = BASE_URL.replace(/\/+$/, "");
        var url = base + "/" + p;
        return global.fetch(url, options);
    }

    global.apiClient = {
        BASE_URL: BASE_URL,
        isDevelopment: isDevelopmentUrl(),
        fetch: apiFetch,
        request: apiFetch
    };
})(typeof window !== "undefined" ? window : globalThis);
