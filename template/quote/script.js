const params = new URLSearchParams(window.location.search)

const text = params.get("text")

const message = document.getElementById("message")

if(text){
message.innerText = text
}else{
message.innerText = "(teks isi sendiri)"
}

const now = new Date()

let h = now.getHours()
let m = now.getMinutes()

if(m < 10){
m = "0" + m
}

document.getElementById("time").innerText = h + ":" + m