$(document).ready(function() {

  loadLang("eng")
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
  //$("#arabic").on("click", function() { translate("arabic"); });
  // Loads the initial quote - without pressing the button
  const unusedVariable = setInterval(recurringFunction, 1000);  
  
callUserViewedAPI("londonmosque");
});


var translations =  {
  eng: "",
  // arabic: "",
  french: ""
};

eng = document.getElementById("eng");
//arabic = document.getElementById("arabic");
french = document.getElementById("french");

var isStreamingCaptions = false; 
function buttonTapped() {
  if (isStreamingCaptions){
    stopTimer() 
  } else{ 
    startTimer();
  }
  isStreamingCaptions = !isStreamingCaptions;
}

function showRightTranscript(){
  if (currentLanguage === "eng"){
    transcript = translations.eng
  } else {
    transcript = translations.french
  }
  $("#live-caption").html(transcript);
}

var localization = ""
function loadLang(lang){
  $.getJSON("https://deafassistant.com/londonmosque/" + lang + ".json", (text) => {
    localization = text
    document.getElementById("caption-header").html(text['caption-header']);
    // if(isStreamingCaptions){
    //   document.getElementById("get-live-caption").html(text['get-live-caption-stop']);
    // }
    // else{
    //   document.getElementById("get-live-caption").html(text['get-live-caption']);
    // }
    document.getElementById("live-caption-empty").html(text['live-caption-empty']);
    document.getElementById("hotmail").html(text['hotmail']);
    document.getElementById("eng").html(text['english-language']);
    document.getElementById("french").html(text['french-language']);
  });
}

var transcript = "";
var isTesting = false; //TODO: Before publishing, Change this to false
var counter = 0; // Only used for debug
function recurringFunction() {
  if (translations.eng == ""){ //if transcript is empty, show/hide the placeholder
    $('#live-caption-empty').show;
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
  $("#get-live-caption").html(localization['get-live-caption-stop']);
  // eng.className = "active";
  //arabic.className = "disabled";
  // french.className = "disabled";
}

function stopTimer() {
  $("#get-live-caption").html("Get Live Captions");
  $("#get-live-caption").html(localization['get-live-caption']);
  //arabic.className = "";
  // french.className = "";
}

function getTranscript() {
  var url="https://script.google.com/macros/s/AKfycbzqOWlC9bT6TtLp1QJLzAkwDZJKTcCZYnoDhN4JIMXTo5lEvtPruYb-3vrILj__yO_A/exec?streamName=londonmosque";
  // To avoid using JQuery, you can use this https://stackoverflow.com/questions/3229823/how-can-i-pass-request-headers-with-jquerys-getjson-method
  $.getJSON(
    url,
    function (a) {
      var json = JSON.stringify(a);
      // console.log(json)
      if (a && a.Transcript && a.Transcript != "") {
        // transcript = a.Transcript;
        translations.eng = a.Transcript; //english
        translations.french = a.Transcript_FR;
        // console.log(translations.eng)
        // console.log(translations.french)

        // translations.arabic = a.Transcript_AR;
        // $("#live-caption").html(transcript);
        if (!a.IsActivelyStreaming){
          buttonTapped(); // Automatically stop streaming if event is not live
        }

      }
    }
  );
}

var currentLanguage = "eng" // "french" is the other choice
function translate(language){
  currentLanguage = language
  loadLang(language)
  // console.log("SaamerE!");
  // console.log("H" + language);
  eng.className = "";
  //arabic.className = "";
  french.className = "";
  document.getElementById(language).className = "active";
  // $("#live-caption").html(translations[language]);
}

  function callUserViewedAPI(streamName) {
  const apiUrl = `https://localhost:5001/api/v1/stream/view-counter`;
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