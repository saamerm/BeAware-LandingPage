// Configuration and Initialization
const response = {
  input: "",
  inputLanguage: "en",
  output1: "",
  outputLanguage: "fr",
  output2: "",
  outputLanguage2: "es",
};

let languageCode = response.inputLanguage; // Initial value
let voiceChoice = window.speechSynthesis.getVoices().find((voice) => voice.lang.slice(0, 2) === languageCode);
let isStreamingCaptions = false;
let isPlayingSpeech = false;
let transcript = "";
let readText = "";
let isTesting = true; // TODO: Change to false before publishing
let counter = 0; // Debug counter

const layover = `
  <div class="inner-div">
    <div id="holder2" class="holder2" style="height: 100px; border: #EEEEEE; border-style: solid;">
      <div id="live-caption-empty2" class="scroller2 scroller-empty">Transcription will display here</div>
      <div class="scroller2"><div id="live-caption2" class="overlay2"></div></div>
    </div>
  </div>
`;

// DOM Ready
$(document).ready(() => {
  isStreamingCaptions = false;
  getValueFromUrlParams();
  checkLanguage();
  try {
    loadLang(response.inputLanguage);
  } catch (error) {
    console.error(error);
  }

  // Event Listeners
  $("#output1").click(() => translate(response.outputLanguage));
  $("#output2").click(() => translate(response.outputLanguage2));
  $("#input").click(() => translate(response.inputLanguage));
  $("#get-live-caption, #live-caption-empty2, #live-caption2").on("click", toggleStreaming);
  $("#mute").on("click", muteButtonTapped);
  $("#unmute").on("click", unmuteButtonTapped);
  $('#mute').hide();

  // Initial Setup
  setInterval(recurringFunction, 1000);
});

// URL Parameter Handling
let forVideoParam = false;
let autoRetrieveParam = false;
let videoTextColorParam = "";
let chromaParam = "";

function getValueFromUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  forVideoParam = urlParams.get('forVideo');
  videoTextColorParam = urlParams.get('videoTextColor');
  autoRetrieveParam = urlParams.get('autoRetrieve');
  chromaParam = urlParams.get('chroma');

  if (forVideoParam) {
    $('#holder, #header').hide();
  } else {
    $('#outer-div').hide();
  }

  if (videoTextColorParam) {
    $("#holder2").css({ color: `#${videoTextColorParam}` });
  }

  if (autoRetrieveParam) {
    toggleStreaming();
  }

  if (chromaParam) {
    document.body.style.backgroundColor = `#${chromaParam}`;
  }

  $("#outer-div").html(layover);
}

// Streaming and Caption Logic
function toggleStreaming() {
  isStreamingCaptions = !isStreamingCaptions;
  if (isStreamingCaptions) {
    startTimer();
  } else {
    stopTimer();
  }
}

function startTimer() {
  $("#get-live-caption").html(languageData[languageCode]['get-live-caption-stop']);
}

function stopTimer() {
  $("#get-live-caption").html(languageData[languageCode]['get-live-caption']);
}

function muteButtonTapped() {
  if (isStreamingCaptions) {
    mute();
  } else {
    alert("Captions are not streaming");
  }
}

function unmuteButtonTapped() {
  if (isStreamingCaptions) {
    iOSSpeakerFix();
    unmute();
  } else {
    alert("Captions are not streaming");
  }
}

function mute() {
  isPlayingSpeech = false;
  $('#unmute').show();
  $('#mute').hide();
}

function unmute() {
  isPlayingSpeech = true;
  $('#mute').show();
  $('#unmute').hide();
}

function iOSSpeakerFix() {
  const utterance = new SpeechSynthesisUtterance("");
  synth.speak(utterance);
}

// Transcript Display Logic
function showRightTranscript() {
  let transcript;
  if (languageCode === response.inputLanguage) {
    transcript = response.input;
  } else if (languageCode === response.outputLanguage) {
    transcript = response.output1;
  } else {
    transcript = response.output2;
  }

  if ($("#live-caption").text() !== transcript) {
    $("#live-caption").html(transcript);
  }
  if ($("#live-caption2").text() !== transcript) {
    $("#live-caption2").html(transcript);
  }
}

// Language Handling
function loadLang(lang) {
  readText = ""; // Reset reading logic
  $("#caption-header").html(languageData[lang]['caption-header']);
  $("#live-caption-empty, #live-caption-empty2").html(languageData[lang]['live-caption-empty']);
  $("#hotmail").html(languageData[lang]['hotmail']);
  $("#input").html(languageData[response.inputLanguage]['name']);

  if (response.outputLanguage) {
    $("#output1").html(languageData[response.outputLanguage]['name']);
  }
  if (response.outputLanguage2) {
    $("#output2").html(languageData[response.outputLanguage2]['name']);
  }

  $("#get-live-caption").html(
    isStreamingCaptions ? languageData[lang]['get-live-caption-stop'] : languageData[lang]['get-live-caption']
  );
}

