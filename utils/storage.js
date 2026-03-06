// utils/storage.js

const fs = require('fs');
const path = require('path');

const STORAGE_DIR = path.join(__dirname, '../storage');
const WELCOMED_FILE = path.join(STORAGE_DIR, 'welcomed.json');
const NOTIFIED_FILE = path.join(STORAGE_DIR, 'notified.json');

// Pastikan folder storage ada
if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

// Pastikan file ada dengan isi default array kosong
function ensureFile(file) {
    if (!fs.existsSync(file)) {
        fs.writeFileSync(file, '[]', 'utf8');
    }
}

ensureFile(WELCOMED_FILE);
ensureFile(NOTIFIED_FILE);

// ===== WELCOMED USERS =====
function loadWelcomed() {
    try {
        const data = fs.readFileSync(WELCOMED_FILE, 'utf8');
        // Cek apakah data kosong
        if (!data || data.trim() === '') {
            return new Set();
        }
        return new Set(JSON.parse(data));
    } catch (error) {
        console.log('⚠️ Gagal load welcomed.json:', error.message);
        // Jika error, reset file
        fs.writeFileSync(WELCOMED_FILE, '[]', 'utf8');
        return new Set();
    }
}

function saveWelcomed(welcomedSet) {
    try {
        const data = JSON.stringify(Array.from(welcomedSet));
        fs.writeFileSync(WELCOMED_FILE, data, 'utf8');
    } catch (error) {
        console.log('⚠️ Gagal save welcomed.json:', error.message);
    }
}

// ===== NOTIFIED USERS =====
function loadNotified() {
    try {
        const data = fs.readFileSync(NOTIFIED_FILE, 'utf8');
        // Cek apakah data kosong
        if (!data || data.trim() === '') {
            return new Set();
        }
        return new Set(JSON.parse(data));
    } catch (error) {
        console.log('⚠️ Gagal load notified.json:', error.message);
        // Jika error, reset file
        fs.writeFileSync(NOTIFIED_FILE, '[]', 'utf8');
        return new Set();
    }
}

function saveNotified(notifiedSet) {
    try {
        const data = JSON.stringify(Array.from(notifiedSet));
        fs.writeFileSync(NOTIFIED_FILE, data, 'utf8');
    } catch (error) {
        console.log('⚠️ Gagal save notified.json:', error.message);
    }
}

module.exports = {
    loadWelcomed,
    saveWelcomed,
    loadNotified,
    saveNotified
};