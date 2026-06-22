const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Hardcoded admin password for simplicity (as requested)
const ADMIN_PASSWORD = 'admin';

// Helper to read data
function readData() {
    const rawData = fs.readFileSync(DATA_FILE);
    return JSON.parse(rawData);
}

// API: Get Data
app.get('/api/data', (req, res) => {
    try {
        const data = readData();
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

// API: Update Data
app.post('/api/data', (req, res) => {
    const { password, data } = req.body;

    if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized: Incorrect password' });
    }

    if (!data) {
        return res.status(400).json({ error: 'Bad Request: No data provided' });
    }

    try {
        // Read existing to merge or just overwrite. We will overwrite here.
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        res.json({ success: true, message: 'Data updated successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Admin panel: http://localhost:${PORT}/admin.html`);
});
