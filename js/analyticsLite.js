var isTesting = false;

function postCall(endpointUrl, payloadObj) {
    if (isTesting) return;
    
    $.ajax({
        type: "POST",
        url: endpointUrl,
        data: JSON.stringify(payloadObj),
        contentType: "application/json; charset=utf-8",
        success: function(response) {
            console.log("Success:", response);
        },
        error: function(error) {
            console.log("Error:", error.responseText);
        }
    });
}

function pageViewed() {
    postCall("https://api.deafassistant.com/analytics/Event", { Event: "PageView: BeAware" });
}

function submitMessage() {
    postCall("https://api.deafassistant.com/analytics/NameEmailMessage", {
        Name: document.getElementById("contact_name").value,
        Email: document.getElementById("contact_email").value,
        Message: document.getElementById("contact_message").value
    });
}

function requestReferrerAndLocation() {
    $.getJSON("https://ipinfo.io/json", function(e) {
        var locationString = e.city + ", " + e.region + ", " + e.country;
        console.log("IP: " + locationString);
        sendLocationRequest(locationString);
    });
}

function sendLocationRequest(locationString) {
    var payload = {
        Name: locationString,
        Email: document.URL,
        Message: document.referrer
    };
    // Extra visitor details. The API ignores any it doesn't know about, and treats a missing value as "unknown".
    var visitor = getVisitorInfo();
    if (visitor.visitorId) {
        payload.VisitorId = visitor.visitorId;
        payload.IsReturning = visitor.isReturning;
    }
    payload.DeviceType = visitor.deviceType;
    payload.Os = visitor.os;
    payload.Browser = visitor.browser;
    if (visitor.botName) payload.BotName = visitor.botName;
    postCall("https://api.deafassistant.com/analytics/NameEmailMessage", payload);
}

// --- Visitor identity (new vs returning) ---
var VISITOR_KEY = "cc_visitor_id";
var NEW_THIS_SESSION_KEY = "cc_visitor_new_session";
var cachedVisitor = null;

function newGuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0;
        return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

// Returns { visitorId, isReturning }. A visitor is "returning" if their GUID was already in localStorage before
// this browsing session began; reloads and page changes within the session that created the GUID stay "new".
// If storage is blocked we send no id at all rather than a throwaway one that would inflate unique visitors.
function getVisitorIdentity() {
    try {
        var id = localStorage.getItem(VISITOR_KEY);
        if (id) {
            return { visitorId: id, isReturning: sessionStorage.getItem(NEW_THIS_SESSION_KEY) !== "1" };
        }
        id = newGuid();
        localStorage.setItem(VISITOR_KEY, id);
        sessionStorage.setItem(NEW_THIS_SESSION_KEY, "1");
        return { visitorId: id, isReturning: false };
    } catch (e) {
        return { visitorId: null, isReturning: null };
    }
}

// --- Device details, from the user agent (plus client hints where available) ---
function getDeviceInfo() {
    var ua = navigator.userAgent || "";
    var uaData = navigator.userAgentData;

    var os = "Other";
    if (/Windows/i.test(ua)) os = "Windows";
    else if (/Android/i.test(ua)) os = "Android";
    else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
    else if (/Macintosh|Mac OS X/i.test(ua)) os = "macOS";
    else if (/CrOS/i.test(ua)) os = "ChromeOS";
    else if (/Linux/i.test(ua)) os = "Linux";

    // iPadOS 13+ reports itself as a Mac; a touchscreen Mac is really an iPad.
    var isIpadOs = os === "macOS" && navigator.maxTouchPoints > 1;
    if (isIpadOs) os = "iOS";

    var browser = "Other";
    if (/Edg\//.test(ua)) browser = "Edge";
    else if (/OPR\/|Opera/.test(ua)) browser = "Opera";
    else if (/SamsungBrowser/.test(ua)) browser = "Samsung Internet";
    else if (/Firefox|FxiOS/.test(ua)) browser = "Firefox";
    else if (/Chrome|CriOS/.test(ua)) browser = "Chrome";
    else if (/Safari/.test(ua)) browser = "Safari";

    var deviceType = "desktop";
    if (/bot|crawler|spider|crawling|headless/i.test(ua)) deviceType = "bot";
    else if (isIpadOs || /iPad|Tablet/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) deviceType = "tablet";
    else if (/Mobi|iPhone|iPod|Android/i.test(ua) || (uaData && uaData.mobile)) deviceType = "mobile";

    // Which bot, when it announces itself ("Applebot/0.1" -> "Applebot"), so false positives can be spotted.
    var botName = null;
    if (deviceType === "bot") {
        var m = ua.match(/[A-Za-z][A-Za-z0-9_.-]*?(?:bot|crawler|spider|crawling)[A-Za-z0-9_.-]*|HeadlessChrome/i);
        botName = m ? m[0] : null;
    }

    return { deviceType: deviceType, os: os, browser: browser, botName: botName };
}

function getVisitorInfo() {
    if (!cachedVisitor) {
        var identity = getVisitorIdentity();
        var device = getDeviceInfo();
        cachedVisitor = {
            visitorId: identity.visitorId,
            isReturning: identity.isReturning,
            deviceType: device.deviceType,
            os: device.os,
            browser: device.browser,
            botName: device.botName
        };
    }
    return cachedVisitor;
}

// --- UPDATED INITIALIZATION CODE ---
(function() {
    "use strict";

    function runAnalytics() {
        getVisitorInfo(); // resolve new vs returning once, before anything else touches storage
        pageViewed();
        requestReferrerAndLocation();
    }

    // Wait for the entire page (including all images, CSS, etc.) to fully load
    window.addEventListener('load', function() {
        
        // requestIdleCallback waits until the browser's main thread is completely idle.
        // This ensures the analytics never cause stuttering or delay interactivity.
        if ('requestIdleCallback' in window) {
            requestIdleCallback(runAnalytics);
        } else {
            // Fallback for Safari/older browsers that don't support requestIdleCallback
            setTimeout(runAnalytics, 1);
        }
        
    });
})();