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
   TIME REALTIME (WIB)
========================= */

function updateTime() {
  const now = new Date();

  const timeString = now.toLocaleTimeString("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  if (timeEl) {
    timeEl.textContent = timeString;
  }
}

/* jalankan langsung saat halaman load */
updateTime();

/* update setiap detik */
setInterval(updateTime, 1000);
