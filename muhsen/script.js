$(document).ready(function() {
  getValueFromUrlParams();

  try {
    loadLang(response['inputLanguage'])
  } catch (error) {
    console.error(error);
  }

  $("#output1").click(function () {
    translate(response['outputLanguage1']);
  });
  $("#input").click(function () {
    translate(response['inputLanguage']);
  });

  // Loads quotes as user wishes on clicking the button
  $("#get-live-caption").on("click", buttonTapped);
  $("#live-caption-empty2").on("click", buttonTapped);
  $("#live-caption2").on("click", buttonTapped);
  $("#mute").on("click", muteButtonTapped);
  $("#unmute").on("click", unmuteButtonTapped);
  $('#mute').hide();

  //$("#arabic").on("click", function() { translate("arabic"); });
  // Loads the initial quote - without pressing the button
  const unusedVariable = setInterval(recurringFunction, 1000);  
  
  // callUserViewedAPI("muhsen"); // automatically converted during replace, to the stream name
  checkLanguage();	
  isStreamingCaptions = false
});

var forVideoParam = false
var autoRetrieveParam = false
var videoTextColorParam = ""

function getValueFromUrlParams() {
  var urlParams = new URLSearchParams(window.location.search);
  forVideoParam = urlParams.get('forVideo');
  videoTextColorParam = urlParams.get('videoTextColor');
  autoRetrieveParam = urlParams.get('autoRetrieve');

  if (forVideoParam){
    $('#holder').hide();
    $('#header').hide();
  } else {
    $('#outer-div').hide();
  }
  if (videoTextColorParam != ""){
    // $("#myParagraph").css({"backgroundColor": "black", "color": "white"});
    $("#holder2").css({ "color": "#" + videoTextColorParam });    
  }
  if (autoRetrieveParam){
    buttonTapped()
  }
}

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
    // If streaming captions and the button is tapped, stop
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
    iOSSpeakerFix();
    unmute();
  } else {
    alert("Captions are not streaming");
  }
}

function iOSSpeakerFix() {
  // Create a new utterance with the latest text and language code
  const utterance = new SpeechSynthesisUtterance("");
  synth.speak(utterance);
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
  if (languageCode === response['inputLanguage']){
    transcript = response['input']
  } else {
    transcript = response['output1']
  }
  // Only update DOM if needed, not with every API call
  if ($("#live-caption").text() !== transcript){
    $("#live-caption").html(transcript);
  }
  if ($("#live-caption2").text() !== transcript){
    $("#live-caption2").html(transcript);
  }
}

var localization = ""
var languageCode = response['inputLanguage'] // Initial value
function loadLang(lang){
  readText = "" // Reset the reading logic
  $("#caption-header").html(languageData[lang]['caption-header']);
  $("#live-caption-empty").html(languageData[lang]['live-caption-empty']);
  $("#live-caption-empty2").html(languageData[lang]['live-caption-empty']); // For video
  $("#hotmail").html(languageData[lang]['hotmail']);
  $("#input").html(languageData[response['inputLanguage']]['name']);
  $("#output1").html(languageData[response['outputLanguage1']]['name']);
  if (isStreamingCaptions){
    $("#get-live-caption").html(languageData[lang]['get-live-caption-stop'])
  } else {
    $("#get-live-caption").html(languageData[lang]['get-live-caption'])
  }
}

