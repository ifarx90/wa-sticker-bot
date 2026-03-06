const params = new URLSearchParams(window.location.search);

const text = params.get("text");
const time = params.get("time");

const message = document.getElementById("message");
const timeEl = document.getElementById("time");

/* =====================
EMOJI RENDER
===================== */

function renderEmoji(str) {
  if (typeof twemoji !== "undefined") {
    return twemoji.parse(str, {
      folder: "svg",
      ext: ".svg"
    });
  }
  return str;
}

/* =====================
TEXT
===================== */

if (text) {
  const decodedText = decodeURIComponent(text);
  message.innerHTML = renderEmoji(decodedText);
} else {
  message.innerText = "(no text)";
}

/* =====================
TIME (AMBIL DARI BOT)
===================== */

if (time) {

  const decodedTime = decodeURIComponent(time);
  timeEl.innerText = decodedTime;

} else {

  // fallback kalau tidak ada time
  const now = new Date();

  let h = now.getHours();
  let m = now.getMinutes();

  if (m < 10) m = "0" + m;

  timeEl.innerText = h + ":" + m;
}