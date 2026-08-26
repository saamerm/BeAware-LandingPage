export function normalizeLang(lang) {
    if (!lang) return "";
    const short = lang.substring(0, 2).toLowerCase();
    // Keep region for languages that matter (e.g., zh-TW, zh-CN, pt-BR)
    if (short === "zh" || short === "pt") {
        return lang.toLowerCase();
    }
    return short;
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
