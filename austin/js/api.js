import { API_URL, mockObject, mockObject2, mockObject3, DEFAULT_LANGUAGE, languageData } from './constants.js';
import {
    response,
    languageCode,
    setLanguageCode,
    isStreamingCaptions,
    isTesting,
    counter,
    setCounter,
    setTranscript,
    setReadText
} from './state.js';
import {
    updateSidebarActiveStates,
    populateLanguageMenu,
    translate,
    buttonTapped
} from './ui.js';
import { readLogic } from './speech.js';
import { normalizeLang } from './utils.js';

export function updateResponseData(data) {
    response.input = data.transcript || "";
    response.output1 = data.translation || "";
    response.output2 = data.translation2 || "";
    response.output3 = data.translation3 || "";
    response.output4 = data.translation4 || "";
    response.output5 = data.translation5 || "";

    if (data.inputLanguage) response.inputLanguage = normalizeLang(data.inputLanguage);
    if (data.outputLanguage) response.outputLanguage = normalizeLang(data.outputLanguage);
    if (data.outputLanguage2) response.outputLanguage2 = normalizeLang(data.outputLanguage2);
    if (data.outputLanguage3) response.outputLanguage3 = normalizeLang(data.outputLanguage3);
    if (data.outputLanguage4) response.outputLanguage4 = normalizeLang(data.outputLanguage4);
    if (data.outputLanguage5) response.outputLanguage5 = normalizeLang(data.outputLanguage5);
}

export function updateResponseLanguages(data) {
    response.inputLanguage = normalizeLang(data.inputLanguage);
    response.outputLanguage = normalizeLang(data.outputLanguage);
    response.outputLanguage2 = normalizeLang(data.outputLanguage2);
    response.outputLanguage3 = normalizeLang(data.outputLanguage3);
    response.outputLanguage4 = normalizeLang(data.outputLanguage4);
    response.outputLanguage5 = normalizeLang(data.outputLanguage5);
}

function checkIfLanguageChanged(data) {
    const current = [response.inputLanguage, response.outputLanguage, response.outputLanguage2, response.outputLanguage3, response.outputLanguage4, response.outputLanguage5];
    const incoming = [data.inputLanguage, data.outputLanguage, data.outputLanguage2, data.outputLanguage3, data.outputLanguage4, data.outputLanguage5];
    return incoming.some((lang, i) => normalizeLang(lang) !== current[i]);
}

function swapToExistingLanguage() {
    const availableLangs = new Set();
    if (response.inputLanguage) availableLangs.add(response.inputLanguage);
    if (response.outputLanguage) availableLangs.add(response.outputLanguage);
    if (response.outputLanguage2) availableLangs.add(response.outputLanguage2);
    if (response.outputLanguage3) availableLangs.add(response.outputLanguage3);
    if (response.outputLanguage4) availableLangs.add(response.outputLanguage4);
    if (response.outputLanguage5) availableLangs.add(response.outputLanguage5);

    if (!availableLangs.has(languageCode)) {
        if (availableLangs.has(response.inputLanguage)) {
            setLanguageCode(response.inputLanguage);
        } else if (availableLangs.size > 0) {
            setLanguageCode(Array.from(availableLangs)[0]);
        } else {
            setLanguageCode(DEFAULT_LANGUAGE);
        }
        translate(languageCode);
    }
}

// Keep track of the full concatenated translations outside the function 
// so they persist between API calls.
let accumulatedTranslations = { t1: "", t2: "", t3: "", t4: "", t5: "" };
let lastTranscript = "";

