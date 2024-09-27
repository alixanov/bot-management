const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
     telegramId: { type: String, required: true },
     username: { type: String, required: true },
     role: { type: String, enum: ['admin', 'user'], default: 'user' },  // Роль: админ или пользователь
});

module.exports = mongoose.model('User', userSchema);
