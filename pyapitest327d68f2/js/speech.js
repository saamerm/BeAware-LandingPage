import {
    synth,
    isPlayingSpeech,
    isStreamingCaptions,
    readText,
    setReadText,
    speechQueue,
    setSpeechQueue,
    currentUtterance,
    setCurrentUtterance,
    setVoiceChoice,
    setIsPlayingSpeech
} from './state.js';
import { getNumberOfWords, removeWords } from './utils.js';

export function iOSSpeakerFix() {
    if (!synth) return;
    if (synth.state === 'suspended') {
        synth.resume();
    }
    const utterance = new SpeechSynthesisUtterance("");
    utterance.volume = 0;
    synth.speak(utterance);
}

export function mute() {
    setIsPlayingSpeech(false);
    if (currentUtterance) {
        synth.cancel();
        setSpeechQueue([]);
        setCurrentUtterance(null);
    }
}

export function unmute() {
    setIsPlayingSpeech(true);
    processQueue();
}

export function stopSpeech() {
    if (currentUtterance) {
        synth.cancel();
        setCurrentUtterance(null);
    }
    setSpeechQueue([]);
}

export function readLogic(message, languageCode) {
    if (!isPlayingSpeech || !isStreamingCaptions) return;

    if (!readText || message.startsWith(readText.substring(0, Math.min(10, readText.length))) === false) {
        setSpeechQueue([]);
        if (currentUtterance) synth.cancel();
        speakText(message, languageCode);
        setReadText(message);
    } else {
        const newWordCount = getNumberOfWords(message);
        const oldWordCount = getNumberOfWords(readText);

        if (newWordCount > oldWordCount) {
            const unreadText = removeWords(message, oldWordCount);
            speakText(unreadText, languageCode);
        }
        setReadText(message);
    }
}

export function speakText(newText, langCode) {
    if (!synth || !newText || !newText.trim()) return;

    speechQueue.push({ text: newText, lang: langCode });
    if (!synth.speaking) {
        processQueue();
    }
}

export function processQueue() {
    if (speechQueue.length === 0 || !isPlayingSpeech || !isStreamingCaptions || synth.speaking) {
        return;
    }

    const { text, lang } = speechQueue.shift();
    const utterance = new SpeechSynthesisUtterance(text);

    var spokenLang = lang
    if (lang.length === 5) {
        spokenLang = lang.slice(0, -2) + lang.slice(-2).toUpperCase();
    }

    let voice = window.speechSynthesis.getVoices().find(voice => voice.lang.startsWith(spokenLang));
    setVoiceChoice(voice);

    if (voice) {
        utterance.voice = voice;
    } else {
        alert(`Language ${spokenLang} not available for playback on your device.`);
        // Force mute state
        setIsPlayingSpeech(false);
        if (currentUtterance) {
            synth.cancel();
            setSpeechQueue([]);
            setCurrentUtterance(null);
        }
        // Trigger event for UI to update
        $(document).trigger('mute-forced');
        return;
    }
    utterance.lang = spokenLang;

    setCurrentUtterance(utterance);
    utterance.onstart = () => { };
    utterance.onend = () => {
        setCurrentUtterance(null);
        processQueue();
    };
    utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event.error, "Text:", text);
        setCurrentUtterance(null);
        processQueue();
    };
    synth.speak(utterance);
}
