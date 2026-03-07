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
   TIME REALTIME
========================= */

function updateTime() {
  const now = new Date();

  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");

  const timeString = `${hour}:${minute}`;

  if (timeEl) {
    timeEl.textContent = timeString;
  }
}

/* jalankan langsung saat halaman load */
updateTime();

/* update setiap detik */
setInterval(updateTime, 1000);