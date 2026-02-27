async function execute(sock, message, args) {
  try {
    const from = message.key.remoteJid;

    console.log("Nyoba kirim pesan ke:", from);

    // Kirim balasan
    await sock.sendMessage(from, {
      text: "🤖 ifarXbot sedang aktif!\nAdaa yang bisa dibantu?",
    });

    console.log("✅ Ping berhasil dijawab");
  } catch (error) {
    console.log("❌ Error:", error.message);
  }
}

module.exports = {
  name: "ping",
  description: "Cek bot online atau engga",
  execute,
};
