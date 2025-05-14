// ✅ 読み替えマップ（必要に応じて追加）
const conversionMap = {
  "上映": "町栄",
  "町営": "町栄",
  "長栄": "町栄",
  "ちょうえい": "町栄",
  "がっかいか": "学会歌"
};

function applyConversion(text) {
  for (const [from, to] of Object.entries(conversionMap)) {
    const regex = new RegExp(from, 'g');
    text = text.replace(regex, to);
  }
  return text;
}

// ✅ グローバル変数
let recognition;
let recognizing = false;
let startTime = 0;
let finalTranscript = '';

// ✅ DOM取得
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const transcriptArea = document.getElementById('transcript');
const saveBtn = document.getElementById('save-btn');

// ✅ 毎回初期化する認識オブジェクト生成関数
function createRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const r = new SpeechRecognition();
  r.lang = 'ja-JP';
  r.continuous = true;
  r.interimResults = true;
  return r;
}

// ✅ 録音開始
startBtn.onclick = () => {
  finalTranscript = '';
  startTime = Date.now();
  recognizing = true;
  startBtn.disabled = true;
  stopBtn.disabled = false;

  recognition = createRecognition();

  recognition.onresult = event => {
    const elapsed = Date.now() - startTime;
    if (elapsed < 1000) return; // 開始1秒以内の認識はスキップ！

    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += applyConversion(transcript) + '。';
      } else {
        interim += transcript;
      }
    }

    transcriptArea.value = finalTranscript + applyConversion(interim);
  };

  recognition.onend = () => {
    if (recognizing) recognition.start();
  };

  recognition.start();
};

// ✅ 録音停止
stopBtn.onclick = () => {
  recognition.stop();
  recognizing = false;
  startBtn.disabled = false;
  stopBtn.disabled = true;
};

// ✅ 保存（DL）ボタン
saveBtn.onclick = () => {
  const text = transcriptArea.value;
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const filename = `${yyyy}-${mm}-${dd}_議事録.txt`;

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
};
