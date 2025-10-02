// --- Constants and Variables ---
const API_URL = "https://api.deafassistant.com/stream/LiteGetStream?streamName=dnt";
const LAYOVER_HTML = `
  <div class="inner-div">
    <div id="holder2" class="holder2" style="height: 100px; border: #fafafa11; border-style: solid;">
      <div id="live-caption-empty2" class="scroller2 scroller-empty">Transcription will display here</div>
      <div class="scroller2"><div id="live-caption2" class="overlay2"></div></div>
    </div>
  </div>
`;
const DEFAULT_LANGUAGE = "en";

let response = {
  input: "",
  inputLanguage: DEFAULT_LANGUAGE, // Fallback
  output1: "",
  outputLanguage: "", // Initialize as empty, API will populate
  output2: "",
  outputLanguage2: "",
  output3: "",
  outputLanguage3: "",
  output4: "",
  outputLanguage4: "",
  output5: "",
  outputLanguage5: "",
};
let languageCode = DEFAULT_LANGUAGE;
let voiceChoice;
let isStreamingCaptions = false;
let isPlayingSpeech = false;
let readText = "";
let transcript = "";
var isTesting = false; // TODO: Before publishing, Change this to false
let counter = 0; // Only used for debug
let synth = window.speechSynthesis; // Initialize speech synthesis here
let currentUtterance = null; // Keep track of the current speech utterance
let speechQueue = [];
let forVideoParam = false;
let scrollSpeedParam = 499;
let translationNumberParam = 5;
let translationLanguageParam = "";
let autoRetrieveParam = false;
let videoTextColorParam = "";
let chromaParam = "";
let fontSizeParam = "x-large";
let heightParam = "";
var interval = 1000; // Your interval

// --- DOM Ready Handler ---
$(document).ready(function () {
  isTesting = false; // isTesting logs as true unless this is set
  isStreamingCaptions = false; // Ensure initial state
  isPlayingSpeech = false; // Default to muted

  getValueFromUrlParams();
  checkLanguage(); // This will fetch languages, populate menu, and then translate

  // Initial language load is now handled by checkLanguage -> populateLanguageMenu -> translate

  $("#get-live-caption, #live-caption-empty2, #live-caption2").on("click", buttonTapped);
  // Mute/Unmute logic is triggered by sidebar, but original buttons can remain hidden
  $("#mute").hide();
  $("#unmute").show(); // Show X-mark initially (muted state)

  setInterval(recurringFunction, interval);

  // --- Sidebar Menu Logic ---
  const menuToggleBtn = $('#menu-toggle');
  const closeMenuBtn = $('#close-menu-btn');
  const sidebar = $('#sidebar-menu');
  const body = $('body');
  const mainContent = $('#main-content'); // For inert attribute

  function openSidebar() {
      sidebar.addClass('open').attr('aria-hidden', 'false');
      menuToggleBtn.attr('aria-expanded', 'true');
      mainContent.attr('inert', 'true'); // Make main content non-interactive
      sidebar.focus(); // Focus the sidebar itself or the first interactive element
      // Set focus to the first radio button in the first group that is checked, or just the first radio.
      const firstActiveOption = sidebar.find('.menu-option[aria-checked="true"]').first();
      if (firstActiveOption.length) {
          firstActiveOption.focus();
      } else {
          sidebar.find('.menu-option[role="radio"]').first().focus();
      }
  }

  function closeSidebar() {
      sidebar.removeClass('open').attr('aria-hidden', 'true');
      menuToggleBtn.attr('aria-expanded', 'false').focus(); // Return focus to toggle button
      mainContent.removeAttr('inert');
  }

  menuToggleBtn.on('click', function() {
      sidebar.hasClass('open') ? closeSidebar() : openSidebar();
  });

  closeMenuBtn.on('click', closeSidebar);

  $(document).on('click', function(event) {
      if (sidebar.hasClass('open') &&
          !$(event.target).closest('#sidebar-menu').length &&
          !$(event.target).closest('#menu-toggle').length) {
          closeSidebar();
      }
  });
  
  // Keyboard navigation for sidebar (radiogroups)
  sidebar.on('keydown', '.menu-option[role="radio"]', function(e) {
    const $this = $(this);
    const $group = $this.closest('[role="radiogroup"]');
    const $options = $group.find('.menu-option[role="radio"]');
    let currentIndex = $options.index($this);

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        currentIndex = (currentIndex + 1) % $options.length;
        $options.eq(currentIndex).focus();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        currentIndex = (currentIndex - 1 + $options.length) % $options.length;
        $options.eq(currentIndex).focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        $this.click(); // Trigger the existing click handler
    } else if (e.key === 'Escape') {
        closeSidebar();
    }
  });


  $('#sidebar-menu').on('click', '.menu-option', function() {
      const $this = $(this);
      const action = $this.data('action');
      const value = $this.data('value');
      
      // Update ARIA states within the group
      $this.closest('[role="radiogroup"]').find('.menu-option[role="radio"]').attr({
          'aria-checked': 'false',
          'tabindex': -1
      });
      $this.attr({'aria-checked': 'true', 'tabindex': 0 });


      switch(action) {
          case 'stream':
              buttonTapped();
              break;
          case 'theme':
              if (value === 'dark') {
                  body.addClass('dark-mode');
                  $('#checkbox').prop('checked', true);
              } else {
                  body.removeClass('dark-mode');
                  $('#checkbox').prop('checked', false);
              }
              break;
          case 'language':
              translate(value);
              break;
          case 'audio':
              if (value === 'mute') {
                  muteButtonTapped();
              } else {
                  unmuteButtonTapped();
              }
              break;
      }
      updateSidebarActiveStates(); // This will re-apply tabindex and aria-checked based on global state
      // Optional: closeSidebar();
  });

  const legacyCheckbox = $("#checkbox");
  if (legacyCheckbox.length) {
    legacyCheckbox.on("change", () => {
        $('body').toggleClass('dark-mode');
        updateSidebarActiveStates(); // This will update the sidebar's display options
    });
  }

  modalSetup();
  // If user is using dark mode, use that by default
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;  
  if (prefersDark) {
      body.addClass('dark-mode');
      $('#checkbox').prop('checked', true);
  }
});

