const sharp = require("sharp");
const { addMetadata } = require("./addMetadata");

async function imageToSticker(imageBuffer, packname = "ifar🤖bot", author = "By : Rafii") {
  try {
    console.log("📥 Memulai konversi gambar ke stiker...");

    console.log("🛠 Normalisasi gambar...");

    const normalized = await sharp(imageBuffer)
      .png()
      .toBuffer();

    console.log("🛠 Resize & Convert to WEBP (buffer mode)...");

    const webpBuffer = await sharp(normalized)
      .resize(512, 512, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
        position: "center"
      })
      .webp({
        lossless: true,
        quality: 100,
        alphaQuality: 100,
        effort: 6,
        smartSubsample: true
      })
      .toBuffer();

    console.log("✅ WEBP buffer berhasil dibuat");
    console.log("📏 Ukuran buffer:", webpBuffer.length, "bytes");

    console.log("🧬 Menambahkan metadata EXIF...");
    const stickerBuffer = await addMetadata(webpBuffer, packname, author);

    console.log("🎉 Stiker berhasil dibuat!");
    return stickerBuffer;

  } catch (err) {
    console.log("❌ Sticker Convert Error:", err);
    return null;
  }
}

module.exports = { imageToSticker };