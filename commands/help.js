// commands/help.js

async function execute(sock, message, args) {
  try {
    const from = message.key.remoteJid;

    const helpText = `╭──────────────────────╮
│    * PANDUAN / MENU *     │
╰──────────────────────╯

📋 INFO
  • .ping  – Cek bot
  • .me    – Profilmu
────────────────────────

🎨 STIKER
  • .kal [teks]  – Teks ke stiker
  • .s           – Gambar ke stiker
  • .s [teks]    – Gambar + teks
  • .stiker      – Alias .s
  • .toimg       – Stiker ke gambar 
────────────────────────

💬 QUOTE & LAINNYA
  • .q [teks]    – Quote WA style dark mode
  • .q (reply gambar) – Quote di gambar
  • .sb [teks]   – Stiker bubble chat
────────────────────────

⚡ BATASAN
  • Max 7MB
  • Format JPG/PNG
────────────────────────

ifaR🤖bot • by Rafii`;

    await sock.sendMessage(from, { text: helpText }, { quoted: message });
    console.log(`✅ .menu untuk ${message.pushName || from.split("@")[0]}`);
  } catch (error) {
    console.log("❌ Error di .help:", error.message);
    const from = message.key.remoteJid;
    await sock.sendMessage(from, { text: "❌ Gagal menampilkan bantuan" }, { quoted: message });
  }
}

module.exports = {
  name: "menu",
  description: "Menampilkan daftar perintah",
  execute,
};
