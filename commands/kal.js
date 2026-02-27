const { createTextSticker } = require("../utils/stickerGenerator");

async function execute(sock, message, args) {
  try {
    const from = message.key.remoteJid;

    if (args.length === 0) {
      await sock.sendMessage(from, {
        text: "⚠️ teksnya mana kocak?\n" + "Contoh penggunaan:\n" + "• .kal Rafi Ganteng\n" + "• .kal halo😀 (tanpa spasi, 1 baris)\n" + "• .kal halo 😀 (pakai spasi, 2 baris)\n\n" + "💡 Tips: Spasi akan memisahkan baris",
      });
      return;
    }

    const text = args.join(" ");
    const words = text.trim().split(/\s+/);
    const wordCount = words.length;

    console.log(`📝 .kal: "${text}" (${wordCount} kata)`);

    // Bikin stiker
    const stickerBuffer = await createTextSticker(text);

    // CEK UKURAN BUFFER
    console.log(`📦 Ukuran stiker: ${stickerBuffer.length} bytes`);

    // KIRIM STIKER
    await sock.sendMessage(from, {
      sticker: stickerBuffer,
    });

    console.log("✅ Stiker terkirim");
  } catch (error) {
    console.log("❌ Error:", error.message);

    const from = message.key.remoteJid;
    await sock.sendMessage(from, {
      text: "❌ Gagal bikin stiker",
    });
  }
}

module.exports = {
  name: "kal",
  description: "Bikin stiker dari teks",
  execute,
};
