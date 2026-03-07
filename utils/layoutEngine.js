// // utils/layoutEngine.js

// class LayoutEngine {
//   constructor(canvasWidth = 1024, canvasHeight = 1024) {
//     this.width = canvasWidth;
//     this.height = canvasHeight;
//     this.padding = 24;
//     this.bubbleWidth = 640;
//     this.bubbleX = (this.width - this.bubbleWidth) / 2; // 192px
//     this.bubbleY = 100;
    
//     // Warna palette
//     this.colors = {
//       background: '#0B141A',
//       bubble: '#202C33',
//       reactionBar: '#2A3942',
//       reactionBorder: '#374248',
//       text: '#E9EDEF',
//       secondaryText: '#8696A0',
//       menuText: '#D1D7DB',
//       deleteRed: '#F15C6D',
//       divider: '#2A3942'
//     };
//   }

//   /**
//    * Hitung dimensi bubble berdasarkan jumlah baris teks
//    */
//   calculateBubbleDimensions(lineCount) {
//     const fontSize = 24;
//     const lineHeight = 32;
//     const reactionBarHeight = 44;
//     const reactionTopMargin = 16;
//     const textTopPadding = 80;
//     const bottomPadding = 50;
    
//     const textHeight = lineCount * lineHeight;
//     const bubbleHeight = reactionTopMargin + reactionBarHeight + textTopPadding + textHeight + bottomPadding;
    
//     return {
//       x: this.bubbleX,
//       y: this.bubbleY,
//       width: this.bubbleWidth,
//       height: Math.max(bubbleHeight, 360),
//       reactionBarY: this.bubbleY + reactionTopMargin,
//       textY: this.bubbleY + reactionTopMargin + reactionBarHeight + textTopPadding,
//       bottomY: null // akan diisi setelah text render
//     };
//   }

//   /**
//    * Hitung posisi reaction bar dengan centering sempurna
//    */
//   calculateReactionBar(bubble) {
//     const containerWidth = 280;
//     const containerHeight = 44;
//     const containerX = bubble.x + bubble.width - containerWidth - 20;
//     const containerY = bubble.y + 16;
    
//     const emojis = ['👍', '❤️', '😂', '😮', '😢', '🙏'];
//     const emojiSize = 24;
//     const spacing = 8;
    
//     // Hitung total lebar emoji untuk centering
//     const totalEmojiWidth = (emojis.length * emojiSize) + ((emojis.length - 1) * spacing);
//     const emojiStartX = containerX + (containerWidth - totalEmojiWidth) / 2;
//     const emojiY = containerY + containerHeight / 2;
    
//     // Posisi setiap emoji
//     const emojiPositions = [];
//     for (let i = 0; i < emojis.length; i++) {
//       emojiPositions.push({
//         emoji: emojis[i],
//         x: emojiStartX + i * (emojiSize + spacing),
//         y: emojiY
//       });
//     }
    
//     // Posisi icon +
//     const plusX = containerX + containerWidth - 30;
//     const plusY = containerY + containerHeight / 2;
    
//     return {
//       container: { x: containerX, y: containerY, width: containerWidth, height: containerHeight },
//       emojis: emojiPositions,
//       plus: { x: plusX, y: plusY }
//     };
//   }

//   /**
//    * Hitung posisi timestamp
//    */
//   calculateTimestamp(ctx, bubble, timestamp) {
//     ctx.font = '14px "Roboto", sans-serif';
//     const metrics = ctx.measureText(timestamp);
//     return {
//       x: bubble.x + bubble.width - 20 - metrics.width,
//       y: bubble.y + bubble.height - 25
//     };
//   }

//   /**
//    * Hitung posisi menu items
//    */
//   calculateMenu(bubble) {
//     const menuX = 40;
//     const menuY = bubble.y + bubble.height + 30;
//     const itemHeight = 44;
//     const itemWidth = 400;
    
//     const items = [
//       { label: 'Beri Bintang', icon: '☆' },
//       { label: 'Balas', icon: '⬇️', rightIcon: '↪️' },
//       { label: 'Teruskan', icon: '⬆️', rightIcon: '↩️' },
//       { label: 'Salin', icon: '🍴', rightIcon: '📋' },
//       { label: 'Laporkan', icon: '🔄', rightIcon: '⚠️' },
//       { label: 'Hapus', icon: '🗑️', isDelete: true }
//     ];
    
//     const positions = [];
//     items.forEach((item, index) => {
//       positions.push({
//         ...item,
//         x: menuX,
//         y: menuY + index * itemHeight,
//         width: itemWidth,
//         height: itemHeight
//       });
//     });
    
//     return {
//       startY: menuY,
//       itemHeight,
//       items: positions
//     };
//   }
// }

// module.exports = LayoutEngine;