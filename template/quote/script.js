const params = new URLSearchParams(window.location.search)

const textParam = params.get("text")
const timeParam = params.get("time")

const message = document.getElementById("message")
const timeEl = document.getElementById("time")

/* ======================
TEXT
====================== */

if (textParam) {

  try {

    const decoded = decodeURIComponent(textParam)

    message.textContent = decoded

  } catch {

    message.textContent = textParam

  }

} else {

  message.textContent = ""

}

/* ======================
TIME
====================== */

if (timeParam) {

  try {

    const decodedTime = decodeURIComponent(timeParam)

    timeEl.textContent = decodedTime

  } catch {

    timeEl.textContent = timeParam

  }

} else {

  timeEl.textContent = ""

}