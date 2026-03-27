/**
 * API client for TubZi that targets your configured production API host.
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

    var BASE_URL = getProductionApiOrigin();

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
        isDevelopment: false,
        fetch: apiFetch,
        request: apiFetch
    };
})(typeof window !== "undefined" ? window : globalThis);
