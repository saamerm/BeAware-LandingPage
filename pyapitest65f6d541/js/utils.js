// Codes that mean the same language as an entry in languageData (constants.js), under a different code.
// Tagalog is listed as Filipino ("fil"), so a client that sends "tl" still gets the right language.
const LANGUAGE_ALIASES = { tl: "fil" };

export function normalizeLang(lang) {
    if (!lang) return "";
    const lower = String(lang).trim().toLowerCase().replace(/_/g, "-");
    // Reduce "es-ES" / "en-GB" to the base language, but never by chopping characters: ISO 639-3 codes are
    // three letters ("fil", "kmr", "prs", "ckb", "haw") and cutting them to two turned Filipino into Finnish
    // ("fi") and Kurmanji into Khmer ("km").
    const base = lower.split("-")[0];
    // Keep region for languages that matter (e.g., zh-TW, zh-CN, pt-BR)
    if (base === "zh" || base === "pt") {
        return lower;
    }
    return LANGUAGE_ALIASES[base] || base;
}

export function getNumberOfWords(inputString) {
    return inputString ? inputString.trim().split(/\s+/).filter(Boolean).length : 0;
}

export function removeWords(inputString, numberOfWordsToRemove) {
    if (!inputString || !inputString.trim()) return "";
    const wordsArray = inputString.trim().split(/\s+/);
    const newWordsArray = wordsArray.slice(numberOfWordsToRemove);
    return newWordsArray.join(" ");
}
