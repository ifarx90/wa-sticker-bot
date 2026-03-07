const { generateWATemplate } = require("../utils/waTemplateRenderer");
const { imageToSticker } = require("../utils/imageToSticker");
const { startLoading, stopLoading } = require("../utils/loadingReaction");

async function execute(sock, message, args) {
  const from = message.key.remoteJid;

  await startLoading(sock, message);

  try {
    const text = args.join(" ").trim();

    if (!text) {
      await stopLoading(sock, message);

      await sock.sendMessage(from, {
        text: "❌ Masukkan teks.\n\nContoh:\n.qb kata kata hari ini",
      });
      return;
    }

    console.log("📱 Generate WA template (sticker)...");

    const templateImage = await generateWATemplate(text, "sticker");
    const stickerBuffer = await imageToSticker(templateImage);

    await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: message }); 
    console.log("✅ Sticker QB terkirim!");

    await stopLoading(sock, message);
  } catch (err) {
    await stopLoading(sock, message);

    console.log("❌ Error QB:", err);

    await sock.sendMessage(from, {
      text: "❌ Waduh error pas bikin quote sticker bang",
    },{ quoted: message });
  }
}

module.exports = {
  name: "sb",
  description: "Quote blur template",
  execute,
};