export function getTranscript() {
    $.support.cors = true;
    $.getJSON(API_URL, function (t) {
        if (t) {
            if (void 0 !== t.transcript) {

                // If the transcript gets significantly shorter, it means the event restarted or cleared. 
                // We should reset our accumulated translations to avoid displaying old text.
                if (lastTranscript.length > 0 && t.transcript.length < lastTranscript.length * 0.5) {
                    accumulatedTranslations = { t1: "", t2: "", t3: "", t4: "", t5: "" };
                }
                lastTranscript = t.transcript;

                if (checkIfLanguageChanged(t)) {
                    updateResponseLanguages(t);
                    populateLanguageMenu();
                    swapToExistingLanguage();
                }
                updateResponseData(t);

                // Apply the merge to all potential translation windows seamlessly
                accumulatedTranslations.t1 = mergeTranslations(accumulatedTranslations.t1, t.translation);
                accumulatedTranslations.t2 = mergeTranslations(accumulatedTranslations.t2, t.translation2);
                accumulatedTranslations.t3 = mergeTranslations(accumulatedTranslations.t3, t.translation3);
                accumulatedTranslations.t4 = mergeTranslations(accumulatedTranslations.t4, t.translation4);
                accumulatedTranslations.t5 = mergeTranslations(accumulatedTranslations.t5, t.translation5);

                let o = "";

                // Select output text depending on selected language
                if (languageCode === response.inputLanguage) {
                    o = t.transcript;
                } else if (languageCode === response.outputLanguage) {
                    o = accumulatedTranslations.t1;
                } else if (languageCode === response.outputLanguage2) {
                    o = accumulatedTranslations.t2;
                } else if (languageCode === response.outputLanguage3) {
                    o = accumulatedTranslations.t3;
                } else if (languageCode === response.outputLanguage4) {
                    o = accumulatedTranslations.t4;
                } else if (languageCode === response.outputLanguage5) {
                    o = accumulatedTranslations.t5;
                }

                // Question modal setup
                if (t.customQuestionPrompt && "" !== t.customQuestionPrompt.trim()) {
                    $("#question-section").show();
                    $("#openModal a").text(t.customQuestionPrompt);
                    $("#askQuestionModalLabel").text(t.customQuestionPrompt);
                    $("#questionLabel").text(t.customQuestionPrompt);
                } else {
                    $("#question-section").hide();
                }

                // Networking proximity setup
                if (t.isProximityEnabled) {
                    $("#networking-section").show();
                } else {
                    $("#networking-section").hide();
                }

                // Update UI text display
                if (o) {
                    readLogic(o, languageCode);
                }
            }

            // Check if stream ended
            if (t.isActivelyStreaming === false && isStreamingCaptions) {
                buttonTapped();
            }
        }
    }).fail(function (t, o, n) {
        console.error("Error fetching transcript:", o, n);
    });
}

// Helper function to smartly merge overlapping text windows
export function mergeTranslations(oldText, newText) {
    if (!oldText) return newText || "";
    if (!newText) return oldText;

    // Only check against the last 1000 characters of old text for performance
    let a = oldText.length > 1000 ? oldText.slice(-1000) : oldText;
    let b = newText;

    let aLower = a.toLowerCase();
    let bLower = b.toLowerCase();

    let maxMatchLen = 0, matchPosA = -1, matchPosB = -1;

    // Find the Longest Common Substring
    for (let i = 0; i < aLower.length; i++) {
        for (let j = 0; j < bLower.length; j++) {
            if (aLower[i] === bLower[j]) {
                let k = 1;
                while (i + k < aLower.length && j + k < bLower.length && aLower[i + k] === bLower[j + k]) {
                    k++;
                }
                // In case of duplicate phrases, prefer the match furthest along in the old text
                if (k > maxMatchLen || (k === maxMatchLen && i > matchPosA)) {
                    maxMatchLen = k;
                    matchPosA = i;
                    matchPosB = j;
                }
            }
        }
    }

    let distA = a.length - (matchPosA + maxMatchLen);
    let distB = matchPosB;

    // Ensure the match isn't just a random word coincidence by enforcing length and edge proximity
    let isValidMatch = maxMatchLen >= 15 ||
        maxMatchLen === a.length ||
        maxMatchLen === b.length ||
        (maxMatchLen >= 8 && distA <= 2) ||
        (maxMatchLen >= 8 && distB <= 2) ||
        (maxMatchLen >= 5 && distA <= 2 && distB <= 2);

    if (isValidMatch) {
        // Stitch the strings directly at the overlap index to prevent duplicating text
        return oldText.slice(0, oldText.length - a.length + matchPosA) + newText.slice(matchPosB);
    }

    // Fallback to strict appending if the sentence doesn't overlap at all
    if (newText.length > 0 && newText.length < 20 && oldText.toLowerCase().endsWith(newText.toLowerCase())) {
        return oldText;
    }
    return oldText + (oldText.endsWith(" ") ? "" : " ") + newText;
}

