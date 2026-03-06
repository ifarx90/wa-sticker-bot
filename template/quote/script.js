const params = new URLSearchParams(window.location.search);

const text = params.get("text");
const time = params.get("time");

const message = document.getElementById("message");
const timeEl = document.getElementById("time");

/* render emoji hanya untuk teks */

function renderEmoji(str) {
  if (typeof twemoji !== "undefined") {
    return twemoji.parse(str, {
      folder: "svg",
      ext: ".svg",
    });
  }

  return str;
}

/* text */

if (text) {
  const decodedText = decodeURIComponent(text);

  message.innerHTML = renderEmoji(decodedText);
} else {
  message.innerText = "(no text)";
}

/* time */

if (time) {
  timeEl.innerText = decodeURIComponent(time);
} else {
  timeEl.innerText = "";
}
