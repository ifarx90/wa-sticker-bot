const { connectWhatsApp, setMessageHandler } = require('./connection/whatsapp');
const handleCommand = require('./handlers/commandHandler');

console.log('\nBOT STICKER AKTIF\n');

let botSocket = null;

function updateSocket(newSocket) {
    botSocket = newSocket;
}

const onMessage = async ({ messages }) => {
    const message = messages[0];
    if (!botSocket) return;
    await handleCommand(botSocket, message);
};

async function startBot() {
    try {
        setMessageHandler(onMessage, updateSocket);
        await connectWhatsApp();
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

startBot();