const params = new URLSearchParams(window.location.search);

const text = params.get("text");

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
  message.innerHTML = renderEmoji(text);
} else {
  message.innerText = "(teks isi sendiri)";
}

// ========================
// TIME
// ========================

const now = new Date();

let h = now.getHours();
let m = now.getMinutes();

if (m < 10) {
  m = "0" + m;
}

document.getElementById("time").innerText = h + ":" + m;