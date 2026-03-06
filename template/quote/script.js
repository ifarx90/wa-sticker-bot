const params = new URLSearchParams(window.location.search);

// ambil parameter text atau q
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
// TIME
// ========================

const now = new Date();

let h = now.getHours().toString().padStart(2, "0");
let m = now.getMinutes().toString().padStart(2, "0");

document.getElementById("time").textContent = h + ":" + m;