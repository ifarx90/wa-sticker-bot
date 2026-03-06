const { connectWhatsApp, setMessageHandler } = require('./connection/whatsapp');
const handleCommand = require('./handlers/commandHandler');

const express = require("express");

console.log('\nBOT STICKER AKTIF\n');

let botSocket = null;

/* =========================
UPDATE SOCKET
========================= */

function updateSocket(newSocket) {
    botSocket = newSocket;
}

/* =========================
MESSAGE HANDLER
========================= */

const onMessage = async ({ messages }) => {
    const message = messages[0];
    if (!botSocket) return;

    await handleCommand(botSocket, message);
};

/* =========================
WHATSAPP BOT START
========================= */

async function startBot() {
    try {
        setMessageHandler(onMessage, updateSocket);
        await connectWhatsApp();
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

/* =========================
WEB SERVER (ANTI SLEEP)
========================= */

const app = express();

app.get("/", (req, res) => {
    res.send("Bot is running");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("🌐 Web server running on port", PORT);
});

/* =========================
START BOT
========================= */

startBot();