var transcript = "";
var isTesting = false; //TODO: Before publishing, Change this to false
var counter = 0; // Only used for debug
function recurringFunction() {
  if (response['input'] == ""){ //if transcript is empty, show/hide the placeholder
    if (forVideoParam){
      $('#live-caption-empty2').show();
    } else {
      $('#live-caption-empty2').show();
    }
  }
  else {
    $('#live-caption-empty').hide();
    $('#live-caption-empty2').hide();
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
  // If the user taps on the Start streaming button, then show the Stop Streaming message
  $("#get-live-caption").html(languageData[languageCode]['get-live-caption-stop'])
}

function stopTimer() {
  // If the user taps on the Stop streaming button, then show the Start Streaming message
  $("#get-live-caption").html(languageData[languageCode]['get-live-caption'])
}

var readText = ""
function getTranscript() {
  $.support.cors = true;           
  var url="https://api.deafassistant.com/stream/LiteGetStream?streamName=muhsen";
  
  // To avoid using JQuery, you can use this https://stackoverflow.com/questions/3229823/how-can-i-pass-request-headers-with-jquerys-getjson-method
  $.getJSON(
    url,
    function (a) {
      var json = JSON.stringify(a);
      // console.log(json)
      if (a && a.transcript && a.transcript != "") {
        response['input'] = a.transcript
        response['inputLanguage'] = a.inputLanguage.substring(0, 2);
        response['output1'] = a.translation
        response['outputLanguage1'] = a.outputLanguage.substring(0, 2);

        // This is for audio enhancement        
        if (languageCode == response['inputLanguage']){
          readLogic(a.transcript)
        } else {
          readLogic(a.translation)
        }    
        
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
  var url="https://api.deafassistant.com/stream/LiteGetStream?streamName=muhsen";
  
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
function readLogic(message){
  // The first time don't read, else it will start reading from the beginning  
  if (readText == ""){
      readText = message          
  } else {
    var a = getNumberOfWords(message)
    var b = getNumberOfWords(readText)
    console.log(a-b)
    // If there are any words that are unread, then read    
    if (a > b){
      readText = removeWords(message, b)
      console.log(readText)
      if (isPlayingSpeech){
        console.log("ReadText")
        speakText(readText, languageCode)
      }    
    }
    readText = message
  }
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

function translate(language){
  languageCode = language
  loadLang(language)
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

const languageData = {
  'en': {
    "caption-header":"Event Live Captioning",
    "get-live-caption":"Get Live Captions",
    "get-live-caption-stop":"Stop Streaming",
    "english-language":"English",
    "french-language":"Français",
    "live-caption-empty":"Transcription will display here",
    "hotmail":"PS: I love you. Get your free live-event transcription",
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
  },
  'es': {
    "caption-header":"Subtítulos en vivo de eventos",
    "get-live-caption":"Obtener subtítulos en vivo",
    "get-live-caption-stop":"Dejar de transmitir",
    "live-caption-empty":"La transcripción se mostrará aquí.",
    "hotmail":"PD Te amo. Obtenga su transcripción gratuita de eventos en vivo",
    "name":"Español"
    },
    'pt': {	"caption-header":"Legendas ao vivo de eventos",	"get-live-caption":"Obtenha legendas ao vivo",	"get-live-caption-stop":"Pare de transmitir",	"live-caption-empty":"A transcrição será exibida aqui",	"hotmail":"PS Eu Te Amo. Obtenha sua transcrição gratuita de evento ao vivo",	"name":"Português"	},
    'ar': {	"caption-header":"حدث التسميات التوضيحية الحية",	"get-live-caption":"احصل على التسميات التوضيحية المباشرة",	"get-live-caption-stop":"توقف عن البث",	"live-caption-empty":"سيتم عرض النسخ هنا",	"hotmail":"ملاحظة: أنا أحبك. احصل على النسخ المجاني للحدث المباشر",	"name":"عربي"	},
    'ru': {	"caption-header":"Прямые субтитры к событиям",	"get-live-caption":"Получить живые субтитры",	"get-live-caption-stop":"Остановить трансляцию",	"live-caption-empty":"Транскрипция будет отображаться здесь",	"hotmail":"PS я тебя люблю. Получите бесплатную транскрипцию живого мероприятия",	"name":"Русский"	},
    'de': {	"caption-header":"Live-Untertitel der Veranstaltung",	"get-live-caption":"Erhalten Sie Live-Untertitel",	"get-live-caption-stop":"Stoppen Sie das Streaming",	"live-caption-empty":"Die Transkription wird hier angezeigt",	"hotmail":"PS Ich liebe Dich. Holen Sie sich Ihre kostenlose Live-Event-Transkription",	"name":"Deutsch"	},
    'uk': {	"caption-header":"Живі субтитри подій",	"get-live-caption":"Отримайте живі субтитри",	"get-live-caption-stop":"Зупинити трансляцію",	"live-caption-empty":"Тут відображатиметься транскрипція",	"hotmail":"PS: я тебе люблю. Отримайте безкоштовну транскрипцію прямого ефіру",	"name":"українська"	},
    'hi': {	"caption-header":"इवेंट लाइव कैप्शनिंग",	"get-live-caption":"लाइव कैप्शन प्राप्त करें",	"get-live-caption-stop":"स्ट्रीमिंग बंद करो",	"live-caption-empty":"प्रतिलेखन यहां प्रदर्शित होगा",	"hotmail":"पीएस मैं तुमसे प्यार करता हूँ। अपना निःशुल्क लाइव-इवेंट ट्रांसक्रिप्शन प्राप्त करें",	"name":"हिंदी"	},
    'ur': {	"caption-header":"ایونٹ لائیو کیپشننگ",	"get-live-caption":"لائیو کیپشن حاصل کریں۔",	"get-live-caption-stop":"سلسلہ بندی بند کریں۔",	"live-caption-empty":"نقل یہاں ظاہر ہوگی۔",	"hotmail":"PS: میں تم سے پیار کرتا ہوں۔ اپنے لائیو ایونٹ کی مفت نقل حاصل کریں۔",	"name":"اردو"	},
    'yo': {	"caption-header":"Ifiweranṣẹ Live Iṣẹlẹ",	"get-live-caption":"Gba Awọn akọle Live",	"get-live-caption-stop":"Duro ṣiṣanwọle",	"live-caption-empty":"Transcription yoo han nibi",	"hotmail":"PS: Mo nifẹ rẹ. Gba transcription-iṣẹlẹ laaye ọfẹ rẹ",	"name":"Yoruba"	},
    'id': {	"caption-header":"Teks Langsung Acara",	"get-live-caption":"Dapatkan Teks Langsung",	"get-live-caption-stop":"Hentikan Streaming",	"live-caption-empty":"Transkripsi akan ditampilkan di sini",	"hotmail":"PS Aku mencintaimu. Dapatkan transkripsi acara langsung gratis Anda",	"name":"Bahasa"	},
    'it': {	"caption-header":"Sottotitoli in tempo reale per eventi",	"get-live-caption":"Ottieni sottotitoli in tempo reale",	"get-live-caption-stop":"Interrompi lo streaming",	"live-caption-empty":"La trascrizione verrà visualizzata qui",	"hotmail":"PS Ti amo. Ottieni la trascrizione gratuita degli eventi dal vivo",	"name":"Italiano"	},
    'ja': {	"caption-header":"イベントのライブキャプション",	"get-live-caption":"ライブキャプションを取得する",	"get-live-caption-stop":"ストリーミングを停止する",	"live-caption-empty":"ここに文字起こしが表示されます",	"hotmail":"PS: 愛しています。無料のライブイベントの文字起こしを入手",	"name":"日本語"	},
    'sw': {	"caption-header":"Manukuu ya Tukio Papo Hapo",	"get-live-caption":"Pata Manukuu Papo Hapo",	"get-live-caption-stop":"Acha Kutiririsha",	"live-caption-empty":"Unukuzi utaonyeshwa hapa",	"hotmail":"PS: Ninakupenda. Pata manukuu yako ya tukio la moja kwa moja bila malipo",	"name":"kiswahili"	},
    'pl': {	"caption-header":"Napisy na żywo z wydarzenia",	"get-live-caption":"Uzyskaj napisy na żywo",	"get-live-caption-stop":"Zatrzymaj transmisję strumieniową",	"live-caption-empty":"Tutaj wyświetli się transkrypcja",	"hotmail":"PS Kocham Cię. Uzyskaj bezpłatną transkrypcję wydarzenia na żywo",	"name":"Polski"	},
    'vi': {	"caption-header":"Chú thích trực tiếp sự kiện",	"get-live-caption":"Nhận phụ đề trực tiếp",	"get-live-caption-stop":"Dừng phát trực tuyến",	"live-caption-empty":"Phiên âm sẽ hiển thị ở đây",	"hotmail":"Tái bút: Anh yêu em. Nhận bản ghi sự kiện trực tiếp miễn phí của bạn",	"name":"Tiếng Việt"	},
    'ro': {	"caption-header":"Subtitrare în direct la eveniment",	"get-live-caption":"Obțineți subtitrări live",	"get-live-caption-stop":"Opriți redarea în flux",	"live-caption-empty":"Transcrierea se va afișa aici",	"hotmail":"PS Te iubesc. Obțineți transcrierea gratuită a evenimentului live",	"name":"Română"	},
    'zh-hant': {	"caption-header":"事件即時字幕",	"get-live-caption":"取得即時字幕",	"get-live-caption-stop":"停止串流",	"live-caption-empty":"轉錄將顯示在這裡",	"hotmail":"附註：我愛你。獲取免費的現場活動轉錄",	"name":"中國傳統的"	},
    'zh': {	"caption-header":"事件实时字幕",	"get-live-caption":"获取实时字幕",	"get-live-caption-stop":"停止串流",	"live-caption-empty":"转录将显示在这里",	"hotmail":"附言：我爱你。获取免费的现场活动转录",	"name":"简体中文"	},
    'hr': {	"caption-header":"Titliranje događaja uživo",	"get-live-caption":"Nabavite titlove uživo",	"get-live-caption-stop":"Zaustavi strujanje",	"live-caption-empty":"Ovdje će se prikazati transkripcija",	"hotmail":"PS Volim te. Dobijte besplatnu transkripciju događaja uživo",	"name":"Hrvatski"	},
    'fa': {	"caption-header":"زیرنویس زنده رویداد",	"get-live-caption":"زیرنویس‌های زنده دریافت کنید",	"get-live-caption-stop":"توقف جریان",	"live-caption-empty":"رونویسی در اینجا نمایش داده می شود",	"hotmail":"در ضمن من عاشقتم. رونویسی رایگان رویداد زنده خود را دریافت کنید",	"name":"فارسی"	},
    'nl': {	"caption-header":"Live ondertiteling van evenementen",	"get-live-caption":"Ontvang live ondertiteling",	"get-live-caption-stop":"Stop met streamen",	"live-caption-empty":"De transcriptie wordt hier weergegeven",	"hotmail":"PS ik hou van je. Ontvang uw gratis transcriptie van live-evenementen",	"name":"Nederlands"	},
    'ko': {	"caption-header":"이벤트 라이브 캡션",	"get-live-caption":"실시간 자막 받기",	"get-live-caption-stop":"스트리밍 중지",	"live-caption-empty":"여기에 스크립트가 표시됩니다.",	"hotmail":"PS: 사랑해요. 무료 라이브 이벤트 전사를 받아보세요",	"name":"한국인"	},
    'sv': {	"caption-header":"Livetextning för evenemang",	"get-live-caption":"Få livetextning",	"get-live-caption-stop":"Sluta streama",	"live-caption-empty":"Transkription visas här",	"hotmail":"PS Jag älskar dig. Få din gratis transkription av live-evenemang",	"name":"svenska"	},
    'hu': {	"caption-header":"Esemény élő feliratozás",	"get-live-caption":"Szerezzen élő feliratokat",	"get-live-caption-stop":"Streaming leállítása",	"live-caption-empty":"Az átírás itt fog megjelenni",	"hotmail":"Utóirat: Szeretlek. Szerezze meg ingyenes élő esemény átiratát",	"name":"Magyar"	},
    'sq': {	"caption-header":"Titrat e drejtpërdrejtë të ngjarjes",	"get-live-caption":"Merr titrat e drejtpërdrejtë",	"get-live-caption-stop":"Ndalo transmetimin",	"live-caption-empty":"Transkriptimi do të shfaqet këtu",	"hotmail":"Ps Të Dua. Merr transkriptimin falas të ngjarjeve të drejtpërdrejta",	"name":"shqiptare"	},          
};