const params = new URLSearchParams(window.location.search);

const text = params.get("text");
const time = params.get("time");

const message = document.getElementById("message");
const timeEl = document.getElementById("time");

/* message */

if (text) {
  message.innerText = decodeURIComponent(text);
} else {
  message.innerText = "";
}

/* time */

if (time) {
  const decoded = decodeURIComponent(time);

  /* hanya tampilkan jika format HH:MM */

  if (/^\d{1,2}:\d{2}$/.test(decoded)) {
    timeEl.innerText = decoded;
  } else {
    timeEl.innerText = "";
  }
} else {
  timeEl.innerText = "";
}
