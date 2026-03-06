// utils/quoteGenerator.js

const { createCanvas, loadImage } = require('canvas');

async function generateQuoteOnImage(imageBuffer, text) {
  try {
    const image = await loadImage(imageBuffer);
    const canvas = createCanvas(1024, 1024);
    const ctx = canvas.getContext('2d');

    // Crop center
    const scale = Math.max(1024 / image.width, 1024 / image.height);
    const width = image.width * scale;
    const height = image.height * scale;
    const x = (1024 - width) / 2;
    const y = (1024 - height) / 2;

    ctx.drawImage(image, x, y, width, height);

    // Overlay 45%
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(0, 0, 1024, 1024);

    // Teks
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    ctx.font = 'bold 48px "Roboto", sans-serif';
    ctx.fillStyle = '#ffffff';

    const maxWidth = 924;
    const lines = wrapText(ctx, text, maxWidth);
    const lineHeight = 72;
    const totalHeight = lines.length * lineHeight;
    let startY = (1024 - totalHeight) / 2;

    lines.forEach(line => {
      ctx.fillText(line, 512, startY);
      startY += lineHeight;
    });

    return canvas.toBuffer('image/png');

  } catch (error) {
    console.error('❌ Quote generator error:', error);
    throw error;
  }
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const testLine = currentLine + ' ' + words[i];
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width < maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = words[i];
    }
  }
  lines.push(currentLine);
  return lines;
}

module.exports = { generateQuoteOnImage };