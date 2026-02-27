const config = require("../config/config");
const ping = require("../commands/ping");
const kal = require("../commands/kal");
const sticker = require("../commands/sticker");
const me = require("../commands/me");
const help = require("../commands/help");
const randomDelay = require("../utils/delay");

// ===== MEMORI UNTUK USER BARU =====
const welcomedUsers = new Set(); // Catatan user yang sudah dapat sambutan
const notifiedUsers = new Set(); // Catatan user yang sudah dapat notifikasi .s
const processedMessages = new Set(); // Anti double reply

// ===== DAFTAR COMMAND =====
const commands = new Map();
commands.set(ping.name, ping);
commands.set(kal.name, kal);
commands.set(sticker.name, sticker);
commands.set("stiker", sticker); // ALIAS: .stiker (sama dengan .s)
commands.set(me.name, me);
commands.set(help.name, help);
commands.set("help", help); // ALIAS: .menu

async function handleCommand(sock, message) {
  try {
    // Skip kalo pesan kosong atau dari bot sendiri
    if (!message.message || message.key.fromMe) return;

    const from = message.key.remoteJid; // Nomor pengirim

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

    // ===== CEK APAKAH INI COMMAND =====
    const isCommand = text.startsWith(config.prefix);

    // ===== CEK USER BARU (PERTAMA KALI CHAT) =====
    const isNewUser = !welcomedUsers.has(from);

    // ===== KALO USER BARU DAN BUKAN COMMAND =====
    if (isNewUser && !isCommand) {
      welcomedUsers.add(from); // Tandai user sudah dikasih sambutan

      // Kirim pesan sambutan
      await sock.sendMessage(from, {
        text: `╔════════════════════╗
║  👋 SELAMAT DATANG  ║
╚════════════════════╝

💡 Ketik .menu untuk bantuan lengkap

📌 PERINTAH DASAR:
🔹 .kal – Stiker teks
🔹 .s   – Stiker gambar
🔹 .me  – Info profil

💬 CONTOH:
* .kal Jangan lupa bahagia
* .s (reply gambar) 

━━━━━━━━━━━━━━━━
ifaR🤖bot  •  by: Rafii`,
      });

      console.log(`👋 Sambutan untuk user baru: ${from}`);
      return;
    }

    // ===== BUKAN COMMAND =====
    if (!isCommand) {
      await sock.sendMessage(from, {
        text: `❌ Pesan tidak dikenali

Gunakan .menu untuk melihat daftar perintah.

Contoh:
.kal jangan lupa bahagia brok
.s (reply foto)`,
      });
      console.log(`📢 Pemberitahuan untuk user: ${from} (${messageType})`);
      return;
    }

    // ===== INI COMMAND, LANJUTKAN PARSING =====
    const fullText = text.slice(config.prefix.length);

    // ===== CEK SPASI SETELAH PREFIX =====
    if (fullText.startsWith(" ")) {
      await sock.sendMessage(from, {
        text: `❌ Jangan pake spasi setelah titik!

Contoh yang bener:
.ping
.kal jangan lupa berak kawan
.s (reply gambar)

Ketik .menu untuk bantuan lengkap.`,
      });
      console.log(`❌ Command salah: ada spasi setelah prefix dari ${from}`);
      return;
    }

    const parts = fullText.trim().split(" ");
    const commandName = parts.shift().toLowerCase();
    const args = parts;

    // ===== CEK CUMA TITIK DOANG =====
    if (!commandName) {
      await sock.sendMessage(from, {
        text: `❌ Cuma titik doang?

ketik .menu untuk lihat daftar perintah yang tersedia.`,
      });
      console.log(`❌ Command kosong (cuma titik doang) dari ${from}`);
      return;
    }

    // ===== CARI COMMAND =====
    const command = commands.get(commandName);
    if (!command) {
      await sock.sendMessage(from, {
        text: `❌ Command "${commandName}" tidak dikenal

Ketik .menu untuk melihat daftar perintah yang tersedia.`,
      });
      console.log(`❌ Command "${commandName}" tidak dikenal dari ${from}`);
      return;
    }

    if (!sock) return;

    console.log(`\n👉 Command: ${commandName}`);
    console.log(`Dari: ${from}`);

    // Delay random biar ga terlalu instan
    await randomDelay();

    // ===== EKSEKUSI COMMAND =====
    await command.execute(sock, message, args);
  } catch (error) {
    console.log("❌ Error:", error.message);
  }
}

module.exports = handleCommand;
