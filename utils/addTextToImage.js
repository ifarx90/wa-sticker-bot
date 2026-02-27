const { createCanvas, loadImage, registerFont } = require("@napi-rs/canvas");
const fs = require("fs");
const path = require("path");

// Setup font
const fontPath = path.join(__dirname, "../assets/fonts/helvetica.ttf");
let fontFamily = "sans-serif";

if (fs.existsSync(fontPath)) {
  try {
    registerFont(fontPath, { family: "Helvetica" });
  } catch (error) {}
}

/**
 * Memecah teks panjang menjadi beberapa baris
 */
function wrapText(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + " " + word).width;

    if (width < maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

async function addTextToImage(imageBuffer, text) {
  try {
    console.log("✏️ Menambahkan teks meme:", text);

    const image = await loadImage(imageBuffer);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");

    // Gambar ulang gambar asli
    ctx.drawImage(image, 0, 0, image.width, image.height);

    // ===== SETTING TEKS MEME =====
    ctx.fillStyle = "#ffffff"; // Teks putih
    ctx.strokeStyle = "#000000"; // Outline hitam
    ctx.lineWidth = Math.max(4, Math.floor(image.width / 200));
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
 
    // ===== FONT SIZE LEBIH BESAR =====
    let fontSize = Math.min(170, Math.floor(image.width * 0.7));
    ctx.font = `bold ${fontSize}px ${fontFamily}`;

    // ===== AUTO WRAP =====
    const maxTextWidth = image.width * 0.9;
    const lines = wrapText(ctx, text, maxTextWidth);

    // ===== HITUNG POSISI =====
    const lineHeight = fontSize * 1.2;
    const totalHeight = lines.length * lineHeight;

    // Posisi Y (bawah gambar)
    let startY = image.height - 25 - totalHeight;
    if (startY < 20) startY = 20;

    // ===== GAMBAR TEKS (OUTLINE + FILL) =====
    lines.forEach((line, index) => {
      const y = startY + index * lineHeight;

      // Outline hitam dulu
      ctx.strokeText(line, image.width / 2, y);
      // Teks putih di atasnya
      ctx.fillText(line, image.width / 2, y);
    });

    console.log(`✅ Teks meme: ${lines.length} baris`);

    return canvas.toBuffer("image/png");
  } catch (error) {
    console.log("❌ Error nambah teks:", error.message);
    throw error;
  }
}

module.exports = { addTextToImage };
