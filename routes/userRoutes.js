const express = require('express');
const { createUser } = require('../controllers/userController');
const router = express.Router();

// Маршрут для создания пользователя
router.post('/create', createUser);

module.exports = router;
