const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => { 

     const token = req.cookies.authToken || req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'No token, access denied' });
    } 

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }

        res.locals.user = user;
        next();  
    });
};

module.exports = authenticateToken;