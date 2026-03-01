const { default: makeWASocket, DisconnectReason, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");
const pino = require("pino");
const { useMongoDBAuthState } = require('../lib/mongoAuth'); // Tambahan ini

let messageHandler = null;
let onSocketUpdate = null;

function setMessageHandler(handler, socketUpdater) {
  messageHandler = handler;
  onSocketUpdate = socketUpdater;
}

async function connectWhatsApp() {
  console.log("☑ Bentar, lagi nyambungi ke WhatsApp...\n");
  try {
    const { version, isLatest } = await fetchLatestBaileysVersion();
    
    // GANTI BAGIAN INI: Dari "session" folder ke MongoDB
    const mongoUrl = process.env.MONGODB_URL; 
    const { state, saveCreds } = await useMongoDBAuthState(mongoUrl);

    const logger = pino({ level: "silent" });

    const sock = makeWASocket({
      auth: state,
      version: version,
      printQRInTerminal: false,
      logger: logger,
      browser: ["Sticker Bot", "Chrome", "1.0.0"],
      syncFullHistory: false,
      markOnlineOnConnect: true,
      generateHighQualityLink: true,
      defaultQueryTimeoutMs: 60000,
    });

    if (onSocketUpdate) {
      onSocketUpdate(sock);
    }

    sock.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        console.log("\n📱 SCAN QR CODE INI DI TAB LOGS:");
        qrcode.generate(qr, { small: true });
      }

      if (connection === "open") {
        console.log("✅ Mantap! Udah nyambung ke WhatsApp!");
        if (messageHandler) {
          sock.ev.off("messages.upsert", messageHandler);
          sock.ev.on("messages.upsert", messageHandler);
        }
      }

      if (connection === "close") {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        if (statusCode !== DisconnectReason.loggedOut) {
          setTimeout(() => connectWhatsApp(), 5000);
        }
      }
    });

    sock.ev.on("creds.update", saveCreds);
    return sock;
  } catch (error) {
    console.log("❌ Fatal error:", error.message);
    setTimeout(() => connectWhatsApp(), 10000);
  }
}

module.exports = { connectWhatsApp, setMessageHandler };