const languageData = {
  'en': {
    "caption-header":"Event Live Captioning",
    "get-live-caption":"Get Live Captions",
    "get-live-caption-stop":"Stop Streaming",
    "live-caption-empty":"Transcription will display here",
    "hotmail":"PS: I love you. Get your free live-event transcription at ",
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
  'es': {
    "caption-header":"Subtítulos en vivo de eventos",
    "get-live-caption":"Obtener subtítulos en vivo",
    "get-live-caption-stop":"Detener transmisión",
    "live-caption-empty":"La transcripción se mostrará aquí",
    "hotmail":"PD: Te amo. Obtén tu transcripción gratuita del evento en vivo en ",
    "name":"Español"
  },
  'de': {
    "caption-header":"Live-Untertitel für Ereignisse",
    "get-live-caption":"Live-Untertitel abrufen",
    "get-live-caption-stop":"Streaming beenden",
    "live-caption-empty":"Transkript wird hier angezeigt",
    "hotmail":"PS: Ich liebe dich. Holen Sie sich Ihre kostenlose Live-Event-Transkription unter ",
    "name":"Deutsche"
  },
  'zh': {
    "caption-header":"事件实时字幕",
    "get-live-caption":"获取实时字幕",
    "get-live-caption-stop":"停止直播",
    "live-caption-empty":"转录内容将显示在此处",
    "hotmail":"PS: 我爱你。在这里获取免费的现场活动转录: ",
    "name":"中文"
  },
  'ar': {
    "caption-header":"التسمية التوضيحية المباشرة للحدث",
    "get-live-caption":"احصل على تسميات توضيحية مباشرة",
    "get-live-caption-stop":"إيقاف البث",
    "live-caption-empty":"سيتم عرض النص هنا",
    "hotmail":"ملاحظة: أنا أحبك. احصل على نسخة مجانية من الحدث المباشر على ",
    "name":"العربية"
  }
};

$(document).ready(function() {

  try {
    loadLang(response['inputLanguage'])
  } catch (error) {
    console.error(error);
  }

  $("#output1").click(function () {
    // console.log("SaamerD!");
    translate(response['outputLanguage1']);
  });
  $("#input").click(function () {
    // console.log("SaamerD!");
    translate(response['inputLanguage']);
  });

  // Loads quotes as user wishes on clicking the button
  $("#get-live-caption").on("click", buttonTapped);
  $("#mute").on("click", muteButtonTapped);
  $("#unmute").on("click", unmuteButtonTapped);
  $('#mute').hide();

  //$("#arabic").on("click", function() { translate("arabic"); });
  // Loads the initial quote - without pressing the button
  const unusedVariable = setInterval(recurringFunction, 1000);  
  
  // callUserViewedAPI("124"); // automatically converted during replace, to the stream name
  checkLanguage();
});

// Transcript or translation
var response =  {
  input: "",
  inputLanguage: "en",
  output1: "",
  outputLanguage1: "fr"
};

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
  if (currentLanguage === response['inputLanguage']){
    transcript = response['input']
  } else {
    transcript = response['output1']
  }
  if ($("#live-caption").text() !== transcript){ // Only update DOM if needed, not with every API call
    $("#live-caption").html(transcript);
  }
}

var localization = ""
var languageCode = response['inputLanguage'] // Initial value
function loadLang(lang){
  console.log("lang")
  console.log(lang)
  $("#caption-header").html(languageData[lang]['caption-header']);
  $("#live-caption-empty").html(languageData[lang]['live-caption-empty']);
  $("#hotmail").html(languageData[lang]['hotmail']);
  $("#input").html(languageData[response['inputLanguage']]['name']);
  $("#output1").html(languageData[response['outputLanguage1']]['name']);
  if (isStreamingCaptions){
    $("#get-live-caption").html(languageData[lang]['get-live-caption'])
  } else {
    $("#get-live-caption").html(languageData[lang]['get-live-caption-stop'])
  }
}

