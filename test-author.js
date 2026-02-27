const { addMetadata } = require('./utils/addMetadata');
const fs = require('fs');
const path = require('path');

async function test() {
    try {
        console.log('🧪 Test metadata author...');
        
        // Buat gambar dummy sederhana (kotak putih 512x512)
        const { createCanvas } = require('canvas');
        const canvas = createCanvas(512, 512);
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 512, 512);
        
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 50px Arial';
        ctx.fillText('Test Sticker', 50, 250);
        
        const pngBuffer = canvas.toBuffer('image/png');
        
        // Convert ke webp pake sharp
        const sharp = require('sharp');
        const webpBuffer = await sharp(pngBuffer)
            .webp({ quality: 80 })
            .toBuffer();
        
        console.log('✅ Stiker dummy dibuat');
        
        // Tambah metadata
        const result = await addMetadata(webpBuffer);
        
        // Simpan hasil
        fs.writeFileSync('./test-author.webp', result);
        console.log('✅ File test-author.webp berhasil dibuat');
        console.log('📁 Cek file test-author.webp di folder ini');
        console.log('📱 Kirim file itu ke WhatsApp dan lihat info stikernya');
        
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

test();