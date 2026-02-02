import {
    response,
    languageCode,
    setLanguageCode,
    isStreamingCaptions,
    setIsStreamingCaptions,
    isPlayingSpeech,
    readText,
    setReadText,
    forVideoParam, setForVideoParam,
    scrollSpeedParam, setScrollSpeedParam,
    translationNumberParam, setTranslationNumberParam,
    translationLanguageParam, setTranslationLanguageParam,
    autoRetrieveParam, setAutoRetrieveParam,
    videoTextColorParam, setVideoTextColorParam,
    chromaParam, setChromaParam,
    fontSizeParam, setFontSizeParam,
    heightParam, setHeightParam
} from './state.js';
import { languageData, DEFAULT_LANGUAGE, LAYOVER_HTML, API_URL } from './constants.js';
import { iOSSpeakerFix, mute, unmute, stopSpeech } from './speech.js';

export function getValueFromUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    setForVideoParam(urlParams.get("forVideo") === 'true');
    setTranslationNumberParam(urlParams.get("translationNumber"));
    setTranslationLanguageParam(urlParams.get("translationLanguage"));
    setVideoTextColorParam(urlParams.get("videoTextColor"));
    setAutoRetrieveParam(urlParams.get("autoRetrieve") === 'true');
    setChromaParam(urlParams.get("chroma"));
    setHeightParam(urlParams.get("height"));

    let speed = urlParams.get("scrollSpeed") || 499;
    speed = parseInt(speed, 10);
    if (isNaN(speed) || speed <= 0) speed = 499;
    setScrollSpeedParam(speed);

    setFontSizeParam(urlParams.get("fontSize"));

    if (heightParam) {
        $("#live-caption").css({ maxHeight: `${heightParam}%` });
    }

    if (forVideoParam) {
        $("#holder").hide();
        $("#header").hide();
        $("#outer-div").show().html(LAYOVER_HTML);
        checkForAdvancedOverlayParam(urlParams);
    } else {
        $("#outer-div").hide();
    }

    if (videoTextColorParam) {
        if ($("#holder2").length) {
            $("#holder2").css({ color: `#${videoTextColorParam}` });
        } else {
            $(document).one('DOMNodeInserted', '#outer-div', function (e) {
                if ($(e.target).find('#holder2').length || $(e.target).is('#holder2')) {
                    $("#holder2").css({ color: `#${videoTextColorParam}` });
                }
            });
        }
    }

    if (chromaParam) {
        document.body.style.backgroundColor = `#${chromaParam}`;
    }
    if (fontSizeParam) {
        const el = document.querySelector('.live-caption');
        if (el) el.style.fontSize = fontSizeParam;
    }

    if (autoRetrieveParam) {
        setTimeout(buttonTapped, 100);
    }
}

function checkForAdvancedOverlayParam(urlParams) {
    var advancedOverlayParam = urlParams.get("advancedOverlay") === 'true';
    const hParam = urlParams.get("height");
    const vColorParam = urlParams.get("videoTextColor");

    if (advancedOverlayParam) {
        $("#live-caption2").removeClass("overlay2").addClass("overlay3");
        if (hParam) {
            $("#live-caption2").css({ height: hParam });
        }
        if (vColorParam) {
            $("#live-caption2").css({ color: vColorParam });
        }
        if (vColorParam === "white") {
            $("#live-caption2").css({ background: "rgba(0, 0, 0, 0.8)" });
        } else if (vColorParam === "black") {
            $("#live-caption2").css({ background: "rgba(255, 255, 255, 0.8)" });
        }
    }
}

export function updateSidebarActiveStates() {
    // Stream state
    const streamSection = $('#stream-section');
    streamSection.find('.menu-option').attr({ 'aria-checked': 'false', 'tabindex': -1 });
    const activeStreamOption = isStreamingCaptions ?
        streamSection.find('.menu-option[data-value="on"]') :
        streamSection.find('.menu-option[data-value="off"]');
    activeStreamOption.addClass('active-option').attr({ 'aria-checked': 'true', 'tabindex': 0 });
    streamSection.find('.menu-option').not(activeStreamOption).removeClass('active-option');

    // Theme state
    const displaySection = $('#display-section');
    displaySection.find('.menu-option').attr({ 'aria-checked': 'false', 'tabindex': -1 });
    const activeThemeOption = $('body').hasClass('dark-mode') ?
        displaySection.find('.menu-option[data-value="dark"]') :
        displaySection.find('.menu-option[data-value="light"]');
    activeThemeOption.addClass('active-option').attr({ 'aria-checked': 'true', 'tabindex': 0 });
    displaySection.find('.menu-option').not(activeThemeOption).removeClass('active-option');
    $('#checkbox').prop('checked', $('body').hasClass('dark-mode'));

    // Language state
    const langSection = $('#language-section');
    langSection.find('.menu-option').attr({ 'aria-checked': 'false', 'tabindex': -1 }).removeClass('active-option');
    const activeLangOption = langSection.find(`.menu-option[data-value="${languageCode}"]`);
    if (activeLangOption.length) {
        activeLangOption.addClass('active-option').attr({ 'aria-checked': 'true', 'tabindex': 0 });
    }

    // Audio state
    const audioSection = $('#audio-section');
    audioSection.find('.menu-option').attr({ 'aria-checked': 'false', 'tabindex': -1 });
    const activeAudioOption = isPlayingSpeech ?
        audioSection.find('.menu-option[data-value="unmute"]') :
        audioSection.find('.menu-option[data-value="mute"]');
    activeAudioOption.addClass('active-option').attr({ 'aria-checked': 'true', 'tabindex': 0 });
    audioSection.find('.menu-option').not(activeAudioOption).removeClass('active-option');
}

