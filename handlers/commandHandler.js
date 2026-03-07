const config = require("../config/config");
const ping = require("../commands/ping");
const kal = require("../commands/kal");
const sticker = require("../commands/sticker");
const me = require("../commands/me");
const help = require("../commands/help");
const randomDelay = require("../utils/delay");
const toimg = require("../commands/toimg");
const quotes = require("../commands/quotes");
const qb = require("../commands/qb");
const storage = require("../utils/storage");

// ===== MEMORI UNTUK USER BARU =====
let welcomedUsers = storage.loadWelcomed();
const notifiedUsers = new Set(); // (tetap memory dulu)
const processedMessages = new Set(); // Anti double reply

// ===== DAFTAR COMMAND =====
const commands = new Map();
commands.set(ping.name, ping);
commands.set(kal.name, kal);
commands.set(sticker.name, sticker);
commands.set("stiker", sticker);
commands.set(me.name, me);
commands.set(help.name, help);
commands.set("help", help);
commands.set(toimg.name, toimg);
commands.set(quotes.name, quotes);
commands.set(qb.name, qb);

async function handleCommand(sock, message) {
  try {
    if (!message.message || message.key.fromMe) return;

    const from = message.key.remoteJid;

    // ===== ANTI DOUBLE REPLY =====
    const messageId = message.key.id;

    if (processedMessages.has(messageId)) return;
    processedMessages.add(messageId);

    if (processedMessages.size > 100) {
      processedMessages.clear();
    }

    // ===== AMBIL TEKS PESAN =====
    let text = "";
    let messageType = "unknown";

    if (message.message.conversation) {
      text = message.message.conversation;
      messageType = "teks";
    } else if (message.message.extendedTextMessage) {
      text = message.message.extendedTextMessage.text;
      messageType = "teks";
    } else if (message.message.imageMessage) {
      messageType = "gambar";

      if (message.message.imageMessage.caption) {
        text = message.message.imageMessage.caption;
      }
    } else if (message.message.videoMessage) {
      messageType = "video";
    } else if (message.message.stickerMessage) {
      messageType = "stiker";
    } else {
      messageType = "media lain";
    }

    // ===== CEK COMMAND =====
    const isCommand = text.startsWith(config.prefix);

    const isNewUser = !welcomedUsers.has(from);

    // ===== USER BARU =====
    if (isNewUser && !isCommand) {
      welcomedUsers.add(from);
      storage.saveWelcomed(welcomedUsers);

      await sock.sendMessage(
        from,
        {
          text: `╔════════════════════╗
║   👋 SELAMAT DATANG  ║
╚════════════════════╝

💡 Ketik .menu untuk bantuan lengkap

📌 PERINTAH DASAR:
🔹 .kal – Stiker teks
🔹 .s   – Stiker gambar
🔹 .me   – Info profil

💬 CONTOH:
* .kal Jangan lupa bahagia
* .s (reply gambar) 

━━━━━━━━━━━━━━━━
ifaR🤖bot  •  by: Rafii`,
        },
        { quoted: message },
      );

      console.log(`👋 Sambutan untuk user baru: ${from}`);
      return;
    }

    // ===== BUKAN COMMAND =====
    if (!isCommand) {
      await sock.sendMessage(
        from,
        {
          text: `❌ Pesan tidak dikenali

Gunakan .menu untuk melihat daftar perintah.

Contoh:
.kal jangan lupa bahagia brok
.s (reply foto)`,
        },
        { quoted: message },
      );

      console.log(`📢 Pemberitahuan untuk user: ${from} (${messageType})`);
      return;
    }

    // ===== PARSING COMMAND =====
    const fullText = text.slice(config.prefix.length);

    if (fullText.startsWith(" ")) {
      await sock.sendMessage(from, {
        text: `❌ Jangan pake spasi setelah titik!

Contoh yang bener:
.ping
.kal jangan lupa berak kawan
.s (reply gambar)

Ketik .menu untuk bantuan lengkap.`,
      }, { quoted: message });

      console.log(`❌ Command salah: ada spasi setelah prefix dari ${from}`);
      return;
    }

    const parts = fullText.trim().split(" ");
    const commandName = parts.shift().toLowerCase();
    const args = parts;

    // ===== CEK TITIK DOANG =====
    if (!commandName) {
      await sock.sendMessage(from, {
        text: `❌ Cuma titik doang?
ketik .menu untuk lihat daftar perintah yang tersedia.`,
      }, { quoted: message });
      console.log(`❌ Command kosong dari ${from}`);
      return;
    }

    // ===== CARI COMMAND =====
    const command = commands.get(commandName);

    if (!command) {
      await sock.sendMessage(from, {
        text: `❌ Command "${commandName}" tidak dikenal

Ketik .menu untuk melihat daftar perintah yang tersedia.`,
      }, { quoted: message });

      console.log(`❌ Command "${commandName}" tidak dikenal dari ${from}`);
      return;
    }

    if (!sock) return;

    console.log(`\n👉 Command: ${commandName}`);
    console.log(`Dari: ${from}`);

    await randomDelay();

    await command.execute(sock, message, args);
  } catch (error) {
    console.log("❌ Error:", error.message);
  }
}

module.exports = handleCommand;
