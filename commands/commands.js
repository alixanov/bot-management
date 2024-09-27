const NodeWebcam = require('node-webcam'); // Для работы с веб-камерой
const fs = require('fs');
// const { exec } = require('child_process');
const sudo = require('sudo-prompt');
const os = require('os');
const axios = require('axios');


// Настройки для камеры
const webcamOptions = {
     width: 1280,
     height: 720,
     quality: 100,
     delay: 0,
     saveShots: true,
     output: "jpeg",
     device: false,
     callbackReturn: "location",
     verbose: false
};
// Функция для захвата изображения с камеры
exports.takePhoto = (bot, chatId) => {
     const filePath = './photo.jpg'; // Путь для сохранения изображения

     // Создаем объект камеры
     const Webcam = NodeWebcam.create(webcamOptions);

     // Захватываем изображение
     Webcam.capture(filePath, (err, data) => {
          if (err) {
               bot.sendMessage(chatId, `Ошибка при захвате изображения: ${err.message}`);
               return;
          }

          // Если изображение успешно сохранено, отправляем его пользователю
          bot.sendPhoto(chatId, fs.createReadStream(filePath), {
               caption: 'Вот фото с камеры! 📸'
          }, (error) => {
               if (error) {
                    bot.sendMessage(chatId, `Ошибка при отправке изображения: ${error.message}`);
               }

               // Удаляем файл после отправки
               fs.unlinkSync(filePath);
          });
     });
};

const { exec } = require('child_process');





// Функция для выключения компьютера
exports.shutdown = (bot, chatId) => {
     const exec = require('child_process').exec;
     exec('shutdown /s /t 0', (error, stdout, stderr) => {
          if (error) {
               bot.sendMessage(chatId, `Ошибка при попытке выключения: ${error.message}`);
               return;
          }
          bot.sendMessage(chatId, 'Компьютер выключается...');
     });
};


// Функция для отключения Wi-Fi
const options = {
     name: 'MyBot'
};

// Имя Wi-Fi адаптера
const wifiAdapterName = 'Беспроводная сеть';
// Функция для отключения Wi-Fi через PowerShell
exports.disableWifi = (bot, chatId) => {
     const powershellCommand = `powershell -Command "Disable-NetAdapter -Name '${wifiAdapterName}' -Confirm:$false"`;
     sudo.exec(powershellCommand, options, (error, stdout, stderr) => {
          if (error) {
               bot.sendMessage(chatId, `Ошибка: ${error.message}`);
               return;
          }
          if (stderr) {
               bot.sendMessage(chatId, `Ошибка выполнения: ${stderr}`);
               return;
          }
          bot.sendMessage(chatId, 'Wi-Fi отключен! 📴');

          // Таймер для автоматического включения Wi-Fi через 30 секунд
          setTimeout(() => {
               const enableCommand = `powershell -Command "Enable-NetAdapter -Name '${wifiAdapterName}' -Confirm:$false"`;
               sudo.exec(enableCommand, options, (error, stdout, stderr) => {
                    if (error) {
                         bot.sendMessage(chatId, `Ошибка при включении Wi-Fi: ${error.message}`);
                         return;
                    }
                    if (stderr) {
                         bot.sendMessage(chatId, `Ошибка выполнения команды включения: ${stderr}`);
                         return;
                    }
                    bot.sendMessage(chatId, 'Wi-Fi снова включен! 📶');
               });
          }, 10000); // 10000 миллисекунд = 10 секунд
     });
};


// Функция для получения локального IP-адреса
exports.getLocalIp = (bot, chatId) => {
     const networkInterfaces = os.networkInterfaces();
     let ipAddress = 'Не удалось получить IP-адрес';

     // Проходим по всем сетевым интерфейсам
     for (let interfaceName in networkInterfaces) {
          const addresses = networkInterfaces[interfaceName];

          // Ищем первый IPv4-адрес
          for (let address of addresses) {
               if (address.family === 'IPv4' && !address.internal) {
                    ipAddress = address.address;
                    break;
               }
          }
     }

     // Отправляем IP-адрес пользователю
     bot.sendMessage(chatId, `Локальный IP-адрес: ${ipAddress}`);
};

// Функция для получения внешнего IP-адреса через API
exports.getExternalIp = async (bot, chatId) => {
     try {
          const response = await axios.get('https://api.ipify.org?format=json');
          const externalIp = response.data.ip;
          bot.sendMessage(chatId, `Внешний IP-адрес: ${externalIp}`);
     } catch (error) {
          bot.sendMessage(chatId, `Ошибка при получении внешнего IP-адреса: ${error.message}`);
     }
};


// Функция для получения геолокации по IP через API ipinfo.io
exports.getGeoLocation = async (bot, chatId) => {
     try {
          const response = await axios.get('https://ipinfo.io/json');
          const { ip, city, region, country, loc } = response.data;
          bot.sendMessage(chatId, `IP: ${ip}\nГород: ${city}\nРегион: ${region}\nСтрана: ${country}\nКоординаты: ${loc}`);
     } catch (error) {
          bot.sendMessage(chatId, `Ошибка при получении геолокации: ${error.message}`);
     }
};