// Recurring Function for Caption Updates
function recurringFunction() {
  if (response.input === "") {
    $('#live-caption-empty, #live-caption-empty2').show();
  } else {
    $('#live-caption-empty, #live-caption-empty2').hide();
    showRightTranscript();
  }

  if (isStreamingCaptions) {
    isTesting ? getMockTranscript() : getTranscript();
  }
}

// API and Mock Data Handling
function getTranscript() {
  const url = "https://api.deafassistant.com/stream/LiteGetStream?streamName=rosemarie";
  $.getJSON(url, (data) => {
    if (data?.transcript) {
      updateResponse(data);
      readLogic(data.transcript);
      if (!data.isActivelyStreaming) {
        toggleStreaming();
      }
    }
  });
}

function checkLanguage() {
  if (isTesting) {
    checkMockLanguage();
    return;
  }
  const url = "https://api.deafassistant.com/stream/LiteGetStream?streamName=rosemarie";
  $.getJSON(url, (data) => {
    if (data?.transcript) {
      updateResponse(data);
      translate(response.inputLanguage);
      updateLanguageOptions();
    }
  });
}

function updateResponse(data) {
  response.input = data.transcript;
  response.inputLanguage = data.inputLanguage.substring(0, 2);
  response.output1 = data.translation;
  response.outputLanguage = data.outputLanguage.substring(0, 2);
  response.output2 = data.translation2;
  response.outputLanguage2 = data.outputLanguage2.substring(0, 2);
}

function updateLanguageOptions() {
  $("#input").html(languageData[response.inputLanguage]['name']);
  if (response.outputLanguage) {
    $("#output1").html(languageData[response.outputLanguage]['name']);
  }
  if (response.outputLanguage2) {
    $("#output2").html(languageData[response.outputLanguage2]['name']);
  } else {
    $("#output2").hide();
  }
}

// Speech Synthesis Logic
let synth = window.speechSynthesis;
let currentUtterance = null;
let speechQueue = [];

function speakText(newText, langCode) {
  if (!newText.trim() || !synth) {
    console.warn("No text provided or SpeechSynthesis not supported.");
    return;
  }

  speechQueue.push({ text: newText, lang: langCode });
  if (!currentUtterance) {
    processQueue();
  }
}

function processQueue() {
  if (speechQueue.length === 0) return;

  const { text, lang } = speechQueue.shift();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voiceChoice || (() => {
    alert("This language is not available for playback on your device.");
    muteButtonTapped();
    return null;
  })();
  utterance.lang = lang;

  utterance.onend = () => {
    currentUtterance = null;
    processQueue();
  };

  utterance.onerror = (event) => {
    console.error("Speech synthesis error:", event.error);
    currentUtterance = null;
    processQueue();
  };

  if (isStreamingCaptions) {
    synth.speak(utterance);
  }
}

// Utility Functions
function getNumberOfWords(inputString) {
  return inputString.trim() ? inputString.split(/\s+/).length : 0;
}

function removeWords(inputString, numberOfWordsToRemove) {
  if (!inputString.trim()) return "";
  const wordsArray = inputString.split(/\s+/);
  return wordsArray.slice(numberOfWordsToRemove).join(' ');
}

function removeWordsRTL(inputString, numberOfWordsToRemove) {
  if (!inputString.trim()) return "";
  const wordsArray = inputString.split(/\s+/);
  return wordsArray.slice(0, wordsArray.length - numberOfWordsToRemove).join(' ');
}

// Mock Data and Testing
let mockWord = "";

function checkMockLanguage() {
  const data = mockObject3;
  if (data?.transcript) {
    updateResponse(data);
    translate(response.inputLanguage);
    updateLanguageOptions();
  }
}

function getMockTranscript() {
  mockWord += " .سيبدأ الحدث. ";
  $("#live-caption").html(`${transcript} ${counter++} ${mockWord}`);
  const data = mockObject3;
  if (data?.transcript) {
    updateResponse(data);
    readLogic(`${data.transcript} ${mockWord}`);
    if (!data.isActivelyStreaming) {
      toggleStreaming();
    }
  }
}

const mockObject3 = {
  id: 59,
  timestamp: "2025-01-29T04:36:36.4389888",
  roomName: "rosemarie",
  description: "",
  isActivelyStreaming: true,
  transcript: "What happened to this. So, let's see if the translation gets removed from this text, where is the value? Why is this not working? Let's go on and continue. Is this translation showing nothing. Yes, it is not showing anything. What is actually going on here? I have no idea.",
  translation: "حدث التسميات التوضيحية الحية",
  translation2: "",
  inputLanguage: "en-US",
  outputLanguage: "ar",
  outputLanguage2: "",
  isPremiumCustomer: false,
  blockStorage: false,
  uid: null,
};

const languageData = {
  'en': {
    "caption-header":"Captions & Translations",
    "get-live-caption":"Get Live Captions",
    "get-live-caption-stop":"Stop Streaming",
    "english-language":"English",
    "french-language":"Français",
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