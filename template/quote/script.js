const params = new URLSearchParams(window.location.search);

const text = params.get("text");
const timeParam = params.get("time");

const message = document.getElementById("message");
const timeEl = document.getElementById("time");

/* =====================
RENDER TEXT + EMOJI
===================== */

function renderEmoji(text) {
  return twemoji.parse(text, {
    folder: "svg",
    ext: ".svg",
  });
}

if (text) {
  message.innerHTML = renderEmoji(text);
} else {
  message.innerText = "(teks isi sendiri)";
}

/* =====================
TIME LOGIC (WA STYLE)
===================== */

if (timeParam) {
  timeEl.innerText = timeParam;
} else {
  // fallback kalau tidak ada time

  const now = new Date();

  let h = now.getHours();
  let m = now.getMinutes();

  if (m < 10) {
    m = "0" + m;
  }

  timeEl.innerText = h + ":" + m;
}
