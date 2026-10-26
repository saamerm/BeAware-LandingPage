// Holds constants that don't change.

export const CONFIG = {
    API_BASE: "https://api.deafassistant.com/contact/",
    STREAM_NAME: (window.STREAM_CONFIG && window.STREAM_CONFIG.name) || location.pathname.split("/")[1] || "WeTech",
    STORAGE_KEY: "cc_user_data"
};