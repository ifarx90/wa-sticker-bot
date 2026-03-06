const params = new URLSearchParams(window.location.search);

const text = params.get("text") || "";
const mode = params.get("mode");

const textEl = document.getElementById("text");

textEl.innerText = text;

/* emoji parsing */

twemoji.parse(document.body);

/* =======================
   TIMESTAMP
======================= */

const now = new Date();

let h = now.getHours();
let m = now.getMinutes();

if (m < 10) m = "0" + m;

document.getElementById("time").innerText = h + ":" + m;

/* =======================
   DYNAMIC BUBBLE ENGINE
======================= */

function adjustBubble() {
  const bubble = document.querySelector(".bubble");
  const txt = textEl.innerText.length;

  if (txt < 20) {
    bubble.style.maxWidth = "260px";
  } else if (txt < 60) {
    bubble.style.maxWidth = "340px";
  } else {
    bubble.style.maxWidth = "420px";
  }
}

adjustBubble();

/* =======================
   MULTILINE OPTIMIZER
======================= */

function optimizeLine() {
  const el = document.querySelector(".text");

  const words = el.innerText.split(" ");

  if (words.length === 1 && words[0].length > 12) {
    el.style.wordBreak = "break-all";
  }
}

optimizeLine();

/* =======================
   STICKER MODE
======================= */

if (mode === "sticker") {
  document.body.style.background = "transparent";
}