var transcript = "";
var isTesting = false; //TODO: Before publishing, Change this to false
var counter = 0; // Only used for debug
function recurringFunction() {
  if (response['input'] == ""){ //if transcript is empty, show/hide the placeholder
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
  // $("#get-live-caption").html("Stop Streaming");
  $("#get-live-caption").html(languageData[languageCode]['get-live-caption-stop'])
}

function stopTimer() {
  // $("#get-live-caption").html("Get Live Captions");
  $("#get-live-caption").html(languageData[languageCode]['get-live-caption'])
}

var readText = ""
function getLanguageOnPageLoad() {
  $.support.cors = true;           
  var url="https://api.deafassistant.com/stream/LiteGetStream?streamName=tdsb";
  
  // To avoid using JQuery, you can use this https://stackoverflow.com/questions/3229823/how-can-i-pass-request-headers-with-jquerys-getjson-method
  $.getJSON(
    url,
    function (a) {
      if (a && a.transcript && a.transcript != "") {
        response['input'] = a.transcript
        response['inputLanguage'] = a.inputLanguage.substring(0, 2);
        response['output1'] = a.translation
        response['outputLanguage1'] = a.outputLanguage.substring(0, 2);
      }
    }
  );
}
function getTranscript() {
  $.support.cors = true;           
  var url="https://api.deafassistant.com/stream/LiteGetStream?streamName=tdsb";
  
  // To avoid using JQuery, you can use this https://stackoverflow.com/questions/3229823/how-can-i-pass-request-headers-with-jquerys-getjson-method
  $.getJSON(
    url,
    function (a) {
      var json = JSON.stringify(a);
      // console.log(json)
      if (a && a.transcript && a.transcript != "") {
        // transcript = a.Transcript;

        // This is for audio enhancement
        if (languageCode == "en"){
          readLogic(a.transcript)
        } else {
          readLogic(a.translation)
        }  

        response['input'] = a.transcript
        response['inputLanguage'] = a.inputLanguage.substring(0, 2);
        response['output1'] = a.translation
        response['outputLanguage1'] = a.outputLanguage.substring(0, 2);

        if (!a.isActivelyStreaming){
          buttonTapped(); // Automatically stop streaming if event is not live
        }
      }
        //Your code
    }
  );
}

function checkLanguage() {
  $.support.cors = true;           
  var url="https://api.deafassistant.com/stream/LiteGetStream?streamName=tdsb";
  
  // To avoid using JQuery, you can use this https://stackoverflow.com/questions/3229823/how-can-i-pass-request-headers-with-jquerys-getjson-method
  $.getJSON(
    url,
    function (a) {
      var json = JSON.stringify(a);
      // console.log(json)
      if (a && a.transcript && a.transcript != "") {
        // transcript = a.Transcript;
        response['inputLanguage'] = a.inputLanguage.substring(0, 2);
        response['outputLanguage1'] = a.outputLanguage.substring(0, 2);
        // Translate the page to the input language
        translate(response['inputLanguage']);
        // Change the language options at the bottom of the page
        $("#input").html(languageData[response['inputLanguage']]['name']);
        $("#output1").html(languageData[response['outputLanguage1']]['name']);      
      }
    }
  );
}

// Audio enhancement
function readLogic(transcript){
  if (readText == ""){
      readText = transcript  
        
  } else {
    var a = getNumberOfWords(transcript)
    // var b = getNumberOfWords(translations[currentLanguage]) //TODO: Fix this
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

var currentLanguage = "en" // "french" is the other choice
function translate(language){
  languageCode = language
  currentLanguage = language
  console.log("language")
  console.log(language)
  loadLang(language)
  // console.log("SaamerE!");
  // console.log("H" + language);
  // $("#input").className = "";
  // $("#output1").className = "";
  // $("#"+language).className = "active";
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