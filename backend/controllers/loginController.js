const MemberSchema = require('../models/register');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const saltRounds = 12;

exports.getLogin = (req, res) => {
    res.json({ success: true, message: 'Login endpoint ready' });
}

exports.postMember = async (req, res) => {
    const password = await bcrypt.hash('limchne8910', saltRounds);
    const newMemb = await MemberSchema.create({
        userid: 'limchen890',
        regpass: password,
    });
    console.log(newMemb);
    res.json({ success: true, message: 'Member created', member: newMemb });
}

exports.postLogin = async (req, res) => {
    const userid = req.body.userid;
    const pswd = req.body.regpass;
    try {

        const memb = await MemberSchema.findOne({ userid: userid });
        if (!memb) return res.status(404).json({ success: false, message: 'User does not exist' });

        const match = await bcrypt.compare(pswd, memb.regpass); 
 
        if (!match) return res.status(401).json({ success: false, message: 'Invalid username or password' });

        const token = jwt.sign({ userId: memb.userid }, process.env.JWT_SECRET_KEY, {
            expiresIn: '3d',
        });
        res.cookie('authToken', token, { httpOnly: true, sameSite: 'none', secure: true, maxAge: 3 * 24 * 60 * 60 * 1000 }); 
        res.status(200).json({ success: true, message: 'Login successful', token: token  });

    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'Something went wrong' });
    }
}