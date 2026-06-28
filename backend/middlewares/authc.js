const jwt = require('jsonwebtoken');

const checkbToken = (req, res, next) => {
    
     const token = req.cookies.authToken || req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'No token, access denied' });
    }

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
            if (err) {
                return res.status(401).json({ success: false, message: 'Invalid token' });
            }
            return res.status(200).json({ success: true, message: 'Already logged in' });
        });
    } else {
        return res.status(401).json({ success: false, message: 'Not logged in' })
    }
};

module.exports = checkbToken;