function modalSetup(){
    // --- Modal Functionality for "Ask a Question" ---

  // 1. Get references to the HTML elements
  const openModalBtn = document.getElementById("openModal");
  const questionModalElement = document.getElementById("askQuestionModal");
  const questionForm = document.getElementById("questionForm");

  // Check if the elements exist before proceeding
  if (openModalBtn && questionModalElement && questionForm) {
    // 2. Initialize the Bootstrap Modal component
    const askQuestionModal = new window.bootstrap.Modal(questionModalElement);

    // 3. Add event listener to the "Ask a Question" button to show the modal
    openModalBtn.addEventListener("click", () => {
      askQuestionModal.show();
    });

    // 4. Add event listener for the form submission
    questionForm.addEventListener("submit", async (e) => {
      e.preventDefault(); // Prevent the default browser form submission

      // Get the values from the form inputs
      const name = document.getElementById("name").value.trim(); // FIX: Correctly gets the name
      const question = document.getElementById("question").value.trim();

      // Validate that a question was actually entered
      if (!question) {
        alert("Please enter a question.");
        return;
      }

      // --- Dynamic API URL construction ---
      // Get the streamName dynamically from your existing API_URL constant
      const streamName = new URL(API_URL).searchParams.get('streamName');
      
      // Format the question text (handles cases where name is left blank)
      const submissionText = name ? `${name}: ${question}` : question;

      // Construct the final URL for the API call
      const submissionUrl = `https://api.deafassistant.com/question/AddQuestion?streamName=${streamName}&question=${encodeURIComponent(submissionText)}`;

      try {
        // Send the data to the API using a POST request
        const res = await fetch(submissionUrl, { method: "POST" });

        if (res.ok) {
          alert("Question submitted successfully!");
          askQuestionModal.hide(); // Hide the modal on success
          questionForm.reset();  // Clear the form fields
        } else {
          // Handle server-side errors
          alert("Failed to submit question. The server responded with an error.");
        }
      } catch (error) {
        // Handle network errors
        alert("An error occurred while submitting the question. Please check your connection.");
        console.error("Error submitting question:", error);
      }
    });
  }
  // --- End of Modal Functionality ---
}

// --- Function to update sidebar active states (with ARIA) ---
function updateSidebarActiveStates() {
    // Stream state
    const streamSection = $('#stream-section');
    streamSection.find('.menu-option').attr({'aria-checked': 'false', 'tabindex': -1});
    const activeStreamOption = isStreamingCaptions ? 
        streamSection.find('.menu-option[data-value="on"]') : 
        streamSection.find('.menu-option[data-value="off"]');
    activeStreamOption.addClass('active-option').attr({'aria-checked': 'true', 'tabindex': 0});
    streamSection.find('.menu-option').not(activeStreamOption).removeClass('active-option');


    // Theme state
    const displaySection = $('#display-section');
    displaySection.find('.menu-option').attr({'aria-checked': 'false', 'tabindex': -1});
    const activeThemeOption = $('body').hasClass('dark-mode') ?
        displaySection.find('.menu-option[data-value="dark"]') :
        displaySection.find('.menu-option[data-value="light"]');
    activeThemeOption.addClass('active-option').attr({'aria-checked': 'true', 'tabindex': 0});
    displaySection.find('.menu-option').not(activeThemeOption).removeClass('active-option');
    $('#checkbox').prop('checked', $('body').hasClass('dark-mode'));


    // Language state
    const langSection = $('#language-section');
    langSection.find('.menu-option').attr({'aria-checked': 'false', 'tabindex': -1}).removeClass('active-option');
    const activeLangOption = langSection.find(`.menu-option[data-value="${languageCode}"]`);
    if (activeLangOption.length) {
        activeLangOption.addClass('active-option').attr({'aria-checked': 'true', 'tabindex': 0});
    }


    // Audio state
    const audioSection = $('#audio-section');
    audioSection.find('.menu-option').attr({'aria-checked': 'false', 'tabindex': -1});
    const activeAudioOption = isPlayingSpeech ?
        audioSection.find('.menu-option[data-value="unmute"]') :
        audioSection.find('.menu-option[data-value="mute"]');
    activeAudioOption.addClass('active-option').attr({'aria-checked': 'true', 'tabindex': 0});
    audioSection.find('.menu-option').not(activeAudioOption).removeClass('active-option');
}

// --- Function to populate language menu in sidebar (with ARIA) ---
function populateLanguageMenu() {
    const langSection = $('#language-section');
    // Clear only menu options, not the heading
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
        const optionText = languageData[langCode] ? languageData[langCode].name : langCode; // Fallback to code if name missing
        const option = $('<div></div>')
            .addClass('menu-option')
            .attr('role', 'radio') // Add role
            .attr('data-action', 'language')
            .attr('data-value', langCode)
            .attr('tabindex', -1) // Initially not in tab order
            .attr('aria-checked', 'false') // Initially not checked
            .text(optionText);
        langSection.append(option);
    });
    // After populating, update ARIA states based on current languageCode
    updateSidebarActiveStates();
}
// --- Your Existing Functions (Modified where necessary) ---

function getValueFromUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  forVideoParam = urlParams.get("forVideo") === 'true';
  translationNumberParam = urlParams.get("translationNumber");
  translationLanguageParam = urlParams.get("translationLanguage");
  videoTextColorParam = urlParams.get("videoTextColor");
  autoRetrieveParam = urlParams.get("autoRetrieve") === 'true';
  chromaParam = urlParams.get("chroma");
  heightParam = urlParams.get("height");
  scrollSpeedParam = urlParams.get("scrollSpeed") || 499; // Default to 499 if not set
  fontSizeParam = urlParams.get("fontSize");
  if (heightParam) {
    $("#live-caption").css({ maxHeight: `${heightParam}%` });
  }
  if (scrollSpeedParam) {
    // Ensure scrollSpeedParam is a number and set it globally
    scrollSpeedParam = parseInt(scrollSpeedParam, 10);
    if (isNaN(scrollSpeedParam) || scrollSpeedParam <= 0) {
      scrollSpeedParam = 499; // Fallback to default if invalid
    }
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
     if ($("#holder2").length) { // Check if holder2 exists already
        $("#holder2").css({ color: `#${videoTextColorParam}` });
    } else { // If not, wait for it to be inserted (common with LAYOVER_HTML)
        $(document).one('DOMNodeInserted', '#outer-div', function(e) {
            // Check if the inserted content contains holder2
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
    document.querySelector('.live-caption').style.fontSize = fontSizeParam;
  }
  
  if (autoRetrieveParam) {
    // Delay slightly to ensure other initializations (like language) might complete
    setTimeout(buttonTapped, 100); 
  }
}

function checkForAdvancedOverlayParam(urlParams){
  var advancedOverlayParam = urlParams.get("advancedOverlay") === 'true';
  heightParam = urlParams.get("height");
  videoTextColorParam = urlParams.get("videoTextColor");
  if (advancedOverlayParam) {
    $("#live-caption2").removeClass("overlay2").addClass("overlay3");
    if (heightParam){
      $("#live-caption2").css({height: heightParam});
    }
    if (videoTextColorParam){
      $("#live-caption2").css({color: videoTextColorParam});
    } 
    if (videoTextColorParam === "white"){
      $("#live-caption2").css({background: "rgba(0, 0, 0, 0.8)"});
    } else if (videoTextColorParam === "black"){
      $("#live-caption2").css({background: "rgba(255, 255, 255, 0.8)"});
    }
  }
}

function buttonTapped() {
  // startTimer/stopTimer update button text based on languageCode
  // which should be set by translate() before this can be reliably called.

  isStreamingCaptions = !isStreamingCaptions;
    // Update button text and ARIA live region for announcements
  const liveCaptionButton = $("#get-live-caption");
  if (isStreamingCaptions) {
      if (languageData[languageCode]) liveCaptionButton.text(languageData[languageCode]['get-live-caption-stop']);
      else liveCaptionButton.text("Stop Streaming");
      liveCaptionButton.attr("aria-pressed", "true"); // Announce it's active
      // You might want an aria-live region to announce "Streaming started"
  } else {
      if (languageData[languageCode]) liveCaptionButton.text(languageData[languageCode]['get-live-caption']);
      else liveCaptionButton.text("Show Captions");
      liveCaptionButton.attr("aria-pressed", "false"); // Announce it's inactive
      // Announce "Streaming stopped"
  }
  
  if (isStreamingCaptions) {
    iOSSpeakerFix();
    startTimer(); // Original function for button text based on lang
  } else {
    stopTimer(); // Original function
  }
  updateSidebarActiveStates(); // Sync sidebar
  // loadLang(languageCode); // This is now part of start/stopTimer effectively
}

function muteButtonTapped() {
  // No alert needed, sidebar shows state
  mute();
  updateSidebarActiveStates();
}

function unmuteButtonTapped() {
  iOSSpeakerFix();
  unmute();
  updateSidebarActiveStates();
}

function iOSSpeakerFix() {
  if (!synth) return;
  if (synth.state === 'suspended') { // Attempt to resume if suspended (common on mobile)
    synth.resume();
  }
  const utterance = new SpeechSynthesisUtterance("");
  utterance.volume = 0; // Play silently to activate audio context
  synth.speak(utterance);
}

function mute() {
  isPlayingSpeech = false;
  $("#unmute").show();
  $("#mute").hide();
  if (currentUtterance) {
      synth.cancel();
      speechQueue = [];
      currentUtterance = null;
  }
}

function unmute() {
  isPlayingSpeech = true;
  $("#mute").show();
  $("#unmute").hide();
  processQueue(); // Attempt to process queue if items were added while muted
}

// Recurring function
function showRightTranscript() {
  let currentTranscriptText = ""; // Use a local var
  if (translationNumberParam == 1) {
    languageCode = response.outputLanguage; // Use output1 for translationNumber 1
  } else if (translationNumberParam == 2) {
    languageCode = response.outputLanguage2; // Use output2 for translationNumber 2
  } else if (translationNumberParam == 3) {
    languageCode = response.outputLanguage3; // Use output3 for translationNumber 3
  } else if (translationNumberParam == 4) {
    languageCode = response.outputLanguage4; // Use output4 for translationNumber 4
  } else if (translationNumberParam == 5) {
    languageCode = response.outputLanguage5; // Use output5 for translationNumber 5
  } else if (translationNumberParam == 0) {
    languageCode = response.inputLanguage; // Default to input language
  } else{
    // Don't do anything
  }

  if (translationLanguageParam != languageCode){
    if (translationLanguageParam == response.outputLanguage) {
      languageCode = response.outputLanguage; // Use output1 for translationLanguage 1
      translate(languageCode);       // Load initial language and update UI
    } else if (translationLanguageParam == response.outputLanguage2) {
      languageCode = response.outputLanguage2; // Use output2 for translationLanguage 2
      translate(languageCode);       // Load initial language and update UI
    } else if (translationLanguageParam == response.outputLanguage3) {
      languageCode = response.outputLanguage3; // Use output3 for translationLanguage 3
      translate(languageCode);       // Load initial language and update UI
    } else if (translationLanguageParam == response.outputLanguage4) {
      languageCode = response.outputLanguage4; // Use output4 for translationLanguage 4
      translate(languageCode);       // Load initial language and update UI
    } else if (translationLanguageParam == response.outputLanguage5) {
      languageCode = response.outputLanguage5; // Use output5 for translationLanguage 5
      translate(languageCode);       // Load initial language and update UI
    } else if (translationLanguageParam == response.inputLanguage) {
      languageCode = response.inputLanguage; // Default to input language
      translate(languageCode);       // Load initial language and update UI
    } else{
      // Don't do anything
    }
  }

  if (languageCode === response.inputLanguage) {
    currentTranscriptText = response.input;
  } else if (languageCode === response.outputLanguage) {
    currentTranscriptText = response.output1;
  } else if (languageCode === response.outputLanguage2) {
    currentTranscriptText = response.output2;
  } else if (languageCode === response.outputLanguage3) {
    currentTranscriptText = response.output3;
  } else if (languageCode === response.outputLanguage4) {
    currentTranscriptText = response.output4;
  } else if (languageCode === response.outputLanguage5) {
    currentTranscriptText = response.output5;
  } else {
    currentTranscriptText = response.input; // Default to input
  }

  const liveCaption = $("#live-caption");
  const liveCaption2 = $("#live-caption2"); // For video overlay

  if (liveCaption.length && liveCaption.html() !== currentTranscriptText) {
    liveCaption.html(currentTranscriptText);
    liveCaption.scrollTop(liveCaption[0].scrollHeight);
    liveCaption.stop().animate({ scrollTop: liveCaption[0].scrollHeight }, scrollSpeedParam);
  }
  // For video overlay, ensure elements exist
  if (liveCaption2.length && liveCaption2.html() !== currentTranscriptText) {
    liveCaption2.html(currentTranscriptText);
    liveCaption2.scrollTop(liveCaption2[0].scrollHeight);
    liveCaption2.stop().animate({ scrollTop: liveCaption2[0].scrollHeight }, scrollSpeedParam);
    // Potentially scroll liveCaption2 as well if it's scrollable
  }
}

function loadLang(lang) {
  if (!languageData[lang]) {
    console.warn("Language data missing for:", lang, "Using default:", DEFAULT_LANGUAGE);
    lang = DEFAULT_LANGUAGE; // Fallback to default if selected lang data is missing
    if (!languageData[lang]) { // If default is also missing, critical error
        console.error("Default language data missing. UI text will not update.");
        // Display a generic message or leave as is
        $("#caption-header").text("Live Captioning");
        $("#live-caption-empty").text("Transcription will appear here.");
        // ... set other texts to generic defaults
        return;
    }
  }
  readText = ""; 
  const langData = languageData[lang];
  $("#caption-header").html(langData["caption-header"]);
  $("#live-caption-empty").html(langData["live-caption-empty"]);
  if ($("#live-caption-empty2").length) { // Check if overlay element exists
      $("#live-caption-empty2").html(langData["live-caption-empty"]);
  }
  $("#hotmail").html(langData["hotmail"]);

  // Update legacy link texts (they are hidden but good for consistency)
  if (languageData[response.inputLanguage]) $("#input").html(languageData[response.inputLanguage]["name"]);
  else $("#input").html("Input");

  const outputs = [response.outputLanguage, response.outputLanguage2, response.outputLanguage3, response.outputLanguage4, response.outputLanguage5];
  outputs.forEach((outputLang, index) => {
      const outputEl = $(`#output${index + 1}`);
      if (outputLang && languageData[outputLang]) {
          outputEl.html(languageData[outputLang]["name"]).show();
      } else {
          outputEl.html(`Output ${index + 1}`).hide(); // Hide if no lang or no data
      }
  });
  
    // Update the main "Show Captions" button text based on current streaming state
  const buttonTextKey = isStreamingCaptions ? "get-live-caption-stop" : "get-live-caption";
  const langDataForButton = languageData[lang] || languageData[DEFAULT_LANGUAGE]; // Fallback for button text
  if (langDataForButton) {
      $("#get-live-caption").text(langDataForButton[buttonTextKey]);
  }
}

function recurringFunction() {
  const mainCaptionEmpty = $("#live-caption-empty");
  const overlayCaptionEmpty = $("#live-caption-empty2");

  if (!response.input || response.input.trim() === "") {
    mainCaptionEmpty.show();
    $("#live-caption").hide();
    if (overlayCaptionEmpty.length) {
        overlayCaptionEmpty.show();
        if ($("#live-caption2").length) $("#live-caption2").parent().hide(); // Hide parent scroller
    }
  } else {
    mainCaptionEmpty.hide();
    $("#live-caption").show();
    if (overlayCaptionEmpty.length) {
        overlayCaptionEmpty.hide();
        if ($("#live-caption2").length) $("#live-caption2").parent().show();
    }
    showRightTranscript();
  }

  if (isStreamingCaptions) {
    isTesting ? getMockTranscript() : getTranscript();
  }
}

function startTimer() {
    if (languageData[languageCode]) {
      $("#get-live-caption").html(languageData[languageCode]['get-live-caption-stop']);
    }
}
  
function stopTimer() {
    if (languageData[languageCode]) {
      $("#get-live-caption").html(languageData[languageCode]['get-live-caption']);
    }
}

function checkIfLanguageChanged(data) {
  // Compare current response languages with new data
  const langChanged = 
      (data.inputLanguage && data.inputLanguage.substring(0, 2) !== response.inputLanguage) ||
      (data.outputLanguage && data.outputLanguage.substring(0, 2) !== response.outputLanguage) ||
      (data.outputLanguage2 && data.outputLanguage2.substring(0, 2) !== response.outputLanguage2) ||
      (data.outputLanguage3 && data.outputLanguage3.substring(0, 2) !== response.outputLanguage3) ||
      (data.outputLanguage4 && data.outputLanguage4.substring(0, 2) !== response.outputLanguage4) ||
      (data.outputLanguage5 && data.outputLanguage5.substring(0, 2) !== response.outputLanguage5);
  return langChanged;
}

function swapToExistingLanguage(){
  // Ensure current languageCode is still valid, else switch to input or default
  const availableLangs = new Set();
  if (response.inputLanguage) availableLangs.add(response.inputLanguage);
  if (response.outputLanguage) availableLangs.add(response.outputLanguage);
  if (response.outputLanguage2) availableLangs.add(response.outputLanguage2);
  if (response.outputLanguage3) availableLangs.add(response.outputLanguage3);
  if (response.outputLanguage4) availableLangs.add(response.outputLanguage4);
  if (response.outputLanguage5) availableLangs.add(response.outputLanguage5);

  if (!availableLangs.has(languageCode)) {
      // Current languageCode is no longer valid
      if (availableLangs.has(response.inputLanguage)) {
          languageCode = response.inputLanguage; // Switch to input language if available
      } else if (availableLangs.size > 0) {
          languageCode = Array.from(availableLangs)[0]; // Switch to first available language
      } else {
          languageCode = DEFAULT_LANGUAGE; // Fallback to default
      }
      translate(languageCode); // Update UI and readText accordingly
  }
}

// Recurring function
function getTranscript() {
  $.support.cors = true;
  $.getJSON(API_URL, function (data) {
    if (data) {

      if (data.transcript !== undefined) {
        // Check if languages have changed
        if (checkIfLanguageChanged(data)) {          
          updateResponseLanguages(data); // Set up response.xxxLanguage based on stream config
          populateLanguageMenu();      // Build the sidebar menu with these languages
          swapToExistingLanguage(); // Ensure current languageCode is still valid and then try to switch to it
        }; 
        updateResponseData(data); // This updates transcript text and also the language codes in `response`
      
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
          readLogic(textToRead);
        }
      }
      if (data.isActivelyStreaming === false && isStreamingCaptions) {
        buttonTapped();
      }
    }
  }).fail(function(jqXHR, textStatus, errorThrown) {
      console.error("Error fetching transcript:", textStatus, errorThrown);
  });
}

function updateResponseData(data) { // Primarily for transcript text and associated language codes
    response.input = data.transcript || "";
    if (data.inputLanguage) response.inputLanguage = data.inputLanguage.substring(0, 2);
    
    response.output1 = data.translation || "";
    if (data.outputLanguage) response.outputLanguage = data.outputLanguage.substring(0, 2);
    
    response.output2 = data.translation2 || "";
    if (data.outputLanguage2) response.outputLanguage2 = data.outputLanguage2.substring(0, 2);

    response.output3 = data.translation3 || "";
    if (data.outputLanguage3) response.outputLanguage3 = data.outputLanguage3.substring(0, 2);

    response.output4 = data.translation4 || "";
    if (data.outputLanguage4) response.outputLanguage4 = data.outputLanguage4.substring(0, 2);

    response.output5 = data.translation5 || "";
    if (data.outputLanguage5) response.outputLanguage5 = data.outputLanguage5.substring(0, 2);
}

// Called ONCE on load to get available languages for the menu
function checkLanguage() { 
    if (isTesting) {
        checkMockLanguage(); // This will call populateLanguageMenu and translate
        return;
    }
    $.support.cors = true;
    // This initial call is to get the stream's language configuration
    $.getJSON(API_URL, function(data) { 
        if (data) {
            updateResponseLanguages(data); // Set up response.xxxLanguage based on stream config
            populateLanguageMenu();      // Build the sidebar menu with these languages
            if (data.customQuestionPrompt && data.customQuestionPrompt.trim() !== "") {
              $("#openModal").show();
              $("#openModal a").text(data.customQuestionPrompt);
              $("#askQuestionModalLabel").text(data.customQuestionPrompt);
              $("#questionLabel").text(data.customQuestionPrompt);          
            } else {
              $("#openModal").hide();
            }    
            // Set initial language: try API's input, then default
            languageCode = (response.inputLanguage && languageData[response.inputLanguage]) ? response.inputLanguage : DEFAULT_LANGUAGE;
            translate(languageCode);       // Load initial language and update UI
        } else {
            console.warn("Initial language check: No data received. Using defaults.");
            populateLanguageMenu(); // Populate with defaults if any
            translate(DEFAULT_LANGUAGE);
        }
    }).fail(function() {
        console.error("Failed to fetch initial language settings from API. Using defaults.");
        // In case of API failure, response.xxxLanguage might be empty or default
        // populateLanguageMenu will use these (potentially just DEFAULT_LANGUAGE)
        populateLanguageMenu(); 
        translate(DEFAULT_LANGUAGE);
        checkMockLanguage(); // This will call populateLanguageMenu and translate
    });
}

function updateResponseLanguages(data) { // Called by checkLanguage (once) or if API can change available langs
  // This function defines WHICH languages are available for selection
  response.inputLanguage = (data.inputLanguage) ? data.inputLanguage.substring(0, 2) : DEFAULT_LANGUAGE;
  response.outputLanguage = (data.outputLanguage) ? data.outputLanguage.substring(0, 2) : "";
  response.outputLanguage2 = (data.outputLanguage2) ? data.outputLanguage2.substring(0, 2) : "";
  response.outputLanguage3 = (data.outputLanguage3) ? data.outputLanguage3.substring(0, 2) : "";
  response.outputLanguage4 = (data.outputLanguage4) ? data.outputLanguage4.substring(0, 2) : "";
  response.outputLanguage5 = (data.outputLanguage5) ? data.outputLanguage5.substring(0, 2) : "";
}

function readLogic(message) {
    if (!isPlayingSpeech || !isStreamingCaptions) return; // Don't process if muted or not streaming

    if (!readText || message.startsWith(readText.substring(0, Math.min(10, readText.length))) === false ) {
        // If readText is empty OR new message doesn't start like old one (language change or jump)
        // Then speak the whole new message.
        speechQueue = []; // Clear queue for new full message
        if (currentUtterance) synth.cancel(); // Cancel ongoing if any
        speakText(message, languageCode);
        readText = message; // Set readText to the full new message
    } else {
        const newWordCount = getNumberOfWords(message);
        const oldWordCount = getNumberOfWords(readText);
        
        if (newWordCount > oldWordCount){
            const unreadText = removeWords(message, oldWordCount);
            speakText(unreadText, languageCode); // Add incremental text to queue
        }
        // Always update readText to the latest full message received from API
        // This ensures 'oldWordCount' is correct for the next comparison.
        readText = message; 
    }
}

function speakText(newText, langCode) {
  if (!synth || !newText || !newText.trim()) return;

  speechQueue.push({ text: newText, lang: langCode });
  if (!synth.speaking) { // Only call processQueue if not already speaking
    processQueue();
  }
}

function processQueue() {
  if (speechQueue.length === 0 || !isPlayingSpeech || !isStreamingCaptions || synth.speaking) {
    return; // Don't process if queue empty, muted, not streaming, or already speaking
  }

  const { text, lang } = speechQueue.shift();
  const utterance = new SpeechSynthesisUtterance(text);
  
  voiceChoice = window.speechSynthesis.getVoices().find(voice => voice.lang.startsWith(lang));
    
  if (voiceChoice) {
    utterance.voice = voiceChoice;
  } else {
      // console.warn(`No specific voice for ${lang}. Using default. Or alert & mute.`);
      alert(`Language ${lang} not available for playback on your device.`);
      muteButtonTapped(); // This might be too aggressive
      return; 
  }
  utterance.lang = lang;

  currentUtterance = utterance; // Set before speaking
  utterance.onstart = () => { /* currentUtterance is already set */ };
  utterance.onend = () => {
    currentUtterance = null;
    processQueue();
  };
  utterance.onerror = (event) => {
    console.error("Speech synthesis error:", event.error, "Text:", text);
    currentUtterance = null;
    processQueue();
  };
  synth.speak(utterance);
}

function translate(selectedLang) {
    if (!languageData[selectedLang]) {
        console.warn("Attempted to translate to unsupported or unknown language:", selectedLang);
        // Optionally fall back to default or do nothing
        // selectedLang = DEFAULT_LANGUAGE; 
        return; // Or handle error more gracefully
    }
    languageCode = selectedLang;
    loadLang(languageCode); // Update UI texts for the new language
    
    // Reset speech for new language
    readText = ""; // So the new language transcript is read from the beginning
    if (currentUtterance) {
        synth.cancel(); // Stop any ongoing speech
        currentUtterance = null;
    }
    speechQueue = []; // Clear the speech queue

    updateSidebarActiveStates(); // Update active selection in sidebar
}

function getNumberOfWords(inputString) {
  return inputString ? inputString.trim().split(/\s+/).filter(Boolean).length : 0;
}

function removeWords(inputString, numberOfWordsToRemove) {
  if (!inputString || !inputString.trim()) return "";
  const wordsArray = inputString.trim().split(/\s+/);
  const newWordsArray = wordsArray.slice(numberOfWordsToRemove);
  return newWordsArray.join(" ");
}

// Dark Mode (Class-based, invertColors() is replaced by body.dark-mode toggling)
// The legacy checkbox listener is already set up to toggle 'dark-mode' class

// --- Mock Data Functions ---
function checkMockLanguage() {
  const mockData = mockObject; // Use your primary mock object
  if (mockData) { // No need to check mockData.transcript here, just for language config
    updateResponseLanguages(mockData); // Sets response.xxxLanguage
    populateLanguageMenu();          // Builds sidebar menu from response.xxxLanguage

    // Set initial language for testing
    languageCode = (response.inputLanguage && languageData[response.inputLanguage]) ? response.inputLanguage : DEFAULT_LANGUAGE;
    translate(languageCode);           // Loads this language
  } else {
      console.error("Mock object is undefined. Cannot check mock language.");
      populateLanguageMenu(); // Populate with defaults
      translate(DEFAULT_LANGUAGE);
  }
}

let mockWord = ""; // Keep this for getMockTranscript

function getMockTranscript() {
  // mockWord += " سيبدأ الحدث"; // Example Arabic
  mockWord += " Donde esta el baño."; // Example Spanish
  
  const mockDataToUse = mockObject; // Choose which mock object to get transcript text from

  // Simulate that the current transcript is appended with mockWord
  // This logic is a bit different from just using mockDataToUse.transcript directly.
  // For testing 'readLogic', we need to simulate an evolving transcript.
  
  // Let's simulate the API response structure for updateResponseData
  let simulatedApiData = { ...mockDataToUse }; // Clone
  simulatedApiData.transcript = (simulatedApiData.transcript || "") + " " + counter + mockWord;
  // If you want to simulate translations also evolving:
  simulatedApiData.translation = (simulatedApiData.translation || "") + " " + counter + mockWord; // Adjust if translation differs
  simulatedApiData.translation2 = (simulatedApiData.translation2 || "") + " " + counter + mockWord;
  // etc. for translation3 and translation4

  updateResponseData(simulatedApiData); // This updates response.input, response.output1 etc.
  counter++;
      
  let textToRead;
  if (languageCode === response.inputLanguage) textToRead = response.input; // Use the updated response.input
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
    readLogic(textToRead);
  }
 
  if (!simulatedApiData.isActivelyStreaming && isStreamingCaptions) {
    buttonTapped();
  }
}

