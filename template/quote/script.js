const params = new URLSearchParams(window.location.search);

const text = params.get("text");
const timeParam = params.get("time");

const message = document.getElementById("message");
const timeEl = document.getElementById("time");

/* =====================
RENDER TEXT + EMOJI
===================== */

function renderEmoji(inputText) {
  if (typeof twemoji !== "undefined") {
    return twemoji.parse(inputText, {
      folder: "svg",
      ext: ".svg",
    });
  }
  return inputText;
}

/* =====================
TEXT RENDER
===================== */

if (text) {
  const decoded = decodeURIComponent(text);
  message.innerHTML = renderEmoji(decoded);
} else {
  message.innerText = "(teks isi sendiri)";
}

/* =====================
TIME LOGIC (WA STYLE)
===================== */

function getCurrentTime() {
  const now = new Date();

  // pakai timezone user (bukan server)
  let hours = now.getHours();
  let minutes = now.getMinutes();

  minutes = minutes < 10 ? "0" + minutes : minutes;

  return hours + ":" + minutes;
}

if (timeParam) {
  // kalau waktu dikirim dari bot (.q)
  timeEl.innerText = decodeURIComponent(timeParam);
} else {
  // fallback
  timeEl.innerText = getCurrentTime();
}
