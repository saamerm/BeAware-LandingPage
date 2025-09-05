// --- Configuration ---
const API_URL = 'https://api.deafassistant.com/stream/LiteSmartTranslationAdd';
const SEND_INTERVAL_MS = 1000; // Send data every 1 second

// --- DOM Element References ---
const startStopBtn = document.getElementById('start-stop-btn');
const captionInput = document.getElementById('caption-input');
const inputLangSelect = document.getElementById('input-lang');
const outputLangSelect = document.getElementById('output-lang');
const statusDiv = document.getElementById('status');

// --- State Variables ---
let isStreaming = false;
let intervalId = null;
let lastSentTranscript = '';

// --- Event Listener ---
startStopBtn.addEventListener('click', toggleStreaming);

// --- Functions ---

/**
 * Toggles the streaming state between Start and Stop.
 */
function toggleStreaming() {
  isStreaming = !isStreaming;

  if (isStreaming) {
    startStreaming();
  } else {
    stopStreaming();
  }
}

/**
 * Starts the streaming session.
 */
function startStreaming() {
  // Update UI
  startStopBtn.textContent = 'Stop';
  startStopBtn.classList.add('stop-btn');
  updateStatus('Running', 'running');
  
  // Disable language selection during streaming
  inputLangSelect.disabled = true;
  outputLangSelect.disabled = true;

  // Start the interval to send data every second
  intervalId = setInterval(() => sendData(false), SEND_INTERVAL_MS);
  
  console.log("Streaming started.");
}

/**
 * Stops the streaming session.
 */
function stopStreaming() {
  // Clear the interval
  clearInterval(intervalId);
  intervalId = null;

  // Update UI
  startStopBtn.textContent = 'Start';
  startStopBtn.classList.remove('stop-btn');
  updateStatus('Stopped', 'stopped');

  // Re-enable language selection
  inputLangSelect.disabled = false;
  outputLangSelect.disabled = false;

  // Send one final API call with isActivelyStreaming set to false
  sendData(true);
  
  console.log("Streaming stopped.");
  
  // Reset last sent transcript for the next session
  lastSentTranscript = '';
}

/**
 * Processes the transcript and sends it to the API.
 * @param {boolean} isFinalCall - True if this is the last call after stopping.
 */
function sendData(isFinalCall) {
  let fullTranscript = captionInput.value;
  let transcriptToSend = processTranscript(fullTranscript);

  // RULE 5: Don't make an API call if the transcript is empty or hasn't changed.
  // The final "stop" call should always be sent if there is text.
  if (!isFinalCall && (!transcriptToSend || transcriptToSend === lastSentTranscript)) {
    // console.log("Skipping API call: transcript empty or unchanged.");
    return;
  }
  
  // Prepare the data payload for the API
  const postData = {
    roomName: "techtown",
    isActivelyStreaming: isFinalCall ? false : true,
    inputLanguage: inputLangSelect.value,
    transcript: transcriptToSend,
    outputLanguage: outputLangSelect.value,
  };

  // Log the data being sent for debugging
  console.log('Sending data:', postData);

  // Make the API call using fetch
  fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Accept': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(postData),
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('API Success:', data);
    // Update the last sent transcript only on success
    lastSentTranscript = transcriptToSend;
  })
  .catch(error => {
    console.error('API Error:', error);
    updateStatus('API Error', 'stopped');
  });
}

/**
 * **(CORRECTED LOGIC)**
 * Processes the raw transcript based on the rules.
 * RULE 7: If the user is still typing a word (no space or punctuation at the end), omit that word.
 * @param {string} rawText - The full text from the textarea.
 * @returns {string} - The processed text to be sent.
 */
function processTranscript(rawText) {
  if (!rawText) return '';

  const lastChar = rawText.slice(-1);

  // Check if the last character is part of a word (alphanumeric).
  // This means the user is likely still typing it.
  const isTypingWord = /[a-zA-Z0-9]/.test(lastChar);
  
  if (isTypingWord) {
    // Find the last space in the text to isolate the complete words.
    const lastSpaceIndex = rawText.trim().lastIndexOf(' ');
    
    // If a space exists, return the text up to that point.
    if (lastSpaceIndex !== -1) {
      return rawText.substring(0, lastSpaceIndex).trim();
    } else {
      // If no space exists, it's the first word being typed, so send nothing.
      return '';
    }
  }
  
  // If the last character is a space, punctuation, or newline, the last word is complete.
  // Send the whole text, trimmed of any trailing whitespace.
  return rawText.trim();
}


/**
 * Updates the status display with a message and a style class.
 * @param {string} text - The message to display.
 * @param {string} statusClass - The CSS class ('idle', 'running', 'stopped').
 */
function updateStatus(text, statusClass) {
  statusDiv.textContent = `Status: ${text}`;
  statusDiv.className = statusClass;
}

// Set initial status on page load
updateStatus('Idle', 'idle');