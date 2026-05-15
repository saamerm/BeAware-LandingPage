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
    postCall("https://api.deafassistant.com/analytics/NameEmailMessage", {
        Name: locationString,
        Email: document.URL,
        Message: document.referrer
    });
}

// --- UPDATED INITIALIZATION CODE ---
(function() {
    "use strict";

    function runAnalytics() {
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