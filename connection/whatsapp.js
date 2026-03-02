const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");
const pino = require("pino");

let messageHandler = null;
let onSocketUpdate = null;

function setMessageHandler(handler, socketUpdater) {
  messageHandler = handler;
  onSocketUpdate = socketUpdater;
}

async function connectWhatsApp() {
  console.log("☑ Bentar, lagi nyambungi ke WhatsApp...\n");

  try {
    // AMBIL VERSI TERBARU DARI BAILEYS
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`📦 Baileys version: ${version.join(".")} (latest: ${isLatest})`);

    const { state, saveCreds } = await useMultiFileAuthState("session");
    const logger = pino({ level: "silent" });

    // BUAT KONEKSI DENGAN VERSI YANG UDAH DICEK
    const sock = makeWASocket({
      auth: state,
      version: version, // PAKE VERSI TERBARU
      printQRInTerminal: false, // UBAH JADI FALSE KARENA UDAH DEPRECATED
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

      // HANDLE QR CODE MANUAL (karena printQRInTerminal:false)
      if (qr) {
        console.log("\n📱 SCAN QR CODE INI:");
        qrcode.generate(qr, { small: true });
        console.log("\n⏳ Menunggu scan...");
      }

      if (connection === "open") {
        console.log("✅ Mantap! Udah nyambung ke WhatsApp!");
        console.log("Sticker Bot siap dipake\n");

        if (messageHandler) {
          sock.ev.off("messages.upsert", messageHandler);
          sock.ev.on("messages.upsert", messageHandler);
        }
        console.log("Event handler dipasang");
      }

      if (connection === "close") {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        console.log(`❌ Koneksi putus. Code: ${statusCode}`);

        // REKONEK KALO BUKAN LOGOUT
        if (statusCode !== DisconnectReason.loggedOut) {
          console.log("🔄 Nyoba lagi dalam 5 detik...");
          setTimeout(() => connectWhatsApp(), 5000);
        } else {
          console.log('🚪 Session expired. Hapus folder "session" dan jalanin ulang.');
        }
      }
    });

    sock.ev.on("creds.update", saveCreds);

    return sock;
  } catch (error) {
    console.log("❌ Fatal error:", error.message);
    console.log("🔄 Nyoba lagi dalam 10 detik...");
    setTimeout(() => connectWhatsApp(), 10000);
  }
}

module.exports = { connectWhatsApp, setMessageHandler };
