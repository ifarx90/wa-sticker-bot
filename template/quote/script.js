const params = new URLSearchParams(window.location.search);

// ambil parameter
const text = params.get("text") || params.get("q");

const message = document.getElementById("message");

// ========================
// RENDER TEXT + EMOJI
// ========================

function renderEmoji(text) {
  return twemoji.parse(text, {
    folder: "svg",
    ext: ".svg",
  });
}

if (text) {
  const decodedText = decodeURIComponent(text);
  message.innerHTML = renderEmoji(decodedText);
} else {
  message.textContent = "(teks isi sendiri)";
}

// ========================
// TIME (style WhatsApp)
// ========================

const now = new Date();

let h = now.getHours();      // tanpa 0 di depan
let m = now.getMinutes();

if (m < 10) {
  m = "0" + m;               // menit tetap 2 digit
}

document.getElementById("time").textContent = h + ":" + m;