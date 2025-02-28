const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');

app.use(express.json());

// Разрешаем CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Путь к файлу для сохранения данных
const readingsFilePath = path.join(__dirname, 'readingsData.json');

// Загрузка данных из файла
let readingsData = {};
if (fs.existsSync(readingsFilePath)) {
    const data = fs.readFileSync(readingsFilePath, 'utf8');
    readingsData = JSON.parse(data);
}

// Сохранение данных
app.post('/saveReadings', (req, res) => {
    readingsData = req.body;
    fs.writeFileSync(readingsFilePath, JSON.stringify(readingsData)); // Сохраняем данные в файл
    res.json({ success: true });
});

// Получение данных
app.get('/getReadings', (req, res) => {
    res.json(readingsData);
});

// Экспорт сервера для Vercel
module.exports = app;