export function populateLanguageMenu() {
    const langSection = $('#language-section');
    langSection.find('.menu-option[role="radio"]').remove();

    const availableLanguages = new Set();
    if (response.inputLanguage && languageData[response.inputLanguage]) availableLanguages.add(response.inputLanguage);
    if (response.outputLanguage && languageData[response.outputLanguage]) availableLanguages.add(response.outputLanguage);
    if (response.outputLanguage2 && languageData[response.outputLanguage2]) availableLanguages.add(response.outputLanguage2);
    if (response.outputLanguage3 && languageData[response.outputLanguage3]) availableLanguages.add(response.outputLanguage3);
    if (response.outputLanguage4 && languageData[response.outputLanguage4]) availableLanguages.add(response.outputLanguage4);
    if (response.outputLanguage5 && languageData[response.outputLanguage5]) availableLanguages.add(response.outputLanguage5);

    if (availableLanguages.size === 0 && languageData[DEFAULT_LANGUAGE]) {
        availableLanguages.add(DEFAULT_LANGUAGE);
    }

    availableLanguages.forEach(langCode => {
        const optionText = languageData[langCode] ? languageData[langCode].name : langCode;
        const option = $('<div></div>')
            .addClass('menu-option')
            .attr('role', 'radio')
            .attr('data-action', 'language')
            .attr('data-value', langCode)
            .attr('tabindex', -1)
            .attr('aria-checked', 'false')
            .text(optionText);
        langSection.append(option);
    });
    updateSidebarActiveStates();
}

export function loadLang(lang) {
    if (!languageData[lang]) {
        console.warn("Language data missing for:", lang, "Using default:", DEFAULT_LANGUAGE);
        lang = DEFAULT_LANGUAGE;
        if (!languageData[lang]) {
            console.error("Default language data missing. UI text will not update.");
            $("#caption-header").text("Live Captioning");
            $("#live-caption-empty").text("Transcription will appear here.");
            return;
        }
    }
    setReadText("");
    const langData = languageData[lang];
    $("#caption-header").html(langData["caption-header"]);
    $("#live-caption-empty").html(langData["live-caption-empty"]);
    if ($("#live-caption-empty2").length) {
        $("#live-caption-empty2").html(langData["live-caption-empty"]);
    }
    $("#hotmail").html(langData["hotmail"]);

    if (languageData[response.inputLanguage]) $("#input").html(languageData[response.inputLanguage]["name"]);
    else $("#input").html("Input");

    const outputs = [response.outputLanguage, response.outputLanguage2, response.outputLanguage3, response.outputLanguage4, response.outputLanguage5];
    outputs.forEach((outputLang, index) => {
        const outputEl = $(`#output${index + 1}`);
        if (outputLang && languageData[outputLang]) {
            outputEl.html(languageData[outputLang]["name"]).show();
        } else {
            outputEl.html(`Output ${index + 1}`).hide();
        }
    });

    const buttonTextKey = isStreamingCaptions ? "get-live-caption-stop" : "get-live-caption";
    const langDataForButton = languageData[lang] || languageData[DEFAULT_LANGUAGE];
    if (langDataForButton) {
        $("#get-live-caption").text(langDataForButton[buttonTextKey]);
    }
}

export function translate(selectedLang) {
    if (!languageData[selectedLang]) {
        console.warn("Attempted to translate to unsupported or unknown language:", selectedLang);
        return;
    }
    setLanguageCode(selectedLang);
    loadLang(selectedLang);

    setReadText("");
    stopSpeech();

    updateSidebarActiveStates();
}

export function startTimer() {
    if (languageData[languageCode]) {
        $("#get-live-caption").html(languageData[languageCode]['get-live-caption-stop']);
    }
}

export function stopTimer() {
    if (languageData[languageCode]) {
        $("#get-live-caption").html(languageData[languageCode]['get-live-caption']);
    }
}

export function buttonTapped() {
    setIsStreamingCaptions(!isStreamingCaptions);
    const liveCaptionButton = $("#get-live-caption");
    if (isStreamingCaptions) {
        if (languageData[languageCode]) liveCaptionButton.text(languageData[languageCode]['get-live-caption-stop']);
        else liveCaptionButton.text("Stop Streaming");
        liveCaptionButton.attr("aria-pressed", "true");
    } else {
        if (languageData[languageCode]) liveCaptionButton.text(languageData[languageCode]['get-live-caption']);
        else liveCaptionButton.text("Show Captions");
        liveCaptionButton.attr("aria-pressed", "false");
    }

    if (isStreamingCaptions) {
        iOSSpeakerFix();
        startTimer();
    } else {
        stopTimer();
    }
    updateSidebarActiveStates();
}

