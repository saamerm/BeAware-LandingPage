const languageData = {
  'en': {
    "caption-header":"Event Live Captioning",
    "get-live-caption":"Get Live Captions",
    "get-live-caption-stop":"Stop Streaming",
    "english-language":"English",
    "french-language":"Français",
    "live-caption-empty":"Transcription will display here",
    "hotmail":"PS: I love you. Get your free live-event transcription"
  },
  'fr': {
    "caption-header":"Sous-titrage en direct",
    "get-live-caption":"Obtenir des sous-titres en direct",
    "get-live-caption-stop":"Arrêter le streaming",
    "english-language":"English",
    "french-language":"Français",
    "live-caption-empty":"La transcription s'affichera ici",
    "hotmail":"PS je t'aime. Obtenez votre transcription gratuite de l'événement en direct sur"
  }
};

$(document).ready(function() {

  try {
    loadLang("eng")
  } catch (error) {
    console.error(error);
  }

  $("#french").click(function () {
    // console.log("SaamerD!");
    translate("french");
  });
  $("#eng").click(function () {
    // console.log("SaamerD!");
    translate("eng");
  });

  // Loads quotes as user wishes on clicking the button
  $("#get-live-caption").on("click", buttonTapped);
  $("#mute").on("click", muteButtonTapped);
  $("#unmute").on("click", unmuteButtonTapped);
  $('#mute').hide();

  //$("#arabic").on("click", function() { translate("arabic"); });
  // Loads the initial quote - without pressing the button
  const unusedVariable = setInterval(recurringFunction, 1000);  
  
  callUserViewedAPI("edwfvdbgfref2"); // automatically converted during replace, to the stream name
});


var translations =  {
  eng: "",
  // arabic: "",
  french: ""
};

eng = $("#eng");
//arabic = document.getElementById("arabic");
french = $("#french");

var isStreamingCaptions = false; 
function buttonTapped() {
  if (isStreamingCaptions){
    stopTimer() 
  } else{ 
    startTimer();
  }
  isStreamingCaptions = !isStreamingCaptions;
}

function muteButtonTapped() {
  if (isStreamingCaptions){
    mute();
  } else {
    alert("Captions are not streaming");
  }
}

function unmuteButtonTapped() {
  if (isStreamingCaptions){
    unmute();
  } else {
    alert("Captions are not streaming");
  }
}

var isPlayingSpeech = false
function mute(){
  isPlayingSpeech = false
  $('#unmute').show();
  $('#mute').hide();
}

function unmute(){
  isPlayingSpeech = true
  $('#mute').show();
  $('#unmute').hide();
}

function showRightTranscript(){
  if (currentLanguage === "eng"){
    transcript = translations['eng']
  } else {
    transcript = translations['french']
  }
  if ($("#live-caption").text() !== transcript){
    $("#live-caption").html(transcript);
  }
}

var localization = ""
var languageCode = "en"
function loadLang(lang){
  if (lang == "eng") {
    languageCode = "en"
  } else {
    languageCode = "fr"
  }
  $("#caption-header").html(languageData[languageCode]['caption-header']);
  $("#live-caption-empty").html(languageData[languageCode]['live-caption-empty']);
  $("#hotmail").html(languageData[languageCode]['hotmail']);
  $("#eng").html(languageData[languageCode]['english-language']);
  $("#french").html(languageData[languageCode]['french-language']);
}

var transcript = "";
var isTesting = false; //TODO: Before publishing, Change this to false
var counter = 0; // Only used for debug
function recurringFunction() {
  if (translations['eng'] == ""){ //if transcript is empty, show/hide the placeholder
    $('#live-caption-empty').show();
  }
  else {
    $('#live-caption-empty').hide();
    showRightTranscript()
  }
  if (isStreamingCaptions) {
    if (isTesting) {
      transcript = transcript + transcript;
      $("#live-caption").html(transcript+counter++);
    } else {
      getTranscript();
    }
  }
}

function startTimer() {
  $("#get-live-caption").html("Stop Streaming");
  $("#get-live-caption").html(languageData[languageCode]['get-live-caption-stop'])
}

function stopTimer() {
  $("#get-live-caption").html("Get Live Captions");
  $("#get-live-caption").html(languageData[languageCode]['get-live-caption'])
}

