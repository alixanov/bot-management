const User = require('../models/user');

// Функция для создания пользователя
exports.createUser = async (req, res) => {
     const { name, email, age } = req.body;

     try {
          const newUser = new User({ name, email, age });
          const savedUser = await newUser.save();
          res.status(201).json(savedUser);
     } catch (error) {
          res.status(500).json({ message: 'Ошибка при создании пользователя', error });
     }
};
