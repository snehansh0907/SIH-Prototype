// =========================================================
// Krishi Sarthak - Auth Routes
// =========================================================

const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/me/:id', getMe);

module.exports = router;
