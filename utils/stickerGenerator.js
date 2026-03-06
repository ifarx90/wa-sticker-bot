const { createCanvas, registerFont } = require("canvas");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const { addMetadata } = require("./addMetadata");
const { isEmoji, getEmojiImage } = require("./emojiCache");

// Setup font
const fontPath = path.join(__dirname, "../assets/fonts/Arial.ttf");
let fontFamily = "sans-serif";

if (fs.existsSync(fontPath)) {
  try {
    registerFont(fontPath, { family: "Arial" });
    fontFamily = "Arial";
  } catch (error) {}
}

// ===============================
// DRAW TEXT + EMOJI
// ===============================

async function drawLineWithEmoji(ctx, line, x, y) {
  const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
  const segments = segmenter.segment(line);

  let offsetX = x;

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

// ===============================
// WRAP LONG WORD
// ===============================

function wrapLongWord(ctx, word, maxWidth) {

  const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
  const segments = [...segmenter.segment(word)].map(s => s.segment);

  let lines = [];
  let current = "";
  let width = 0;

  const metrics = ctx.measureText("M");
  const charHeight =
    metrics.actualBoundingBoxAscent +
    metrics.actualBoundingBoxDescent;

  for (const char of segments) {

    let charWidth;

    if (isEmoji(char)) {
      charWidth = charHeight;
    } else {
      charWidth = ctx.measureText(char).width;
    }

    if (width + charWidth > maxWidth && current.length > 0) {
      lines.push(current);
      current = char;
      width = charWidth;
    } else {
      current += char;
      width += charWidth;
    }
  }

  if (current) lines.push(current);

  return lines;
}

async function createTextSticker(text) {
  try {

    const width = 1024;
    const baseHeight = 1024;
    const padding = 30;

    const canvas = createCanvas(width, baseHeight);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, baseHeight);

    ctx.fillStyle = "#000000";
    ctx.textAlign = "left";

    const words = text.trim().split(/\s+/);
    const wordCount = words.length;

    let lines = [];
    let fontSize = 300;

    // ===============================
    // 1 WORD
    // ===============================

    if (wordCount === 1 && !text.includes(" ")) {

      const raw = words[0];
      const textAreaWidth = width - padding * 2;

      while (fontSize > 20) {

        ctx.font = `normal ${fontSize}px ${fontFamily}`;

        const wrapped = wrapLongWord(ctx, raw, textAreaWidth);

        const totalHeight = wrapped.length * fontSize * 1.2;

        if (totalHeight <= baseHeight * 0.9) {
          lines = wrapped;
          break;
        }

        fontSize -= 5;
      }

      ctx.font = `normal ${fontSize}px ${fontFamily}`;

      const metrics = ctx.measureText("M");
      const ascent = metrics.actualBoundingBoxAscent;

      const startY = ascent + 40;
      const lineHeight = fontSize * 1.2;

      for (let i = 0; i < lines.length; i++) {

        const y = startY + i * lineHeight;

        await drawLineWithEmoji(
          ctx,
          lines[i],
          padding,
          y
        );
      }

    }

    // ===============================
    // <=4 WORDS
    // ===============================

    else if (wordCount <= 4) {

      lines = words;

      const textAreaWidth = width - padding * 2;

      while (fontSize > 20) {

        ctx.font = `normal ${fontSize}px ${fontFamily}`;

        let maxWidth = 0;

        for (const line of lines) {
          const w = ctx.measureText(line).width;
          if (w > maxWidth) maxWidth = w;
        }

        const totalHeight = lines.length * fontSize * 1.2;

        if (
          maxWidth <= textAreaWidth &&
          totalHeight <= baseHeight * 0.9
        ) break;

        fontSize -= 5;
      }

      ctx.font = `normal ${fontSize}px ${fontFamily}`;

      const metrics = ctx.measureText("M");
      const ascent = metrics.actualBoundingBoxAscent;

      const startY = ascent + 40;
      const lineHeight = fontSize * 1.2;

      for (let i = 0; i < lines.length; i++) {

        const y = startY + i * lineHeight;

        await drawLineWithEmoji(
          ctx,
          lines[i],
          padding,
          y
        );
      }

    }

    // ===============================
    // >4 WORDS
    // ===============================

    else {

      for (let i = 0; i < words.length; i += 2) {

        if (i + 1 < words.length) {
          lines.push(`${words[i]} ${words[i + 1]}`);
        } else {
          lines.push(words[i]);
        }

      }

      const outerPadding = 20;
      const textAreaWidth = width - outerPadding * 2;

      fontSize = 400;

      while (fontSize > 20) {

        ctx.font = `normal ${fontSize}px ${fontFamily}`;

        let maxWidth = 0;

        for (const line of lines) {
          const w = ctx.measureText(line).width;
          if (w > maxWidth) maxWidth = w;
        }

        if (maxWidth <= textAreaWidth) break;

        fontSize -= 5;
      }

      ctx.font = `normal ${fontSize}px ${fontFamily}`;

      const metrics = ctx.measureText("M");
      const ascent = metrics.actualBoundingBoxAscent;

      const lineHeight = fontSize * 1.05;

      const totalHeight = lineHeight * lines.length;

      const dynamicHeight = totalHeight + outerPadding * 2;

      canvas.height = dynamicHeight;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, dynamicHeight);

      ctx.fillStyle = "#000000";
      ctx.font = `normal ${fontSize}px ${fontFamily}`;

      const startY = outerPadding + ascent;

      for (let i = 0; i < lines.length; i++) {

        const y = startY + i * lineHeight;

        await drawLineWithEmoji(
          ctx,
          lines[i],
          outerPadding,
          y
        );

      }

    }

    const pngBuffer = canvas.toBuffer("image/png");

    const webpBuffer = await sharp(pngBuffer)
      .resize(220, 220, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .webp({
        quality: 60,
        effort: 6
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