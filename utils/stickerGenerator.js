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

  const metrics = ctx.measureText("M");
  const ascent = metrics.actualBoundingBoxAscent;
  const descent = metrics.actualBoundingBoxDescent;
  const textHeight = ascent + descent;

  for (const { segment } of segments) {
    if (isEmoji(segment)) {
      const img = await getEmojiImage(segment);
      if (img) {
        const emojiSize = textHeight;
        const emojiY = y - ascent;
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
    const baseHeight = 1024;
    const defaultPadding = 30;

    const canvas = createCanvas(width, baseHeight);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, baseHeight);

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
      const textAreaWidth = width - (defaultPadding * 2);
      const maxHeight = baseHeight * 0.9;

      while (fontSize > 20) {

        ctx.font = `normal ${fontSize}px ${fontFamily}`;

        const singleWidth = ctx.measureText(raw).width;
        const singleHeight = fontSize * 1.2;

        if (singleWidth <= textAreaWidth && singleHeight <= maxHeight) {
          break;
        }

        fontSize -= 5;
      }

      ctx.font = `normal ${fontSize}px ${fontFamily}`;

      const metrics = ctx.measureText("M");
      const ascent = metrics.actualBoundingBoxAscent;

      const startY = ascent + 40;

      await drawLineWithEmoji(ctx, raw, defaultPadding, startY, fontSize);

    } else if (wordCount <= 4) {

      // ===============================
      // ===== ≤ 4 KATA ===============
      // ===============================

      lines = words;
      const textAreaWidth = width - (defaultPadding * 2);

      let iterasi = 0;
      const maxIterasi = 20;

      do {

        ctx.font = `normal ${fontSize}px ${fontFamily}`;

        let maxWidth = 0;
        lines.forEach((line) => {
          const m = ctx.measureText(line);
          if (m.width > maxWidth) maxWidth = m.width;
        });

        const totalHeight = lines.length * fontSize * 1.2;

        if (maxWidth <= textAreaWidth && totalHeight <= baseHeight * 0.9) {
          break;
        }

        fontSize -= 5;
        iterasi++;

      } while (fontSize > 20 && iterasi < maxIterasi);

      ctx.font = `normal ${fontSize}px ${fontFamily}`;

      const metrics = ctx.measureText("M");
      const ascent = metrics.actualBoundingBoxAscent;

      const startY = ascent + 40;
      const lineHeight = fontSize * 1.1;

      for (let i = 0; i < lines.length; i++) {
        const y = startY + i * lineHeight;
        await drawLineWithEmoji(ctx, lines[i], defaultPadding, y, fontSize);
      }

    } else {

      // ===============================
      // ===== > 4 KATA (FINAL FIX) ===
      // ===============================

      for (let i = 0; i < words.length; i += 2) {
        if (i + 1 < words.length) {
          lines.push(`${words[i]} ${words[i + 1]}`);
        } else {
          lines.push(words[i]);
        }
      }

      const outerPadding = 20; // 🔥 Sama semua sisi
      const textAreaWidth = width - (outerPadding * 2);

      fontSize = 400;

      let resizeNeeded = true;

      while (resizeNeeded && fontSize > 20) {

        ctx.font = `normal ${fontSize}px ${fontFamily}`;

        let maxWidth = 0;
        lines.forEach((line) => {
          const w = ctx.measureText(line).width;
          if (w > maxWidth) maxWidth = w;
        });

        if (maxWidth > textAreaWidth) {
          fontSize -= 5;
        } else {
          resizeNeeded = false;
        }
      }

      ctx.font = `normal ${fontSize}px ${fontFamily}`;

      const metrics = ctx.measureText("M");
      const ascent = metrics.actualBoundingBoxAscent;
      const descent = metrics.actualBoundingBoxDescent;

      const lineHeight = fontSize * 1.05;
      const totalHeight = lineHeight * lines.length;

      const dynamicHeight = totalHeight + (outerPadding * 2);

      canvas.height = dynamicHeight;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, dynamicHeight);

      ctx.fillStyle = "#000000";
      ctx.font = `normal ${fontSize}px ${fontFamily}`;

      const startY = outerPadding + ascent;

      for (let index = 0; index < lines.length; index++) {

        const line = lines[index];
        const y = startY + index * lineHeight;

        const wordsInLine = line.split(" ");

        if (wordsInLine.length >= 2 && index !== lines.length - 1) {

          let totalWordsWidth = 0;
          wordsInLine.forEach(w => {
            totalWordsWidth += ctx.measureText(w).width;
          });

          const totalSpacing =
            textAreaWidth - totalWordsWidth;

          const spaceBetween =
            totalSpacing / (wordsInLine.length - 1);

          let offsetX = outerPadding;

          for (let i = 0; i < wordsInLine.length; i++) {

            await drawLineWithEmoji(
              ctx,
              wordsInLine[i],
              offsetX,
              y,
              fontSize
            );

            if (i !== wordsInLine.length - 1) {
              offsetX +=
                ctx.measureText(wordsInLine[i]).width +
                spaceBetween;
            }
          }

        } else {

          await drawLineWithEmoji(
            ctx,
            line,
            outerPadding,
            y,
            fontSize
          );

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