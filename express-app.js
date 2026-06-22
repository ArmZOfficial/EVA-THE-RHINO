const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@vercel/kv');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Admin password from ENV or hardcoded local fallback
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

// Initialize KV client only if env vars are present
const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
let kv;
if (kvUrl && kvToken) {
    kv = createClient({ url: kvUrl, token: kvToken });
}

// Helper to read data
async function readData() {
    if (kv) {
        try {
            const data = await kv.get('appData');
            if (data) return data;
        } catch (e) {
            console.error('KV read error:', e);
        }
    }
    // Fallback to local data.json
    try {
        const rawData = fs.readFileSync(DATA_FILE);
        return JSON.parse(rawData);
    } catch (err) {
        return {};
    }
}

// Helper to write data
async function writeData(data) {
    if (kv) {
        try {
            await kv.set('appData', data);
            return;
        } catch (e) {
            console.error('KV write error:', e);
            throw e;
        }
    }
    // Fallback to local data.json
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// API: Get Data
app.get('/api/data', async (req, res) => {
    try {
        const data = await readData();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to read data' });
    }
});

// API: Fetch TikTok Info
app.get('/api/tiktok-info', async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).json({ error: 'Missing url parameter' });
    
    try {
        const response = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`);
        const json = await response.json();
        res.json(json);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch from TikTok' });
    }
});

// API: Save Data (Requires Password)
app.post('/api/data', async (req, res) => {
    const { password, data } = req.body;

    if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ success: false, error: 'Unauthorized: Incorrect password' });
    }

    if (!data) {
        return res.status(400).json({ error: 'Bad Request: No data provided' });
    }

    try {
        await writeData(data);
        res.json({ success: true, message: 'Data updated successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save data' });
    }
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
        console.log(`Admin panel: http://localhost:${PORT}/admin.html`);
    });
}

module.exports = app;
