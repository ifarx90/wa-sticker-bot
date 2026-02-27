const webp = require("node-webpmux");

async function addMetadata(webpBuffer, packname = "ifar🤖bot", author = "By : Rafii") {
  try {
    console.log("📦 Inject metadata (buffer mode)...");

    const img = new webp.Image();
    await img.load(webpBuffer);

    const json = {
      "sticker-pack-id": "com.rafi.stickerbot",
      "sticker-pack-name": packname,
      "sticker-pack-publisher": author,
      emojis: [""],
    };

    const jsonBuffer = Buffer.from(JSON.stringify(json), "utf-8");

    const exifAttr = Buffer.from([0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00]);

    const jsonLength = Buffer.alloc(4);
    jsonLength.writeUInt32LE(jsonBuffer.length, 0);

    const exif = Buffer.concat([exifAttr, jsonLength, Buffer.from([0x16, 0x00, 0x00, 0x00]), jsonBuffer]);

    img.exif = exif;

    const finalBuffer = await img.save(null); // NULL = return buffer

    console.log("✅ Metadata berhasil ditambahkan!");
    return finalBuffer;
  } catch (err) {
    console.log("❌ Error injecting metadata:", err);
    throw err;
  }
}

module.exports = { addMetadata };
