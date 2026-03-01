const { BufferJSON, initAuthCreds, proto } = require('@whiskeysockets/baileys');
const mongoose = require('mongoose');

const AuthSchema = new mongoose.Schema({ _id: String, data: String }, { strict: false });
const AuthModel = mongoose.models.Auth || mongoose.model('Auth', AuthSchema);

async function useMongoDBAuthState(mongoUrl) {
    if (!mongoose.connection.readyState) await mongoose.connect(mongoUrl);
    const readData = async (id) => {
        try {
            const res = await AuthModel.findById(id);
            if (!res) return null;
            return JSON.parse(res.data, BufferJSON.reviver);
        } catch (error) { return null; }
    };
    const writeData = async (data, id) => {
        const str = JSON.stringify(data, BufferJSON.replacer);
        await AuthModel.findByIdAndUpdate(id, { data: str }, { upsert: true });
    };
    const removeData = async (id) => { await AuthModel.findByIdAndDelete(id); };
    const creds = await readData('creds') || initAuthCreds();
    return {
        state: {
            creds,
            keys: {
                get: async (type, ids) => {
                    const data = {};
                    await Promise.all(ids.map(async (id) => {
                        let value = await readData(`${type}-${id}`);
                        if (type === 'app-state-sync-key' && value) value = proto.Message.AppStateSyncKeyData.fromObject(value);
                        data[id] = value;
                    }));
                    return data;
                },
                set: async (data) => {
                    for (const type in data) {
                        for (const id in data[type]) {
                            const value = data[type][id];
                            if (value) await writeData(value, `${type}-${id}`);
                            else await removeData(`${type}-${id}`);
                        }
                    }
                }
            }
        },
        saveCreds: () => writeData(creds, 'creds')
    };
}
module.exports = { useMongoDBAuthState };