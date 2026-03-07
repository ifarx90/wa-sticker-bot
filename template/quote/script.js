const params = new URLSearchParams(window.location.search);

const text = params.get("text");
const time = params.get("time");

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
   TIME
========================= */

function getCurrentTime() {
  const now = new Date();

  const hour = now.getHours().toString().padStart(2, "0");
  const minute = now.getMinutes().toString().padStart(2, "0");

  return `${hour}:${minute}`;
}

/* set waktu awal */

function setTime() {
  if (time) {
    const decoded = decodeURIComponent(time);

    if (decoded.trim() !== "") {
      timeEl.innerText = decoded;
      return;
    }
  }

  timeEl.innerText = getCurrentTime();
}

setTime();

/* update tiap 1 menit supaya realistis */

setInterval(() => {
  if (!time || decodeURIComponent(time).trim() === "") {
    timeEl.innerText = getCurrentTime();
  }
}, 60000);
