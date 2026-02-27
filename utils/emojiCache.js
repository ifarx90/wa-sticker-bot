const { loadImage } = require("canvas");

const emojiCache = new Map();
const MAX_CACHE = 50;

function emojiToCodePoint(emoji) {
  return Array.from(emoji)
    .map(c => c.codePointAt(0).toString(16))
    .join("-");
}

function isEmoji(str) {
  return /\p{Extended_Pictographic}/u.test(str) || /\p{Emoji}/u.test(str);
}

async function getEmojiImage(emoji) {

  const code = emojiToCodePoint(emoji);

  if (emojiCache.has(code)) {
    return emojiCache.get(code);
  }

  const url = `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/${code}.png`;

  try {

    const img = await loadImage(url);

    if (emojiCache.size >= MAX_CACHE) {
      const firstKey = emojiCache.keys().next().value;
      emojiCache.delete(firstKey);
    }

    emojiCache.set(code, img);
    return img;

  } catch (e) {
    return null;
  }
}

module.exports = {
  isEmoji,
  getEmojiImage
};