export function checkLanguage() {
    if (isTesting) {
        checkMockLanguage();
        return;
    }
    $.support.cors = true;
    $.getJSON(API_URL, function (data) {
        if (data) {
            updateResponseLanguages(data);
            populateLanguageMenu();
            if (data.customQuestionPrompt && data.customQuestionPrompt.trim() !== "") {
                $("#question-section").show();
                $("#openModal a").text(data.customQuestionPrompt);
                $("#askQuestionModalLabel").text(data.customQuestionPrompt);
                $("#questionLabel").text(data.customQuestionPrompt);
            } else {
                $("#question-section").hide();
            }
            if (data.isProximityEnabled) {
                $("#networking-section").show();
            } else {
                $("#networking-section").hide();
            }
            // Set initial language
            let initLang = (response.inputLanguage && languageData[response.inputLanguage]) ? response.inputLanguage : DEFAULT_LANGUAGE;
            // We need to set languageCode? translate() does that.
            translate(initLang);
        } else {
            console.warn("Initial language check: No data received. Using defaults.");
            populateLanguageMenu();
            translate(DEFAULT_LANGUAGE);
        }
    }).fail(function () {
        console.error("Failed to fetch initial language settings from API. Using defaults.");
        populateLanguageMenu();
        translate(DEFAULT_LANGUAGE);
        checkMockLanguage();
    });
}

// Mock functions
export function checkMockLanguage() {
    const mockData = mockObject;
    if (mockData) {
        updateResponseLanguages(mockData);
        populateLanguageMenu();
        let initLang = (response.inputLanguage && languageData[response.inputLanguage]) ? response.inputLanguage : DEFAULT_LANGUAGE;
        translate(initLang);
    } else {
        console.error("Mock object is undefined. Cannot check mock language.");
        populateLanguageMenu();
        translate(DEFAULT_LANGUAGE);
    }
}

let mockWord = "";

export function getMockTranscript() {
    mockWord += " Donde esta el baño.";

    const mockDataToUse = mockObject;

    let simulatedApiData = { ...mockDataToUse };
    simulatedApiData.transcript = (simulatedApiData.transcript || "") + " " + counter + mockWord;
    simulatedApiData.translation = (simulatedApiData.translation || "") + " " + counter + mockWord;
    simulatedApiData.translation2 = (simulatedApiData.translation2 || "") + " " + counter + mockWord;

    updateResponseData(simulatedApiData);
    setCounter(counter + 1);

    let textToRead;
    if (languageCode === response.inputLanguage) textToRead = response.input;
    else if (languageCode === response.outputLanguage) textToRead = response.output1;
    else if (languageCode === response.outputLanguage2) textToRead = response.output2;
    else if (languageCode === response.outputLanguage3) textToRead = response.output3;
    else if (languageCode === response.outputLanguage4) textToRead = response.output4;
    else if (languageCode === response.outputLanguage5) textToRead = response.output5;

    if (simulatedApiData.customQuestionPrompt && simulatedApiData.customQuestionPrompt.trim() !== "") {
        $("#question-section").show();
        $("#openModal a").text(simulatedApiData.customQuestionPrompt);
        $("#askQuestionModalLabel").text(simulatedApiData.customQuestionPrompt);
        $("#questionLabel").text(simulatedApiData.customQuestionPrompt);
    } else {
        $("#question-section").hide();
    }
    if (simulatedApiData.isProximityEnabled) {
        $("#networking-section").show();
    } else {
        $("#networking-section").hide();
    }
    if (textToRead) {
        readLogic(textToRead, languageCode);
    }

    if (!simulatedApiData.isActivelyStreaming && isStreamingCaptions) {
        buttonTapped();
    }
}
