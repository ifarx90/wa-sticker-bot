const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const sharp = require('sharp');
const { startLoading, stopLoading } = require("../utils/loadingReaction");

async function execute(sock, message, args) {
    const from = message.key.remoteJid;

    await startLoading(sock, message);

    try {

        const quoted = message.message.extendedTextMessage?.contextInfo?.quotedMessage;

        if (!quoted || !quoted.stickerMessage) {

            await stopLoading(sock, message);

            await sock.sendMessage(from, { 
                text: '❌ *Reply stiker dulu bang!*\n\nContoh: reply stiker + .toimg' 
            }, { quoted: message });
            return;
        }

        console.log('📥 Mendownload stiker...');

        const stickerBuffer = await downloadMediaMessage(
            {
                key: {
                    remoteJid: from,
                    id: message.message.extendedTextMessage.contextInfo.stanzaId
                },
                message: quoted
            },
            'buffer',
            {},
            { logger: console }
        );

        console.log('✅ Stiker berhasil didownload');

        console.log('🎨 Mengkonversi stiker ke gambar...');

        const imageBuffer = await sharp(stickerBuffer)
            .png()
            .toBuffer();

        console.log('✅ Gambar berhasil dibuat');

        await sock.sendMessage(from, {
            image: imageBuffer,
            caption: '🖼️ *Hasil convert stiker ke gambar*'
        }, { quoted: message });

        console.log('✅ Gambar terkirim!');

        await stopLoading(sock, message);

    } catch (error) {

        await stopLoading(sock, message);

        console.log('❌ Error di .toimg:', error.message);

        await sock.sendMessage(from, { 
            text: '❌ Gagal convert stiker. Mungkin format tidak didukung.' 
        }, { quoted: message });
    }
}

module.exports = {
    name: 'toimg',
    description: 'Convert stiker ke gambar',
    execute
};