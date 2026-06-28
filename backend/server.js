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



// ─── AUTO-PING EVERY 10 MINUTES ───
setInterval(() => {
  https.get('https://assignmentdbs-ylfk.onrender.com', (res) => {
    console.log(`Ping sent at ${new Date().toISOString()} - Status: ${res.statusCode}`);
  }).on('error', (err) => {
    console.log('Ping error:', err.message);
  });
}, 10 * 60 * 1000);



app.listen(3000, () => {
    console.log('Server listening on port 3000');
});