// Your existing mockObject, mockObject2, mockObject3
const mockObject = {
  "timestamp": "2024-12-10T20:56:50.4571326",
  "roomName": "dnt",
  "description": "",
  "transcript": "The event will start shortly.",
  "isActivelyStreaming": true,
  "translation": "El evento comenzará en breve",
  "translation2": "سيبدأ الحدث قريبا",
  "inputLanguage": "en-US",
  "outputLanguage": "es",
  "outputLanguage2": "ar-001",
  "customQuestionPrompt": "Ask a question about the event",
  "isPremiumCustomer": false,
  "blockStorage": false,
  "uid": null
}

const mockObject2 = {
  "id":59,"timestamp":"2025-01-29T04:36:36.4389888","roomName":"dnt","description":"","isActivelyStreaming":true,
  "transcript":" What happened to this. So, let's see if the translation gets removed from this text, where is the value? Why is this not working? Let's go on and continue. Is this translation showing nothing. Yes, it is not showing anything. What is actually going on here? I have no idea.",
  "translation":"¿Qué pasó con esto? Entonces, veamos si la traducción se elimina de este texto, ¿dónde está el valor? ¿Por qué esto no funciona? Sigamos adelante y continuemos. ¿Esta traducción no muestra nada? Sí, no está mostrando nada. ¿Qué está pasando aquí? No tengo ni idea.",
  "translation2":"","inputLanguage":"en-US","outputLanguage":"es","outputLanguage2":"","isPremiumCustomer":false,"blockStorage":false,"uid":null
}
const mockObject3 = {
  "id":59,"timestamp":"2025-01-29T04:36:36.4389888","roomName":"dnt","description":"","isActivelyStreaming":true,
  "transcript":" What happened to this. So, let's see if the translation gets removed from this text, where is the value? Why is this not working? Let's go on and continue. Is this translation showing nothing. Yes, it is not showing anything. What is actually going on here? I have no idea.",
  "translation":"حدث التسميات التوضيحية الحية",
  "translation2":"","inputLanguage":"en-US","outputLanguage":"ar","outputLanguage2":"","isPremiumCustomer":false,"blockStorage":false,"uid":null
}
const languageData = {
  'en': {
    "caption-header":"Captions & Translations",
    "get-live-caption":"Show Captions",
    "get-live-caption-stop":"Stop Streaming",
    "live-caption-empty":"Transcription will display here",
    "hotmail":"PS: I love you. Get free event subtitles & translations",
    "name":"English"
  },
  'fr': {
    "caption-header":"Sous-titrage en direct",
    "get-live-caption":"Obtenir des sous-titres en direct",
    "get-live-caption-stop":"Arrêter le streaming",
    "live-caption-empty":"La transcription s'affichera ici",
    "hotmail":"PS je t'aime. Obtenez votre transcription gratuite de l'événement en direct sur ",
    "name":"Français"
  },
  'de': {
    "caption-header":"Live-Untertitel für Ereignisse",
    "get-live-caption":"Live-Untertitel abrufen",
    "get-live-caption-stop":"Streaming beenden",
    "live-caption-empty":"Transkript wird hier angezeigt",
    "hotmail":"PS: Ich liebe dich. Holen Sie sich Ihre kostenlose Live-Event-Transkription unter ",
    "name":"Deutsche"
  },
  'my': {
    "caption-header": "စာတန်းထိုး & ဘာသာပြန်",
    "get-live-caption": "တိုက်ရိုက်စာတန်းထိုးရယူပါ",
    "get-live-caption-stop": "စတင်ထုတ်လွှင့်မှုကို ရပ်ပါ",
    "live-caption-empty": "စာသားပြန်ဆိုမှုသည် ဤနေရာတွင် ပြသမည်",
    "hotmail": "PS: မင်းကို ချစ်တယ်။ အခမဲ့ အခမ်းအနားစာတန်းထိုးနှင့် ဘာသာပြန်ရယူပါ",
    "name": "မြန်မာ"
  },
  'zh': {
    "caption-header": "字幕与翻译",
    "get-live-caption": "获取实时字幕",
    "get-live-caption-stop": "停止直播",
    "live-caption-empty": "转录内容将在此显示",
    "hotmail": "PS: 我爱你。免费获取活动字幕和翻译",
    "name": "简体中文"
  },
  'id': {
    "caption-header": "Teks & Terjemahan",
    "get-live-caption": "Dapatkan Teks Langsung",
    "get-live-caption-stop": "Hentikan Streaming",
    "live-caption-empty": "Transkripsi akan ditampilkan di sini",
    "hotmail": "PS: Aku mencintaimu. Dapatkan subtitle & terjemahan acara gratis",
    "name": "Bahasa"
  },
  'th': {
    "caption-header": "คำบรรยาย & การแปล",
    "get-live-caption": "รับคำบรรยายสด",
    "get-live-caption-stop": "หยุดการสตรีม",
    "live-caption-empty": "ข้อความที่ถอดความจะแสดงที่นี่",
    "hotmail": "PS: ฉันรักคุณ รับคำบรรยายและการแปลเหตุการณ์ฟรี",
    "name": "ไทย"
  },  
  'ar': {
    "caption-header":"التسمية التوضيحية المباشرة للحدث",
    "get-live-caption":"احصل على تسميات توضيحية مباشرة",
    "get-live-caption-stop":"إيقاف البث",
    "live-caption-empty":"سيتم عرض النص هنا",
    "hotmail":"ملاحظة: أنا أحبك. احصل على نسخة مجانية من الحدث المباشر على ",
    "name":"العربية"
  },
  'es': {
    "caption-header":"Subtítulos en vivo de eventos",
    "get-live-caption":"Obtener subtítulos en vivo",
    "get-live-caption-stop":"Dejar de transmitir",
    "live-caption-empty":"La transcripción se mostrará aquí.",
    "hotmail":"PD Te amo. Obtenga su transcripción gratuita de eventos en vivo",
    "name":"Español"
  },
  'bn': {
    "caption-header":"ক্যাপশন ও অনুবাদ",
    "get-live-caption":"লাইভ ক্যাপশন পান",
    "get-live-caption-stop":"স্ট্রিমিং বন্ধ করুন",
    "english-language":"ইংরেজি",
    "french-language":"ফরাসি",
    "live-caption-empty":"ট্রান্সক্রিপশন এখানে প্রদর্শিত হবে",
    "hotmail":"পিএস: আমি তোমাকে ভালোবাসি। বিনামূল্যে ইভেন্ট সাবটাইটেল এবং অনুবাদ পান",
    "name":"বাংলা"
  },  
  'pt': {	"caption-header":"Legendas ao vivo de eventos",	"get-live-caption":"Obtenha legendas ao vivo",	"get-live-caption-stop":"Pare de transmitir",	"live-caption-empty":"A transcrição será exibida aqui",	"hotmail":"PS Eu Te Amo. Obtenha sua transcrição gratuita de evento ao vivo",	"name":"Português"	},
  'ar': {	"caption-header":"حدث التسميات التوضيحية الحية",	"get-live-caption":"احصل على التسميات التوضيحية المباشرة",	"get-live-caption-stop":"توقف عن البث",	"live-caption-empty":"سيتم عرض النسخ هنا",	"hotmail":"ملاحظة: أنا أحبك. احصل على النسخ المجاني للحدث المباشر",	"name":"عربي"	},
  'ru': {	"caption-header":"Прямые субтитры к событиям",	"get-live-caption":"Получить живые субтитры",	"get-live-caption-stop":"Остановить трансляцию",	"live-caption-empty":"Транскрипция будет отображаться здесь",	"hotmail":"PS я тебя люблю. Получите бесплатную транскрипцию живого мероприятия",	"name":"Русский"	},
  'de': {	"caption-header":"Live-Untertitel der Veranstaltung",	"get-live-caption":"Erhalten Sie Live-Untertitel",	"get-live-caption-stop":"Stoppen Sie das Streaming",	"live-caption-empty":"Die Transkription wird hier angezeigt",	"hotmail":"PS Ich liebe Dich. Holen Sie sich Ihre kostenlose Live-Event-Transkription",	"name":"Deutsch"	},
  'uk': {	"caption-header":"Живі субтитри подій",	"get-live-caption":"Отримайте живі субтитри",	"get-live-caption-stop":"Зупинити трансляцію",	"live-caption-empty":"Тут відображатиметься транскрипція",	"hotmail":"PS: я тебе люблю. Отримайте безкоштовну транскрипцію прямого ефіру",	"name":"українська"	},
  'hi': {	"caption-header":"इवेंट लाइव कैप्शनिंग",	"get-live-caption":"लाइव कैप्शन प्राप्त करें",	"get-live-caption-stop":"स्ट्रीमिंग बंद करो",	"live-caption-empty":"प्रतिलेखन यहां प्रदर्शित होगा",	"hotmail":"पीएस मैं तुमसे प्यार करता हूँ। अपना निःशुल्क लाइव-इवेंट ट्रांसक्रिप्शन प्राप्त करें",	"name":"हिंदी"	},
  'ur': {	"caption-header":"ایونٹ لائیو کیپشننگ",	"get-live-caption":"لائیو کیپشن حاصل کریں۔",	"get-live-caption-stop":"سلسلہ بندی بند کریں۔",	"live-caption-empty":"نقل یہاں ظاہر ہوگی۔",	"hotmail":"PS: میں تم سے پیار کرتا ہوں۔ اپنے لائیو ایونٹ کی مفت نقل حاصل کریں۔",	"name":"اردو"	},
  'yo': {	"caption-header":"Ifiweranṣẹ Live Iṣẹlẹ",	"get-live-caption":"Gba Awọn akọle Live",	"get-live-caption-stop":"Duro ṣiṣanwọle",	"live-caption-empty":"Transcription yoo han nibi",	"hotmail":"PS: Mo nifẹ rẹ. Gba transcription-iṣẹlẹ laaye ọfẹ rẹ",	"name":"Yoruba"	},
  'it': {	"caption-header":"Sottotitoli in tempo reale per eventi",	"get-live-caption":"Ottieni sottotitoli in tempo reale",	"get-live-caption-stop":"Interrompi lo streaming",	"live-caption-empty":"La trascrizione verrà visualizzata qui",	"hotmail":"PS Ti amo. Ottieni la trascrizione gratuita degli eventi dal vivo",	"name":"Italiano"	},
  'ja': {	"caption-header":"イベントのライブキャプション",	"get-live-caption":"ライブキャプションを取得する",	"get-live-caption-stop":"ストリーミングを停止する",	"live-caption-empty":"ここに文字起こしが表示されます",	"hotmail":"PS: 愛しています。無料のライブイベントの文字起こしを入手",	"name":"日本語"	},
  'sw': {	"caption-header":"Manukuu ya Tukio Papo Hapo",	"get-live-caption":"Pata Manukuu Papo Hapo",	"get-live-caption-stop":"Acha Kutiririsha",	"live-caption-empty":"Unukuzi utaonyeshwa hapa",	"hotmail":"PS: Ninakupenda. Pata manukuu yako ya tukio la moja kwa moja bila malipo",	"name":"kiswahili"	},
  'pl': {	"caption-header":"Napisy na żywo z wydarzenia",	"get-live-caption":"Uzyskaj napisy na żywo",	"get-live-caption-stop":"Zatrzymaj transmisję strumieniową",	"live-caption-empty":"Tutaj wyświetli się transkrypcja",	"hotmail":"PS Kocham Cię. Uzyskaj bezpłatną transkrypcję wydarzenia na żywo",	"name":"Polski"	},
  'vi': {	"caption-header":"Chú thích trực tiếp sự kiện",	"get-live-caption":"Nhận phụ đề trực tiếp",	"get-live-caption-stop":"Dừng phát trực tuyến",	"live-caption-empty":"Phiên âm sẽ hiển thị ở đây",	"hotmail":"Tái bút: Anh yêu em. Nhận bản ghi sự kiện trực tiếp miễn phí của bạn",	"name":"Tiếng Việt"	},
  'ro': {	"caption-header":"Subtitrare în direct la eveniment",	"get-live-caption":"Obțineți subtitrări live",	"get-live-caption-stop":"Opriți redarea în flux",	"live-caption-empty":"Transcrierea se va afișa aici",	"hotmail":"PS Te iubesc. Obțineți transcrierea gratuită a evenimentului live",	"name":"Română"	},
  'zh-hant': {	"caption-header":"事件即時字幕",	"get-live-caption":"取得即時字幕",	"get-live-caption-stop":"停止串流",	"live-caption-empty":"轉錄將顯示在這裡",	"hotmail":"附註：我愛你。獲取免費的現場活動轉錄",	"name":"中國傳統的"	},
  'hr': {	"caption-header":"Titliranje događaja uživo",	"get-live-caption":"Nabavite titlove uživo",	"get-live-caption-stop":"Zaustavi strujanje",	"live-caption-empty":"Ovdje će se prikazati transkripcija",	"hotmail":"PS Volim te. Dobijte besplatnu transkripciju događaja uživo",	"name":"Hrvatski"	},
  'fa': {	"caption-header":"زیرنویس زنده رویداد",	"get-live-caption":"زیرنویس‌های زنده دریافت کنید",	"get-live-caption-stop":"توقف جریان",	"live-caption-empty":"رونویسی در اینجا نمایش داده می شود",	"hotmail":"در ضمن من عاشقتم. رونویسی رایگان رویداد زنده خود را دریافت کنید",	"name":"فارسی"	},
  'nl': {	"caption-header":"Live ondertiteling van evenementen",	"get-live-caption":"Ontvang live ondertiteling",	"get-live-caption-stop":"Stop met streamen",	"live-caption-empty":"De transcriptie wordt hier weergegeven",	"hotmail":"PS ik hou van je. Ontvang uw gratis transcriptie van live-evenementen",	"name":"Nederlands"	},
  'ko': {	"caption-header":"이벤트 라이브 캡션",	"get-live-caption":"실시간 자막 받기",	"get-live-caption-stop":"스트리밍 중지",	"live-caption-empty":"여기에 스크립트가 표시됩니다.",	"hotmail":"PS: 사랑해요. 무료 라이브 이벤트 전사를 받아보세요",	"name":"한국인"	},
  'sv': {	"caption-header":"Livetextning för evenemang",	"get-live-caption":"Få livetextning",	"get-live-caption-stop":"Sluta streama",	"live-caption-empty":"Transkription visas här",	"hotmail":"PS Jag älskar dig. Få din gratis transkription av live-evenemang",	"name":"svenska"	},
  'hu': {	"caption-header":"Esemény élő feliratozás",	"get-live-caption":"Szerezzen élő feliratokat",	"get-live-caption-stop":"Streaming leállítása",	"live-caption-empty":"Az átírás itt fog megjelenni",	"hotmail":"Utóirat: Szeretlek. Szerezze meg ingyenes élő esemény átiratát",	"name":"Magyar"	},
  'sq': {	"caption-header":"Titrat e drejtpërdrejtë të ngjarjes",	"get-live-caption":"Merr titrat e drejtpërdrejtë",	"get-live-caption-stop":"Ndalo transmetimin",	"live-caption-empty":"Transkriptimi do të shfaqet këtu",	"hotmail":"Ps Të Dua. Merr transkriptimin falas të ngjarjeve të drejtpërdrejta",	"name":"shqiptare"	},          
  "tr": { "caption-header": "Altyazılar ve Çeviriler", "get-live-caption": "Canlı Altyazıyı Başlat", "get-live-caption-stop": "Canlıyı Durdur", "live-caption-empty": "Transkripsiyon burada görünecek", "hotmail": "Not: Seni seviyorum. Etkinlik için ücretsiz altyazı ve çeviri alın", "name": "Türkçe"},   
  "az": { "caption-header": "Alt yazılar və Tərcümələr", "get-live-caption": "Canlı Alt Yazını Başlat", "get-live-caption-stop": "Canlıyı Dayandır", "live-caption-empty": "Transkripsiya burada göstəriləcək", "hotmail": "Qeyd: Səni sevirəm. Tədbir üçün pulsuz alt yazı və tərcümələr əldə edin", "name": "Azərbaycan"},
};