var readText = ""
function getTranscript() {
  var url="https://script.google.com/macros/s/AKfycbzqOWlC9bT6TtLp1QJLzAkwDZJKTcCZYnoDhN4JIMXTo5lEvtPruYb-3vrILj__yO_A/exec?streamName=edwfvdbgfref2";
  // To avoid using JQuery, you can use this https://stackoverflow.com/questions/3229823/how-can-i-pass-request-headers-with-jquerys-getjson-method
  $.getJSON(
    url,
    function (a) {
      var json = JSON.stringify(a);
      // console.log(json)
      if (a && a.Transcript && a.Transcript != "") {
        // transcript = a.Transcript;
        if (languageCode == "en"){
          readLogic(a.Transcript)
        } else {
          readLogic(a.Transcript_FR)
        }    
        translations['eng'] = a.Transcript; //english
        translations['french'] = a.Transcript_FR;

        if (!a.IsActivelyStreaming){
          buttonTapped(); // Automatically stop streaming if event is not live
        }
      }
    }
  );
}

function readLogic(transcript){
  if (readText == ""){
      readText = transcript  
        
  } else {
    var a = getNumberOfWords(transcript)
    var b = getNumberOfWords(translations[currentLanguage])
    console.log(a-b)
    if (a > b){
      readText = removeWords(transcript, b)
      console.log(readText)
      if (isPlayingSpeech){
        console.log("ReadText")
        // if (readText.trim() !== ''){
          speakText(readText, languageCode)
        // }
      }    
    }
  }

  // if (isPlayingSpeech){
  //   if (readText.trim() !== ''){
  //     speakText(readText, languageCode)
  //   }
  // }
}

// Initialize the speech synthesis
const synth = window.speechSynthesis;

// Keep track of the current speech utterance
let currentUtterance = null;
function speakText(newText, langCode) {
  // Clear the previous utterance if it exists
  if (currentUtterance) {
    synth.cancel();
  }

  // Remove the old text from the new text if it exists
  if (currentUtterance && newText.includes(currentUtterance.text)) {
    newText = newText.replace(currentUtterance.text, "");
  }

  // Create a new utterance with the latest text and language code
  const utterance = new SpeechSynthesisUtterance(newText);
  utterance.lang = langCode;

  // Set the new utterance as the current utterance
  currentUtterance = utterance;

  // Event handler to play the next utterance after the current one ends
  utterance.onend = function () {
    // You can perform additional actions after the utterance ends if needed
    console.log("Current utterance ended. Playing the next utterance.");
  };

  // Speak the latest text
  synth.speak(utterance);
}

var currentLanguage = "eng" // "french" is the other choice
function translate(language){
  if (currentLanguage == "eng") {
    languageCode = "en"
  } else {
    languageCode = "fr"
  }

  currentLanguage = language
  loadLang(language)
  // console.log("SaamerE!");
  // console.log("H" + language);
  eng.className = "";
  //arabic.className = "";
  french.className = "";
  $("#"+language).className = "active";
}

function getNumberOfWords(inputString){
  if (inputString.trim() !== '') {
    // Split the string into an array of words
    const wordsArray = inputString.split(/\s+/);

    // Get the number of words
    return wordsArray.length;
  }
}

function removeWords(inputString, numberOfWordsToRemove) {
  // Check if the input string is not empty
  if (inputString && inputString.trim() !== '') {
    const wordsArray = inputString.split(/\s+/);

    // Remove the specified number of words from the beginning
    const newWordsArray = wordsArray.slice(numberOfWordsToRemove);

    // Join the remaining words to form the new string
    const newString = newWordsArray.join(' ');

    // Return the modified string
    return newString;
  } else {
    // Return an empty string if the input is empty
    return '';
  }
};


  function callUserViewedAPI(streamName) {
  const apiUrl = `http://api.deafassistant.com/api/v1/stream/view-counter`;
  const requestData = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(streamName),
  };

  fetch(apiUrl, requestData)
    .then((response) => {
      if (response.ok) {
        // Request was successful (HTTP 200 OK)
        console.log('API call successful');
      } else {
        // Handle errors or non-200 responses here
        console.error('API call failed');
      }
    })
    .catch((error) => {
      // Handle network or other errors here
      console.error('API call failed with an exception:', error);
    });
    
}