export const API_URL = "https://api.deafassistant.com/stream/LiteGetStream?streamName=mcfbanquet";

export const LAYOVER_HTML = `
  <div class="inner-div">
    <div id="holder2" class="holder2" style="height: 100px; border: #fafafa11; border-style: solid;">
      <div id="live-caption-empty2" class="scroller2 scroller-empty">Transcription will display here</div>
      <div class="scroller2"><div id="live-caption2" class="overlay2"></div></div>
    </div>
  </div>
`;

export const DEFAULT_LANGUAGE = "en";

export const languageData = {
    'en': {
        "caption-header": "Captions & Translations",
        "get-live-caption": "Show Captions",
        "get-live-caption-stop": "Stop Streaming",
        "live-caption-empty": "Transcription will display here",
        "hotmail": "PS: I love you. Get free event subtitles & translations",
        "name": "English"
    },
    'fr': {
        "caption-header": "Sous-titrage en direct",
        "get-live-caption": "Obtenir des sous-titres en direct",
        "get-live-caption-stop": "Arrêter le streaming",
        "live-caption-empty": "La transcription s'affichera ici",
        "hotmail": "PS je t'aime. Obtenez votre transcription gratuite de l'événement en direct sur ",
        "name": "Français"
    },
    'de': {
        "caption-header": "Live-Untertitel für Ereignisse",
        "get-live-caption": "Live-Untertitel abrufen",
        "get-live-caption-stop": "Streaming beenden",
        "live-caption-empty": "Transkript wird hier angezeigt",
        "hotmail": "PS: Ich liebe dich. Holen Sie sich Ihre kostenlose Live-Event-Transkription unter ",
        "name": "Deutsche"
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
    'zh-cn': {
        "caption-header": "字幕与翻译",
        "get-live-caption": "显示字幕",
        "get-live-caption-stop": "停止字幕",
        "live-caption-empty": "转录内容将在此显示",
        "hotmail": "PS：我爱你。免费获取活动字幕和翻译",
        "name": "简体中文"
    },
    'zh-tw': {
        "caption-header": "字幕與翻譯",
        "get-live-caption": "顯示字幕",
        "get-live-caption-stop": "停止字幕",
        "live-caption-empty": "轉錄內容將顯示在此",
        "hotmail": "PS：我愛你。免費取得活動字幕與翻譯",
        "name": "繁體中文"
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
        "caption-header": "التسمية التوضيحية المباشرة للحدث",
        "get-live-caption": "احصل على تسميات توضيحية مباشرة",
        "get-live-caption-stop": "إيقاف البث",
        "live-caption-empty": "سيتم عرض النص هنا",
        "hotmail": "ملاحظة: أنا أحبك. احصل على نسخة مجانية من الحدث المباشر على ",
        "name": "العربية"
    },
    'es': {
        "caption-header": "Subtítulos en vivo de eventos",
        "get-live-caption": "Obtener subtítulos en vivo",
        "get-live-caption-stop": "Dejar de transmitir",
        "live-caption-empty": "La transcripción se mostrará aquí.",
        "hotmail": "PD Te amo. Obtenga su transcripción gratuita de eventos en vivo",
        "name": "Español"
    },
    'bn': {
        "caption-header": "ক্যাপশন ও অনুবাদ",
        "get-live-caption": "লাইভ ক্যাপশন পান",
        "get-live-caption-stop": "স্ট্রিমিং বন্ধ করুন",
        "english-language": "ইংরেজি",
        "french-language": "ফরাসি",
        "live-caption-empty": "ট্রান্সক্রিপশন এখানে প্রদর্শিত হবে",
        "hotmail": "পিএস: আমি তোমাকে ভালোবাসি। বিনামূল্যে ইভেন্ট সাবটাইটেল এবং অনুবাদ পান",
        "name": "বাংলা"
    },
    'pt': { "caption-header": "Legendas ao vivo de eventos", "get-live-caption": "Obtenha legendas ao vivo", "get-live-caption-stop": "Pare de transmitir", "live-caption-empty": "A transcrição será exibida aqui", "hotmail": "PS Eu Te Amo. Obtenha sua transcrição gratuita de evento ao vivo", "name": "Português" },
    'pt-br': { "caption-header": "Legendas ao vivo de eventos", "get-live-caption": "Obtenha legendas ao vivo", "get-live-caption-stop": "Pare de transmitir", "live-caption-empty": "A transcrição será exibida aqui", "hotmail": "PS Eu Te Amo. Obtenha sua transcrição gratuita de evento ao vivo", "name": "Português" },
    'ru': { "caption-header": "Прямые субтитры к событиям", "get-live-caption": "Получить живые субтитры", "get-live-caption-stop": "Остановить трансляцию", "live-caption-empty": "Транскрипция будет отображаться здесь", "hotmail": "PS я тебя люблю. Получите бесплатную транскрипцию живого мероприятия", "name": "Русский" },
    'uk': { "caption-header": "Живі субтитри подій", "get-live-caption": "Отримайте живі субтитри", "get-live-caption-stop": "Зупинити трансляцію", "live-caption-empty": "Тут відображатиметься транскрипція", "hotmail": "PS: я тебе люблю. Отримайте безкоштовну транскрипцію прямого ефіру", "name": "українська" },
    'hi': { "caption-header": "इवेंट लाइव कैप्शनिंग", "get-live-caption": "लाइव कैप्शन प्राप्त करें", "get-live-caption-stop": "स्ट्रीमिंग बंद करो", "live-caption-empty": "प्रतिलेखन यहां प्रदर्शित होगा", "hotmail": "पीएस मैं तुमसे प्यार करता हूँ। अपना निःशुल्क लाइव-इवेंट ट्रांसक्रिप्शन प्राप्त करें", "name": "हिंदी" },
    'ur': { "caption-header": "ایونٹ لائیو کیپشننگ", "get-live-caption": "لائیو کیپشن حاصل کریں۔", "get-live-caption-stop": "سلسلہ بندی بند کریں۔", "live-caption-empty": "نقل یہاں ظاہر ہوگی۔", "hotmail": "PS: میں تم سے پیار کرتا ہوں۔ اپنے لائیو ایونٹ کی مفت نقل حاصل کریں۔", "name": "اردو" },
    'yo': { "caption-header": "Ifiweranṣẹ Live Iṣẹlẹ", "get-live-caption": "Gba Awọn akọle Live", "get-live-caption-stop": "Duro ṣiṣanwọle", "live-caption-empty": "Transcription yoo han nibi", "hotmail": "PS: Mo nifẹ rẹ. Gba transcription-iṣẹlẹ laaye ọfẹ rẹ", "name": "Yoruba" },
    'it': { "caption-header": "Sottotitoli in tempo reale per eventi", "get-live-caption": "Ottieni sottotitoli in tempo reale", "get-live-caption-stop": "Interrompi lo streaming", "live-caption-empty": "La trascrizione verrà visualizzata qui", "hotmail": "PS Ti amo. Ottieni la trascrizione gratuita degli eventi dal vivo", "name": "Italiano" },
    'ja': { "caption-header": "イベントのライブキャプション", "get-live-caption": "ライブキャプションを取得する", "get-live-caption-stop": "ストリーミングを停止する", "live-caption-empty": "ここに文字起こしが表示されます", "hotmail": "PS: 愛しています。無料のライブイベントの文字起こしを入手", "name": "日本語" },
    'sw': { "caption-header": "Manukuu ya Tukio Papo Hapo", "get-live-caption": "Pata Manukuu Papo Hapo", "get-live-caption-stop": "Acha Kutiririsha", "live-caption-empty": "Unukuzi utaonyeshwa hapa", "hotmail": "PS: Ninakupenda. Pata manukuu yako ya tukio la moja kwa moja bila malipo", "name": "kiswahili" },
    'pl': { "caption-header": "Napisy na żywo z wydarzenia", "get-live-caption": "Uzyskaj napisy na żywo", "get-live-caption-stop": "Zatrzymaj transmisję strumieniową", "live-caption-empty": "Tutaj wyświetli się transkrypcja", "hotmail": "PS Kocham Cię. Uzyskaj bezpłatną transkrypcję wydarzenia na żywo", "name": "Polski" },
    'vi': { "caption-header": "Chú thích trực tiếp sự kiện", "get-live-caption": "Nhận phụ đề trực tiếp", "get-live-caption-stop": "Dừng phát trực tuyến", "live-caption-empty": "Phiên âm sẽ hiển thị ở đây", "hotmail": "Tái bút: Anh yêu em. Nhận bản ghi sự kiện trực tiếp miễn phí của bạn", "name": "Tiếng Việt" },
    'ro': { "caption-header": "Subtitrare în direct la eveniment", "get-live-caption": "Obțineți subtitrări live", "get-live-caption-stop": "Opriți redarea în flux", "live-caption-empty": "Transcrierea se va afișa aici", "hotmail": "PS Te iubesc. Obțineți transcrierea gratuită a evenimentului live", "name": "Română" },
    'zh-hant': { "caption-header": "事件即時字幕", "get-live-caption": "取得即時字幕", "get-live-caption-stop": "停止串流", "live-caption-empty": "轉錄將顯示在這裡", "hotmail": "附註：我愛你。獲取免費的現場活動轉錄", "name": "中國傳統的" },
    'hr': { "caption-header": "Titliranje događaja uživo", "get-live-caption": "Nabavite titlove uživo", "get-live-caption-stop": "Zaustavi strujanje", "live-caption-empty": "Ovdje će se prikazati transkripcija", "hotmail": "PS Volim te. Dobijte besplatnu transkripciju događaja uživo", "name": "Hrvatski" },
    'fa': { "caption-header": "زیرنویس زنده رویداد", "get-live-caption": "زیرنویس‌های زنده دریافت کنید", "get-live-caption-stop": "توقف جریان", "live-caption-empty": "رونویسی در اینجا نمایش داده می شود", "hotmail": "در ضمن من عاشقتم. رونویسی رایگان رویداد زنده خود را دریافت کنید", "name": "فارسی" },
    'nl': { "caption-header": "Live ondertiteling van evenementen", "get-live-caption": "Ontvang live ondertiteling", "get-live-caption-stop": "Stop met streamen", "live-caption-empty": "De transcriptie wordt hier weergegeven", "hotmail": "PS ik hou van je. Ontvang uw gratis transcriptie van live-evenementen", "name": "Nederlands" },
    'ko': { "caption-header": "이벤트 라이브 캡션", "get-live-caption": "실시간 자막 받기", "get-live-caption-stop": "스트리밍 중지", "live-caption-empty": "여기에 스크립트가 표시됩니다.", "hotmail": "PS: 사랑해요. 무료 라이브 이벤트 전사를 받아보세요", "name": "한국인" },
    'sv': { "caption-header": "Livetextning för evenemang", "get-live-caption": "Få livetextning", "get-live-caption-stop": "Sluta streama", "live-caption-empty": "Transkription visas här", "hotmail": "PS Jag älskar dig. Få din gratis transkription av live-evenemang", "name": "svenska" },
    'hu': { "caption-header": "Esemény élő feliratozás", "get-live-caption": "Szerezzen élő feliratokat", "get-live-caption-stop": "Streaming leállítása", "live-caption-empty": "Az átírás itt fog megjelenni", "hotmail": "Utóirat: Szeretlek. Szerezze meg ingyenes élő esemény átiratát", "name": "Magyar" },
    'sq': { "caption-header": "Titrat e drejtpërdrejtë të ngjarjes", "get-live-caption": "Merr titrat e drejtpërdrejtë", "get-live-caption-stop": "Ndalo transmetimin", "live-caption-empty": "Transkriptimi do të shfaqet këtu", "hotmail": "Ps Të Dua. Merr transkriptimin falas të ngjarjeve të drejtpërdrejta", "name": "shqiptare" },
    "tr": { "caption-header": "Altyazılar ve Çeviriler", "get-live-caption": "Canlı Altyazıyı Başlat", "get-live-caption-stop": "Canlıyı Durdur", "live-caption-empty": "Transkripsiyon burada görünecek", "hotmail": "Not: Seni seviyorum. Etkinlik için ücretsiz altyazı ve çeviri alın", "name": "Türkçe" },
    "az": { "caption-header": "Alt yazılar və Tərcümələr", "get-live-caption": "Canlı Alt Yazını Başlat", "get-live-caption-stop": "Canlıyı Dayandır", "live-caption-empty": "Transkripsiya burada göstəriləcək", "hotmail": "Qeyd: Səni sevirəm. Tədbir üçün pulsuz alt yazı və tərcümələr əldə edin", "name": "Azərbaycan" },
};

export const mockObject = {
    "timestamp": "2024-12-10T20:56:50.4571326",
    "roomName": "mcfbanquet",
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
};

export const mockObject2 = {
    "id": 59, "timestamp": "2025-01-29T04:36:36.4389888", "roomName": "mcfbanquet", "description": "", "isActivelyStreaming": true,
    "transcript": " What happened to this. So, let's see if the translation gets removed from this text, where is the value? Why is this not working? Let's go on and continue. Is this translation showing nothing. Yes, it is not showing anything. What is actually going on here? I have no idea.",
    "translation": "¿Qué pasó con esto? Entonces, veamos si la traducción se elimina de este texto, ¿dónde está el valor? ¿Por qué esto no funciona? Sigamos adelante y continuemos. ¿Esta traducción no muestra nada? Sí, no está mostrando nada. ¿Qué está pasando aquí? No tengo ni idea.",
    "translation2": "", "inputLanguage": "en-US", "outputLanguage": "es", "outputLanguage2": "", "isPremiumCustomer": false, "blockStorage": false, "uid": null
};

export const mockObject3 = {
    "id": 59, "timestamp": "2025-01-29T04:36:36.4389888", "roomName": "mcfbanquet", "description": "", "isActivelyStreaming": true,
    "transcript": " What happened to this. So, let's see if the translation gets removed from this text, where is the value? Why is this not working? Let's go on and continue. Is this translation showing nothing. Yes, it is not showing anything. What is actually going on here? I have no idea.",
    "translation": "حدث التسميات التوضيحية الحية",
    "translation2": "", "inputLanguage": "en-US", "outputLanguage": "ar", "outputLanguage2": "", "isPremiumCustomer": false, "blockStorage": false, "uid": null
};
