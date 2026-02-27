const { createCanvas, registerFont } = require("canvas");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const { addMetadata } = require("./addMetadata");
const { isEmoji, getEmojiImage } = require("./emojiCache");

// Setup font
const fontPath = path.join(__dirname, "../assets/fonts/helvetica.ttf");
let fontFamily = "sans-serif";

if (fs.existsSync(fontPath)) {
  try {
    registerFont(fontPath, { family: "Helvetica" });
    fontFamily = "Helvetica";
  } catch (error) {}
}

// 🔥 DRAW LINE SUPPORT EMOJI
async function drawLineWithEmoji(ctx, line, x, y, fontSize) {
  const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
  const segments = segmenter.segment(line);

  let offsetX = x;

  ctx.textBaseline = "alphabetic";

  const metrics = ctx.measureText("M").actualBoundingBoxAscent;
  const descent = ctx.measureText("g").actualBoundingBoxDescent;
  const ascent = metrics; // FIXED
  const textHeight = ascent + descent;

  for (const { segment } of segments) {
    if (isEmoji(segment)) {
      const img = await getEmojiImage(segment);
      if (img) {
        const emojiSize = textHeight * 1.0;

        const emojiY = y - textHeight * 0.8;

        ctx.drawImage(img, offsetX, emojiY, emojiSize, emojiSize);

        offsetX += emojiSize;
      }
    } else {
      ctx.fillText(segment, offsetX, y);
      offsetX += ctx.measureText(segment).width;
    }
  }
}

async function createTextSticker(text) {
  try {

    const width = 1024;
    const height = 1024;
    const paddingX = 30;
    const textAreaWidth = width - (paddingX * 2);

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "#000000";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";

    const words = text.trim().split(/\s+/);
    const wordCount = words.length;

    let lines = [];
    let fontSize = 300;

    // ===============================
    // ===== TANPA SPASI (1 KATA) ====
    // ===============================

    if (wordCount === 1 && !text.includes(" ")) {

      const raw = words[0];
      const maxHeight = height * 0.9;

      while (fontSize > 20) {

        ctx.font = `normal ${fontSize}px ${fontFamily}`;

        const singleWidth = ctx.measureText(raw).width;
        const singleHeight = fontSize * 1.2;

        if (singleWidth <= textAreaWidth && singleHeight <= maxHeight) {
          lines = [raw];
          break;
        }

        const approxLineHeight = fontSize * 1.2;
        const maxLines = Math.floor(maxHeight / approxLineHeight);
        const lineCount = Math.max(1, maxLines);
        const charsPerLine = Math.ceil(raw.length / lineCount);

        lines = [];
        for (let i = 0; i < raw.length; i += charsPerLine) {
          lines.push(raw.slice(i, i + charsPerLine));
        }

        let longestWidth = 0;
        lines.forEach(line => {
          const w = ctx.measureText(line).width;
          if (w > longestWidth) longestWidth = w;
        });

        const totalHeight = lines.length * approxLineHeight;

        if (longestWidth <= textAreaWidth && totalHeight <= maxHeight) {
          break;
        }

        fontSize -= 5;
      }

      ctx.font = `normal ${fontSize}px ${fontFamily}`;

      const safeTop = fontSize * 0.85; // FIX
      const startY = safeTop;

      for (let index = 0; index < lines.length; index++) {

        const line = lines[index];
        const y = startY + index * (fontSize * 1.2);

        await drawLineWithEmoji(ctx, line, paddingX, y, fontSize);
      }

    } else {

      // ===============================
      // ===== LOGIC 4 KATA ============
      // ===============================

      if (wordCount <= 4) {
        lines = words;
      } else {
        for (let i = 0; i < words.length; i += 2) {
          if (i + 1 < words.length) {
            lines.push(`${words[i]} ${words[i + 1]}`);
          } else {
            lines.push(words[i]);
          }
        }
        fontSize = 200;
      }

      let iterasi = 0;
      const maxIterasi = 20;

do {

    ctx.font = `normal ${fontSize}px ${fontFamily}`;

    let maxWidth = 0;
    let needRetry = false;

    lines.forEach((line) => {
        const m = ctx.measureText(line);

        // 🚀 PATCH: jika 1 kata panjang melebihi width, kecilkan fontSize
        if (m.width > textAreaWidth) {
            needRetry = true;
        }

        if (m.width > maxWidth) maxWidth = m.width;
    });

    // kalau terlalu panjang → kecilin font lalu ulangi cek
    if (needRetry) {
        fontSize -= 5;
        continue;
    }

    const totalHeight = lines.length * fontSize * 1.2;

    if (maxWidth <= textAreaWidth && totalHeight <= height * 0.9) {
        break;
    }

    fontSize -= 5;
    iterasi++;

} while (fontSize > 20 && iterasi < maxIterasi);

      ctx.font = `normal ${fontSize}px ${fontFamily}`;

      const safeTop = fontSize * 0.85; // FIX
      const startY = safeTop;

      const targetHeightPercent = 0.85;
      const maxY = height * targetHeightPercent;

  const lineHeight = fontSize * 1.1;

      for (let index = 0; index < lines.length; index++) {

        const line = lines[index];
        const y = startY + index * lineHeight;

        // ===== JUSTIFY 2 KATA =====
        if (line.includes(" ") && line.split(" ").length === 2) {

          const parts = line.split(" ");
          const word1 = parts[0];
          const word2 = parts[1];

          const w1Width = ctx.measureText(word1).width;
          const w2Width = ctx.measureText(word2).width;

          const remainingWidth = textAreaWidth - w1Width - w2Width;
          const spaceWidth = Math.max(20, remainingWidth);

          await drawLineWithEmoji(ctx, word1, paddingX, y, fontSize);
          await drawLineWithEmoji(
            ctx,
            word2,
            paddingX + w1Width + spaceWidth,
            y,
            fontSize
          );

        } else {

          await drawLineWithEmoji(ctx, line, paddingX, y, fontSize);

        }
      }
    }

    const pngBuffer = canvas.toBuffer("image/png");

    const webpBuffer = await sharp(pngBuffer)
      .resize(220, 220, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .blur(1)
      .webp({
        quality: 60,
        lossless: false,
        alphaQuality: 80,
        effort: 6,
      })
      .toBuffer();

    const stickerBuffer = await addMetadata(webpBuffer);

    return stickerBuffer;

  } catch (error) {
    console.log("Error:", error.message);
    throw error;
  }
}

module.exports = { createTextSticker };