const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { imageToSticker } = require('../utils/imageToSticker');
const { addTextToImage } = require('../utils/addTextToImage');
const storage = require("../utils/storage");

// Simpan user yang udah dikasih catatan
let notifiedUsers = storage.loadNotified();
const MAX_FILE_SIZE = 7 * 1024 * 1024; // 7MB

async function execute(sock, message, args) {
    try {
        const from = message.key.remoteJid;
        
        // ===== CEK APAKAH ADA TEKS =====
        const hasText = args.length > 0;
        const text = hasText ? args.join(' ') : '';
        
        if (hasText) {
            console.log(`📝 .s dengan teks: "${text}"`);
        }
        
        // Cek 2 skenario
        const quoted = message.message.extendedTextMessage?.contextInfo?.quotedMessage;
        const hasImage = message.message.imageMessage;
        
        let imageBuffer;
        let mediaMessage;
        let mediaKey;
        let fileSize = 0;
        
        // ===== VALIDASI AWAL =====
        if (quoted) {
            // Skenario reply
            if (!quoted.imageMessage) {
                await sock.sendMessage(from, { text: '⚠️ Itu bukan gambar! Reply gambar ya.' });
                return;
            }
            console.log('📥 Mendownload gambar dari reply...');
            mediaMessage = quoted;
            mediaKey = {
                remoteJid: from,
                id: message.message.extendedTextMessage.contextInfo.stanzaId
            };
            fileSize = quoted.imageMessage.fileLength || 0;
            
        } else if (hasImage) {
            // Skenario kirim langsung
            console.log('📥 Mendownload gambar dari pesan langsung...');
            mediaMessage = message.message;
            mediaKey = message.key;
            fileSize = message.message.imageMessage.fileLength || 0;
            
        } else {
            await sock.sendMessage(from, { text: '⚠️ Kirim gambar dengan caption .s atau reply gambar dengan .s' });
            return;
        }
        
        // ===== CEK UKURAN FILE =====
        if (fileSize > MAX_FILE_SIZE) {
            await sock.sendMessage(from, { 
                text: "❌ Ukuran gambar terlalu besar (max 7MB)"
            });
            return;
        }
        
        // ===== REACTION LOADING =====
        await sock.sendMessage(from, {
            react: {
                text: '⏳',
                key: message.key
            }
        });
        
        // Pesan catatan hanya untuk user baru
        if (!notifiedUsers.has(from)) {
            await sock.sendMessage(from, { 
                text: '📸 Catatan: Gambar asli akan tersimpan di galeri. Disarankan matikan auto download biar ga double.' 
            });
            notifiedUsers.add(from);
            storage.saveNotified(notifiedUsers);
        }
        
        // Download media
        try {
            imageBuffer = await downloadMediaMessage(
                { key: mediaKey, message: mediaMessage },
                'buffer',
                {},
                { logger: console }
            );
        } catch (downloadError) {
            throw {
                type: 'download',
                message: downloadError.message
            };
        }
        
        console.log('✅ Download berhasil!');
        
        // ===== TAMBAHKAN TEKS JIKA ADA =====
        if (hasText) {
            try {
                imageBuffer = await addTextToImage(imageBuffer, text);
            } catch (textError) {
                throw {
                    type: 'text',
                    message: textError.message
                };
            }
        }
        
        console.log('🎨 Mengkonversi ke stiker...');
        
        // Konversi ke stiker
        let stickerBuffer;
        try {
            stickerBuffer = await imageToSticker(imageBuffer);
        } catch (stickerError) {
            throw {
                type: 'conversion',
                message: stickerError.message
            };
        }
        
        // Kirim stiker
        await sock.sendMessage(from, { 
            sticker: stickerBuffer
        });
        
        // ===== HAPUS REACTION =====
        await sock.sendMessage(from, {
            react: {
                text: '',
                key: message.key
            }
        });
        
        console.log('✅ Stiker berhasil dikirim!');
        
    } catch (error) {
        console.log('❌ Error di .s:', error.message);
        const from = message.key.remoteJid;
        
        // ===== HANDLE ERROR BERDASARKAN JENIS =====
        let pesanError = '';
        const errorMsg = error.message?.toLowerCase() || '';
        const errorType = error.type || 'unknown';
        
        // 1. Error Download
        if (errorType === 'download' || 
            errorMsg.includes('timeout') || 
            errorMsg.includes('etimedout') ||
            errorMsg.includes('network') ||
            errorMsg.includes('socket')) {
            pesanError = '❌ Gagal: Gagal mengunduh gambar.\n💡 Saran: Cek koneksi dan coba lagi.';
        }
        
        // 2. Error Teks (jarang terjadi, tapi handle aja)
        else if (errorType === 'text') {
            pesanError = '❌ Gagal: Gagal menambahkan teks ke gambar.\n💡 Saran: Coba tanpa teks atau dengan teks lain.';
        }
        
        // 3. Error Format Gambar
        else if (errorType === 'conversion' && ( 
            errorMsg.includes('unsupported') ||
            errorMsg.includes('invalid') ||
            errorMsg.includes('format') ||
            errorMsg.includes('input buffer') ||
            errorMsg.includes('vips') ||
            errorMsg.includes('not a known'))) {
            pesanError = '❌ Gagal: Format gambar tidak didukung.\n💡 Saran: Pastikan gambarnya JPG/PNG biasa.';
        }
        
        // 4. Error Gambar Terlalu Besar
        else if (errorType === 'conversion' && (
            errorMsg.includes('too large') ||
            errorMsg.includes('memory') ||
            errorMsg.includes('heap') ||
            errorMsg.includes('allocation'))) {
            pesanError = '❌ Gagal: Ukuran gambar terlalu besar (max 7MB).\n💡 Saran: Kompres dulu sebelum kirim.';
        }
        
        // 5. Error Gambar Rusak
        else if (errorType === 'conversion' && (
            errorMsg.includes('corrupt') ||
            errorMsg.includes('truncated') ||
            errorMsg.includes('premature end') ||
            errorMsg.includes('bad'))) {
            pesanError = '❌ Gagal: File gambar rusak atau tidak lengkap.\n💡 Saran: Coba dengan gambar lain.';
        }
        
        // 6. Error Lainnya
        else {
            pesanError = '❌ Gagal: Terjadi kesalahan saat memproses.\n💡 Saran: Coba dengan gambar lain atau ulangi lagi.';
        }
        
        // Kirim pesan error ke user
        await sock.sendMessage(from, { text: pesanError });
    }
}

module.exports = {
    name: 's',
    description: 'Buat stiker dari gambar (bisa tambah teks: .s teks)',
    execute
};