const axios = require("axios");

async function execute(sock, message, args) {
  try {
    const from = message.key.remoteJid;
    const remoteJid = from.split("@")[0];

    // ===== FIX: Nama aman =====
    let pushName = message.pushName;
    if (!pushName || pushName.trim().length === 0) {
      pushName = "Tidak ada nama";
    }

    // ===== FORMAT NOMOR UNTUK TAMPILAN =====
    let nomorTampil = remoteJid;
    if (remoteJid.length >= 10) {
      if (remoteJid.startsWith("62")) {
        nomorTampil = remoteJid.replace(/(\d{3})(\d{4})(\d+)/, "+62 $1-$2-$3");
      } else {
        nomorTampil = remoteJid.replace(/(\d{3})(\d{4})(\d+)/, "+$1 $2 $3");
      }
    }

    const isGroup = from.endsWith("@g.us");
    const tipeChat = isGroup ? "Grup" : "Pribadi";

    // ===== AMBIL BIO =====
    let bio = "Tidak ada bio";

    try {
      if (!isGroup) {
        console.log("📡 Mencoba ambil bio untuk:", from);

        const status = await sock.fetchStatus(from);
        console.log("📥 Response status:", status);

        // ===== FIX BIO AMAN =====
        if (status && status[0] && status[0].status && typeof status[0].status.status === "string") {
          const value = status[0].status.status.trim();
          bio = value.length > 0 ? value : "Tidak ada bio";
        } else {
          bio = "Tidak ada bio";
        }

        console.log("✅ Bio:", bio);
      }
    } catch (e) {
      console.log("❌ Error ambil bio:", e.message);
      bio = "Tidak ada bio";
    }

    // ===== AMBIL FOTO PROFIL =====
    let fotoBuffer = null;
    let fotoAda = "Tidak ada foto profil";

    try {
      const fotoUrl = await sock.profilePictureUrl(from, "image");

      if (fotoUrl) {
        const response = await axios({
          method: "get",
          url: fotoUrl,
          responseType: "arraybuffer",
        });

        fotoBuffer = Buffer.from(response.data, "binary");
        fotoAda = "Ada";
        console.log("✅ Foto profil berhasil didownload");
      }
    } catch (e) {
      console.log("⚠️ Gagal ambil foto:", e.message);

      if (String(e.message).includes("404")) {
        fotoAda = "Tidak punya foto profil";
      }
    }

    // ===== BUAT CAPTION =====
    const caption = `📋 Tentangmu
        
👤 Nama: ${pushName}
📱 Nomor: ${nomorTampil}
📝 Bio: ${bio}
🖼️ Foto: ${fotoAda}
📍 Tipe: ${tipeChat}

📌 Catatan: Nomor yang tampil adalah nomor server WhatsApp.`;

    // ===== KIRIM =====
    if (fotoBuffer) {
      await sock.sendMessage(from, {
        image: fotoBuffer,
        caption: caption,
      });
      console.log("✅ Info + foto terkirim");
    } else {
      await sock.sendMessage(from, { text: caption });
      console.log("✅ Info teks terkirim");
    }

    console.log(`✅ .me untuk ${pushName} (${nomorTampil})`);
  } catch (error) {
    console.log("❌ Error di .me:", error.message);
    const from = message.key.remoteJid;
    await sock.sendMessage(from, { text: "❌ Gagal mengambil info" });
  }
} 

module.exports = {
  name: "me",
  description: "Lihat info dirimu (nama, nomor, bio, foto)",
  execute,
};
