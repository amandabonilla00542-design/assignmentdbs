const express = require('express');
const router = express.Router();

const loginController = require('../controllers/loginController');

router.get('/IB/Welcome', loginController.getLogin);
router.post('/postnewmember', loginController.postMember);
router.post('/postinglogin', loginController.postLogin);

module.exports = router;