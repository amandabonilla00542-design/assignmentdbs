const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboardController');

router.get('/IB/profile', dashboardController.getProfile);

module.exports = router;