export function muteButtonTapped() {
    mute();
    updateSidebarActiveStates();
}

export function unmuteButtonTapped() {
    iOSSpeakerFix();
    unmute();
    updateSidebarActiveStates();
}

export function showRightTranscript() {
    let currentTranscriptText = "";
    let tempLangCode = languageCode;

    // Logic to determine which text to show based on translationNumberParam or translationLanguageParam
    // Note: This logic modifies languageCode in the original script, which might be a side effect.
    // Original script:
    /*
    if (translationNumberParam == 1) languageCode = response.outputLanguage;
    ...
    if (translationLanguageParam != languageCode) ... translate(languageCode) ...
    */
    // The original script actually MODIFIES the global languageCode in showRightTranscript.
    // This seems like it might be intended to force the UI to that language?
    // Let's replicate the logic but be careful.

    let targetLang = languageCode;

    if (translationNumberParam == 1) targetLang = response.outputLanguage;
    else if (translationNumberParam == 2) targetLang = response.outputLanguage2;
    else if (translationNumberParam == 3) targetLang = response.outputLanguage3;
    else if (translationNumberParam == 4) targetLang = response.outputLanguage4;
    else if (translationNumberParam == 5) targetLang = response.outputLanguage5;
    else if (translationNumberParam == 0) targetLang = response.inputLanguage;

    if (targetLang !== languageCode) {
        setLanguageCode(targetLang);
        // Note: Original didn't call translate() here for translationNumberParam, just set languageCode.
        // But for translationLanguageParam it DOES call translate().
    }

    if (translationLanguageParam && translationLanguageParam != languageCode) {
        // Check if translationLanguageParam matches any available output
        const potentialLangs = [response.outputLanguage, response.outputLanguage2, response.outputLanguage3, response.outputLanguage4, response.outputLanguage5, response.inputLanguage];
        if (potentialLangs.includes(translationLanguageParam)) {
            targetLang = translationLanguageParam;
            setLanguageCode(targetLang);
            translate(targetLang);
        }
    }

    // Now determine text based on (possibly updated) languageCode
    if (languageCode === response.inputLanguage) currentTranscriptText = response.input;
    else if (languageCode === response.outputLanguage) currentTranscriptText = response.output1;
    else if (languageCode === response.outputLanguage2) currentTranscriptText = response.output2;
    else if (languageCode === response.outputLanguage3) currentTranscriptText = response.output3;
    else if (languageCode === response.outputLanguage4) currentTranscriptText = response.output4;
    else if (languageCode === response.outputLanguage5) currentTranscriptText = response.output5;
    else currentTranscriptText = response.input;

    const liveCaption = $("#live-caption");
    const liveCaption2 = $("#live-caption2");

    if (liveCaption.length && liveCaption.html() !== currentTranscriptText) {
        liveCaption.html(currentTranscriptText);
        liveCaption.scrollTop(liveCaption[0].scrollHeight);
        liveCaption.stop().animate({ scrollTop: liveCaption[0].scrollHeight }, scrollSpeedParam);
    }
    if (liveCaption2.length && liveCaption2.html() !== currentTranscriptText) {
        liveCaption2.html(currentTranscriptText);
        liveCaption2.scrollTop(liveCaption2[0].scrollHeight);
        liveCaption2.stop().animate({ scrollTop: liveCaption2[0].scrollHeight }, scrollSpeedParam);
    }
}

export function modalSetup() {
    const openModalBtn = document.getElementById("openModal");
    const questionModalElement = document.getElementById("askQuestionModal");
    const questionForm = document.getElementById("questionForm");

    if (openModalBtn && questionModalElement && questionForm) {
        const askQuestionModal = new window.bootstrap.Modal(questionModalElement);

        openModalBtn.addEventListener("click", () => {
            askQuestionModal.show();
        });

        questionForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const name = document.getElementById("name").value.trim();
            const question = document.getElementById("question").value.trim();

            if (!question) {
                alert("Please enter a question.");
                return;
            }

            const streamName = new URL(API_URL).searchParams.get('streamName');
            const submissionText = name ? `${name}: ${question}` : question;
            const submissionUrl = `https://api.deafassistant.com/question/AddQuestion?streamName=${streamName}&question=${encodeURIComponent(submissionText)}`;

            try {
                const res = await fetch(submissionUrl, { method: "POST" });
                if (res.ok) {
                    alert("Question submitted successfully!");
                    askQuestionModal.hide();
                    questionForm.reset();
                } else {
                    alert("Failed to submit question. The server responded with an error.");
                }
            } catch (error) {
                alert("An error occurred while submitting the question. Please check your connection.");
                console.error("Error submitting question:", error);
            }
        });
    }
}
