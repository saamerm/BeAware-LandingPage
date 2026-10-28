// Holds constants that don't change.

// The secure link's code, saved by the stream page (same origin) under cc_auth_<stream>.
function savedAuthCode(stream) {
    try { return localStorage.getItem(`cc_auth_${stream}`) || ""; } catch (e) { return ""; }
}
const STREAM_NAME = (window.STREAM_CONFIG && window.STREAM_CONFIG.name) || location.pathname.split("/")[1] || "WeTech";

export const CONFIG = {
    API_BASE: "https://api.deafassistant.com/contact/",
    STREAM_NAME,
    AUTH_CODE: savedAuthCode(STREAM_NAME),
    STORAGE_KEY: "cc_user_data"
};