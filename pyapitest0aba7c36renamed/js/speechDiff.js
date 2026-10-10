// Works out which part of the text a listener has not heard yet.
//
// The text to read is a moving target: the transcript only grows, but the translated speech buffer is a sliding window (old sentences
// drop off the front once it is full) and the display translation is re-windowed on every poll. So "what is new" cannot be found by
// counting words or by checking that the new text starts with the old text - once the window is full the word count stops changing and
// the start no longer matches, which made the listener either hear nothing new or hear the whole window again.
//
// Instead the new text is aligned with the old one: find where the end of what was already read sits inside the new text, and read what
// follows. Pure functions, no DOM, so they can be tested with node.

const MIN_ALIGN = 2;          // words that must agree to trust an alignment
const MAX_LOOKBACK = 60;      // how far back from the end of the old text an alignment is checked
const MAX_CATCHUP_CHARS = 600; // a listener who joins (or resumes) late starts near the end instead of hearing hours of backlog

/** Words of `text` with their position, using the browser's word segmentation so Chinese, Japanese and Thai (no spaces) work too. */
export function tokenize(text, lang) {
    const out = [];
    if (!text) return out;
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
        try {
            const segmenter = new Intl.Segmenter(lang || undefined, { granularity: 'word' });
            for (const s of segmenter.segment(text)) {
                if (s.isWordLike) out.push({ norm: s.segment.toLowerCase(), start: s.index });
            }
            return out;
        } catch (e) { /* fall back to whitespace */ }
    }
    const re = /\S+/g;
    let m;
    while ((m = re.exec(text))) {
        const norm = m[0].toLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
        if (norm) out.push({ norm, start: m.index });
    }
    return out;
}

/** The last ~MAX_CATCHUP_CHARS of `text`, starting at a sentence boundary when there is one. */
export function catchUpTail(text) {
    if (text.length <= MAX_CATCHUP_CHARS) return text;
    const cut = text.slice(text.length - MAX_CATCHUP_CHARS);
    const boundary = cut.slice(0, MAX_CATCHUP_CHARS / 2).search(/[.!?。！？।॥؟۔።]+\s*/);
    if (boundary > -1) {
        const m = cut.slice(boundary).match(/^[.!?。！？।॥؟۔።]+\s*/);
        return cut.slice(boundary + m[0].length);
    }
    const space = cut.indexOf(' ');
    return space > -1 && space < MAX_CATCHUP_CHARS / 2 ? cut.slice(space + 1) : cut;
}

/**
 * @param {string} previous  the text as of the last call (what has been handed to the speaker so far)
 * @param {string} message   the text now
 * @returns {{unread: string, next: string}} `unread` is what to speak now; `next` is what to pass as `previous` next time.
 */
export function nextUnread(previous, message, lang) {
    if (!message || !message.trim()) return { unread: '', next: previous || '' };
    const msg = tokenize(message, lang);
    if (!msg.length) return { unread: '', next: previous || '' };

    // Nothing heard yet (first poll, new language, or the stream was reset): start near the end.
    if (!previous || !previous.trim()) return { unread: catchUpTail(message), next: message };

    const prev = tokenize(previous, lang);
    if (!prev.length) return { unread: catchUpTail(message), next: message };

    // 1. Plain growth: the old words are still at the front. A trailing word may have been completed ("hel" -> "hello"); it was
    //    already spoken, so reading resumes after it.
    if (msg.length >= prev.length) {
        let same = true;
        for (let i = 0; i < prev.length && same; i++) {
            same = msg[i].norm === prev[i].norm || (i === prev.length - 1 && msg[i].norm.startsWith(prev[i].norm));
        }
        if (same) {
            return msg.length === prev.length ? { unread: '', next: message } : { unread: message.slice(msg[prev.length].start), next: message };
        }
    }

    // 2. The new text is older than, or a piece of, what was already read (a stale response, or a window that shrank): nothing is new.
    const joined = (tokens) => '\u0001' + tokens.map((t) => t.norm).join('\u0001') + '\u0001';
    if (joined(prev).includes(joined(msg))) return { unread: '', next: previous };

    // 3. The window slid or the text was revised: find where the end of the old text sits in the new text. The alignment that agrees for
    //    the most words wins, which keeps a phrase that merely repeats later in the text from being mistaken for the old position.
    const lookback = Math.min(MAX_LOOKBACK, prev.length);
    let bestEnd = -1, bestLen = 0;
    for (let end = 0; end < msg.length; end++) {
        let len = 0;
        while (len < lookback && end - len >= 0 && msg[end - len].norm === prev[prev.length - 1 - len].norm) len++;
        if (len > bestLen) { bestLen = len; bestEnd = end; }
    }
    if (bestLen >= Math.min(MIN_ALIGN, prev.length)) {
        return bestEnd === msg.length - 1 ? { unread: '', next: message } : { unread: message.slice(msg[bestEnd + 1].start), next: message };
    }

    // 4. No overlap at all: the listener fell more than a whole window behind (or the stream restarted). The old text is gone, so
    //    everything now is unheard; start near the end rather than replaying hours.
    return { unread: catchUpTail(message), next: message };
}
