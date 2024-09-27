require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const TelegramBot = require('node-telegram-bot-api'); // Импортируем библиотеку для работы с Telegram Bot API
const { takePhoto, disableWifi, shutdown, execCommand, getLocalIp, getExternalIp, getGeoLocation,} = require('./commands/commands'); // Импортируем команды для бота

// Инициализация приложения Express.js
const app = express();
// Подключение к порту
const PORT = process.env.PORT || 5005;
// Telegram Bot Token
const token = process.env.TELEGRAM_BOT_TOKEN;
// Подклкючение  базе данных MongoDB
const mongoURI = process.env.MONGODB_URI;


// Подключение к базе данных MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
     .then(() => console.log('MongoDB подключен успешно!'))
     .catch((err) => console.error('Ошибка подключения к MongoDB:', err));
// Middleware для обработки JSON
app.use(bodyParser.json());
// Роуты для работы с пользователями через API
// app.use('/api/users', userRoutes);



// Создаём экземпляр бота
const bot = new TelegramBot(token, {
     polling: {
          interval: 1000,
          autoStart: true,
          params: {
               timeout: 10,
          },
     },
});

// Обрабатываем команду /start с кнопками для удобства управления
bot.onText(/\/start/, (msg) => {
     const chatId = msg.chat.id;
     bot.sendMessage(chatId, `Привет, ${msg.from.first_name}! 👋 Я бот для управления устройством. Выбирай команды ниже или отправь свою!`, {
          reply_markup: {
               inline_keyboard: [
                    [{ text: '💻 Отключить компьютер', callback_data: 'shutdown' }],
                    [{ text: '📸 Сделать фото с камеры', callback_data: 'take_photo' }],
                    [{ text: '📶 Отключить Wi-Fi', callback_data: 'disable_wifi' }],
                    [{ text: '🌐 Получить локальный IP', callback_data: 'get_local_ip' }],
                    [{ text: '🌍 Получить внешний IP', callback_data: 'get_external_ip' }],
                    [{ text: '📍 Узнать геолокацию по IP', callback_data: 'get_geo_location' }] // Новая кнопка для геолокации
               ]
          }
     });
});





// Обрабатываем нажатия на кнопки
bot.on('callback_query', (query) => {
     const chatId = query.message.chat.id;
     const data = query.data;

     switch (data) {
          case 'shutdown':
               bot.sendMessage(chatId, '⚠️ Выключаю компьютер... Подтвердите, если уверены!', {
                    reply_markup: {
                         inline_keyboard: [
                              [{ text: 'Да, выключить', callback_data: 'confirm_shutdown' }],
                              [{ text: 'Отмена', callback_data: 'cancel_shutdown' }]
                         ]
                    }
               });
               break;
          case 'confirm_shutdown':
               bot.sendMessage(chatId, 'Выключаю... 🔌');
               shutdown(bot, chatId);
               break;
          case 'cancel_shutdown':
               bot.sendMessage(chatId, 'Операция отменена! 👍');
               break;
          case 'disable_wifi':
               disableWifi(bot, chatId);
               break;
          case 'take_photo':
               takePhoto(bot, chatId);
               break;
          case 'get_local_ip': // Локальный IP
               getLocalIp(bot, chatId);
               break;
          case 'get_external_ip': // Внешний IP
               getExternalIp(bot, chatId);
               break;
          case 'get_geo_location': // Геолокация по IP
               getGeoLocation(bot, chatId);
               break;
     }
});

// Обрабатываем текстовые сообщения для выполнения системной команды
bot.on('message', (msg) => {
     const chatId = msg.chat.id;
     const text = msg.text;

     // Игнорируем команды бота и системные сообщения
     if (msg.entities && msg.entities[0].type === 'bot_command') {
          return; 
     }

     // Выполняем произвольную системную команду, если сообщение не начинается с "/"
     if (!text.startsWith('/')) {
          execCommand(text, bot, chatId);
     }
});

// Запуск Express.js сервера
app.listen(PORT, () => {
     console.log(`Сервер запущен на порту ${PORT}`);
     console.log('Telegram бот запущен');
});
