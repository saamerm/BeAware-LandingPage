import { DEFAULT_LANGUAGE } from './constants.js';

export let response = {
    input: "",
    inputLanguage: DEFAULT_LANGUAGE,
    output1: "",
    outputLanguage: "",
    output2: "",
    outputLanguage2: "",
    output3: "",
    outputLanguage3: "",
    output4: "",
    outputLanguage4: "",
    output5: "",
    outputLanguage5: "",
};

export let languageCode = DEFAULT_LANGUAGE;
export let voiceChoice = undefined;
export let isStreamingCaptions = false;
export let isPlayingSpeech = false;
export let readText = "";
export let transcript = "";
export let isTesting = false;
export let counter = 0;
export let synth = window.speechSynthesis;
export let currentUtterance = null;
export let speechQueue = [];

// URL Params
export let forVideoParam = false;
export let scrollSpeedParam = 499;
export let translationNumberParam = 5;
export let translationLanguageParam = "";
export let autoRetrieveParam = false;
export let videoTextColorParam = "";
export let chromaParam = "";
export let fontSizeParam = "x-large";
export let heightParam = "";
export let interval = 1000;

// Setters
export function setLanguageCode(val) { languageCode = val; }
export function setVoiceChoice(val) { voiceChoice = val; }
export function setIsStreamingCaptions(val) { isStreamingCaptions = val; }
export function setIsPlayingSpeech(val) { isPlayingSpeech = val; }
export function setReadText(val) { readText = val; }
export function setTranscript(val) { transcript = val; }
export function setIsTesting(val) { isTesting = val; }
export function setCounter(val) { counter = val; }
export function setCurrentUtterance(val) { currentUtterance = val; }
export function setSpeechQueue(val) { speechQueue = val; }

export function setForVideoParam(val) { forVideoParam = val; }
export function setScrollSpeedParam(val) { scrollSpeedParam = val; }
export function setTranslationNumberParam(val) { translationNumberParam = val; }
export function setTranslationLanguageParam(val) { translationLanguageParam = val; }
export function setAutoRetrieveParam(val) { autoRetrieveParam = val; }
export function setVideoTextColorParam(val) { videoTextColorParam = val; }
export function setChromaParam(val) { chromaParam = val; }
export function setFontSizeParam(val) { fontSizeParam = val; }
export function setHeightParam(val) { heightParam = val; }
