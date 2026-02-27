const { createCanvas } = require('canvas');

function countWords(text) {
    return text.trim().split(/\s+/).length;
}

/**
 * Mode 1: ≤4 kata -> 1 kata per baris
 */
function layoutShortText(text, maxWidth, ctx) {
    const words = text.trim().split(/\s+/);
    let fontSize = 120;
    const lines = words; // 1 kata per baris
    
    return { lines, fontSize };
}

/**
 * Mode 2: >4 kata -> 2 KATA PER BARIS
 * Bukan auto wrap biasa, tapi DIPAKSA 2 KATA PER BARIS
 */
function layoutLongText(text, maxWidth, ctx) {
    const words = text.trim().split(/\s+/);
    let fontSize = 100;
    let lines = [];
    
    // Loop ambil 2 kata setiap baris
    for (let i = 0; i < words.length; i += 2) {
        if (i + 1 < words.length) {
            // Masih ada 2 kata
            lines.push(`${words[i]} ${words[i + 1]}`);
        } else {
            // Sisa 1 kata di akhir
            lines.push(words[i]);
        }
    }
    
    return { lines, fontSize };
}

/**
 * Fungsi utama
 */
function getTextLayout(text, maxWidth, ctx) {
    const wordCount = countWords(text);
    
    console.log(`📊 Jumlah kata: ${wordCount}`);
    
    let result;
    
    if (wordCount <= 4) {
        // Mode 1: 1 kata per baris
        console.log('📝 Mode: SHORT (1 kata/baris)');
        result = layoutShortText(text, maxWidth, ctx);
    } else {
        // Mode 2: >4 kata -> 2 kata per baris
        console.log('📚 Mode: LONG (2 kata/baris)');
        result = layoutLongText(text, maxWidth, ctx);
    }
    
    return {
        lines: result.lines,
        fontSize: result.fontSize,
        mode: wordCount <= 4 ? 'short' : 'long'
    };
}

module.exports = { getTextLayout };