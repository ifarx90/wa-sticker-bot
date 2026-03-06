async function startLoading(sock, message) {
  try {
    await sock.sendMessage(message.key.remoteJid, {
      react: {
        text: "⏳",
        key: message.key
      }
    })
  } catch (err) {
    console.log("Loading reaction gagal:", err)
  }
}

async function stopLoading(sock, message) {
  try {
    await sock.sendMessage(message.key.remoteJid, {
      react: {
        text: "",
        key: message.key
      }
    })
  } catch (err) {
    console.log("Remove reaction gagal:", err)
  }
}

module.exports = {
  startLoading,
  stopLoading
}