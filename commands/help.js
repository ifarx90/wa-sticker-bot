async function execute(sock, message, args) {
  try {
    const from = message.key.remoteJid;

    const helpText = `╭──────────────────────╮
│    * PANDUAN / MENU *     │
╰──────────────────────╯

📋 INFO
  • .ping  – Cek bot
  • .me    – Liat Profilmu
────────────────────────

🎨 STIKER
  • .kal [teks]  – Teks ke stiker
  • .s           – Gambar ke stiker
  • .s [teks]    – Gambar + teks
  • .sticker     – Alias .s

  💡 TIPS EMOJI
  • Tanpa spasi → 1 baris (font bisa kecil)
    Contoh: .kal halo😀
  
  • Pakai spasi → terpisah baris (font normal)
    Contoh: .kal halo 😀
────────────────────────

⚡ BATASAN
  • Max 7MB
  • Format JPG/PNG
────────────────────────

ifaR🤖bot by Rafii`;

    await sock.sendMessage(from, { text: helpText });
    console.log(`✅ .help untuk ${message.pushName || from.split("@")[0]}`);
  } catch (error) {
    console.log("❌ Error di .help:", error.message);
    const from = message.key.remoteJid;
    await sock.sendMessage(from, { text: "❌ Gagal menampilkan bantuan" });
  }
}

module.exports = {
  name: "menu",
  description: "Menampilkan daftar perintah",
  execute,
};
