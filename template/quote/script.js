const params = new URLSearchParams(window.location.search);

const text = params.get("text");

const message = document.getElementById("message");
const timeEl = document.getElementById("time");

/* =========================
   MESSAGE
========================= */

if (text) {
  message.innerText = decodeURIComponent(text);
} else {
  message.innerText = "";
}

/* =========================
   TIME (AUTO)
========================= */

function getCurrentTime() {
  const now = new Date();

  const hour = now.getHours().toString().padStart(2, "0");
  const minute = now.getMinutes().toString().padStart(2, "0");

  return `${hour}:${minute}`;
}

/* set waktu pertama */

timeEl.innerText = getCurrentTime();

/* update setiap menit */

setInterval(() => {
  timeEl.innerText = getCurrentTime();
}, 60000);
