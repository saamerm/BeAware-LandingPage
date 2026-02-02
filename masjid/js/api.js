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

export function getTranscript() {
    $.support.cors = true;
    $.getJSON(API_URL, function (data) {
        if (data) {
            if (data.transcript !== undefined) {
                if (checkIfLanguageChanged(data)) {
                    updateResponseLanguages(data);
                    populateLanguageMenu();
                    swapToExistingLanguage();
                };
                updateResponseData(data);

                let textToRead = "";
                if (languageCode === response.inputLanguage) textToRead = data.transcript;
                else if (languageCode === response.outputLanguage) textToRead = data.translation;
                else if (languageCode === response.outputLanguage2) textToRead = data.translation2;
                else if (languageCode === response.outputLanguage3) textToRead = data.translation3;
                else if (languageCode === response.outputLanguage4) textToRead = data.translation4;
                else if (languageCode === response.outputLanguage5) textToRead = data.translation5;

                if (data.customQuestionPrompt && data.customQuestionPrompt.trim() !== "") {
                    $("#openModal").show();
                    $("#openModal a").text(data.customQuestionPrompt);
                    $("#askQuestionModalLabel").text(data.customQuestionPrompt);
                    $("#questionLabel").text(data.customQuestionPrompt);
                } else {
                    $("#openModal").hide();
                }
                if (textToRead) {
                    readLogic(textToRead, languageCode);
                }
            }
            if (data.isActivelyStreaming === false && isStreamingCaptions) {
                buttonTapped();
            }
        }
    }).fail(function (jqXHR, textStatus, errorThrown) {
        console.error("Error fetching transcript:", textStatus, errorThrown);
    });
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
                $("#openModal").show();
                $("#openModal a").text(data.customQuestionPrompt);
                $("#askQuestionModalLabel").text(data.customQuestionPrompt);
                $("#questionLabel").text(data.customQuestionPrompt);
            } else {
                $("#openModal").hide();
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
        $("#openModal").show();
        $("#openModal a").text(simulatedApiData.customQuestionPrompt);
        $("#askQuestionModalLabel").text(simulatedApiData.customQuestionPrompt);
        $("#questionLabel").text(simulatedApiData.customQuestionPrompt);
    } else {
        $("#openModal").hide();
    }
    if (textToRead) {
        readLogic(textToRead, languageCode);
    }

    if (!simulatedApiData.isActivelyStreaming && isStreamingCaptions) {
        buttonTapped();
    }
}
