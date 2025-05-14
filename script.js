const conversionMap = {
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

let recognition;
let recognizing = false;

const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const transcriptArea = document.getElementById('transcript');
const saveBtn = document.getElementById('save-btn');

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'ja-JP';
  recognition.continuous = true;
  recognition.interimResults = true;

  let finalTranscript = '';

  recognition.onresult = event => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += applyConversion(transcript) + '。';
      } else {
        interim += transcript;
      }
    }
    transcriptArea.value = finalTranscript + interim;
  };

  recognition.onend = () => {
    if (recognizing) recognition.start();
  };

  startBtn.onclick = () => {
    finalTranscript = '';
    recognition.start();
    recognizing = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;
  };

  stopBtn.onclick = () => {
    recognition.stop();
    recognizing = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
  };
} else {
  alert("音声認識APIが使えない環境です");
}

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
