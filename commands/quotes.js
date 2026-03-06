const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const { generateQuoteOnImage } = require("../utils/quoteGenerator");
const { generateWATemplate } = require("../utils/waTemplateRenderer");
const { imageToSticker } = require("../utils/imageToSticker");
const { startLoading, stopLoading } = require("../utils/loadingReaction");

async function execute(sock, message, args) {

  const from = message.key.remoteJid;

  await startLoading(sock, message);

  try {

    const quoteText = args.join(" ").trim();

    const hasImage = message.message.imageMessage;
    const quoted = message.message.extendedTextMessage?.contextInfo?.quotedMessage;

    if ((hasImage || quoted?.imageMessage) && !quoteText) {

      await stopLoading(sock, message);

      await sock.sendMessage(from, {
        text: "❌ *Kirim teksnya juga untuk dijadikan quotes.*\n\n.q (reply gambar) Jangan menyerah",
      });
      return;
    }

    if (hasImage || quoted?.imageMessage) {

      console.log("📥 Download gambar...");

      const mediaMessage = hasImage ? message.message : quoted;

      const mediaKey = hasImage
        ? message.key
        : {
            remoteJid: from,
            id: message.message.extendedTextMessage.contextInfo.stanzaId,
          };

      const imageBuffer = await downloadMediaMessage(
        { key: mediaKey, message: mediaMessage },
        "buffer",
        {},
        { logger: console }
      );

      console.log("🎨 Generate quote image...");

      const quoteImage = await generateQuoteOnImage(imageBuffer, quoteText);

      const stickerBuffer = await imageToSticker(quoteImage);

      await sock.sendMessage(from, { sticker: stickerBuffer });

      console.log("✅ Quote sticker terkirim!");

      await stopLoading(sock, message);

      return;
    }

    if (quoteText) {

      console.log("📱 Generate WA template (quote)...");

      const templateImage = await generateWATemplate(quoteText, "quote");

      const stickerBuffer = await imageToSticker(templateImage);

      await sock.sendMessage(from, {
        image: templateImage,
        mimetype: "image/png"
      });

      console.log("✅ Template sticker terkirim!");

      await stopLoading(sock, message);

      return;
    }

    await stopLoading(sock, message);

    await sock.sendMessage(from, {
      text: "❌ Format salah. Gunakan:\n.q [teks] - template WA\n.q [teks] (reply gambar) - quote di gambar",
    });

  } catch (error) {

    await stopLoading(sock, message);

    console.error("❌ Error:", error);

    await sock.sendMessage(message.key.remoteJid, {
      text: "❌ Gagal: " + error.message,
    });
  }
}

module.exports = {
  name: "q",
  description: "Buat quote WA style",
  execute,
};