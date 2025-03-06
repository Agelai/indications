const botToken = '8150508591:AAElvwwCSCMhPa025yldgwuWJ0lXHJxWE50'; // Замените на токен вашего бота
const chatId = 'YOUR_CHAT_ID'; // Замените на chatId пользователя или группы

// Получаем chatId из URL (например, https://agelai.github.io/indications?chatId=12345)
const urlParams = new URLSearchParams(window.location.search);
let chatId = urlParams.get('chatId');

// Если chatId не передан, используем значение по умолчанию
if (!chatId) {
    chatId = 'defaultChatId'; // Значение по умолчанию
    console.warn('chatId не указан в URL. Используется значение по умолчанию:', chatId);
}

// Обработчик для кнопки "Архив"
document.getElementById('archiveButton').addEventListener('click', async function() {
    try {
        // Запрашиваем архив данных у бота
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: '/getReadings'
            })
        });

        if (!response.ok) {
            throw new Error('Ошибка при загрузке архива данных');
        }

        const data = await response.json();

        // Формируем HTML для вывода архива
        let archiveHtml = '<h2>Архив показаний</h2>';
        if (data.length > 0) {
            data.forEach((reading) => {
                // Форматируем дату
                const date = new Date(reading.timestamp).toLocaleString(); // Например: "01.10.2023, 12:00:00"

                // Форматируем расход с тремя знаками после запятой
                const consumptionGVS = parseFloat(reading.consumptionGVS).toFixed(3);
                const consumptionHVS = parseFloat(reading.consumptionHVS).toFixed(3);

                archiveHtml += `
                    <div class="archive-item">
                        <h3>Дата заполнения: ${date}</h3>
                        <p>Начальные показания ГВС: ${reading.initialGVS}</p>
                        <p>Текущие показания ГВС: ${reading.currentGVS}</p>
                        <p>Расход ГВС: ${consumptionGVS}</p>
                        <p>Начальные показания ХВС: ${reading.initialHVS}</p>
                        <p>Текущие показания ХВС: ${reading.currentHVS}</p>
                        <p>Расход ХВС: ${consumptionHVS}</p>
                    </div>
                `;
            });
        } else {
            archiveHtml += '<p>Нет данных для отображения.</p>';
        }

        // Добавляем кнопку "Закрыть архив"
        archiveHtml += '<button id="closeArchiveButton">Закрыть архив</button>';

        // Выводим архив на экран
        document.getElementById('archiveResult').innerHTML = archiveHtml;

        // Обработчик для кнопки "Закрыть архив"
        document.getElementById('closeArchiveButton').addEventListener('click', function() {
            document.getElementById('archiveResult').innerHTML = ''; // Сворачиваем архив
        });
    } catch (error) {
        console.error('Ошибка:', error);
        document.getElementById('archiveResult').innerHTML = `<p style="color: red;">Ошибка: ${error.message}</p>`;
    }
});

document.getElementById('readingsForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    // Получаем значения из полей ввода
    const initialGVS = parseFloat(document.getElementById('initialGVS').value);
    const currentGVS = parseFloat(document.getElementById('currentGVS').value);
    const initialHVS = parseFloat(document.getElementById('initialHVS').value);
    const currentHVS = parseFloat(document.getElementById('currentHVS').value);

    // Проверка на пустые значения
    if (isNaN(initialGVS) || isNaN(currentGVS) || isNaN(initialHVS) || isNaN(currentHVS)) {
        alert('Пожалуйста, заполните все поля корректно.');
        return;
    }

    // Проверка на то, что текущие показания не меньше предыдущих
    if (currentGVS < initialGVS || currentHVS < initialHVS) {
        alert('Текущие показания не могут быть меньше предыдущих!');
        return;
    }

    // Рассчитываем расход
    const consumptionGVS = (currentGVS - initialGVS).toFixed(3); // Форматируем с тремя знаками после запятой
    const consumptionHVS = (currentHVS - initialHVS).toFixed(3); 

    // Формируем данные для отправки боту
    const data = {
        chatId, // Добавляем chatId
        initialGVS,
        currentGVS,
        initialHVS,
        currentHVS,
        consumptionGVS: parseFloat(consumptionGVS),
        consumptionHVS: parseFloat(consumptionHVS)  
    };

    try {
        // Отправляем данные боту
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: `Данные: ${JSON.stringify(data)}`
            })
        });

        if (!response.ok) {
            throw new Error('Ошибка при сохранении данных');
        }

        // Выводим результат на экран
        document.getElementById('result').innerHTML = `
            <p>Расход ГВС: ${consumptionGVS}</p>
            <p>Расход ХВС: ${consumptionHVS}</p>
        `;
    } catch (error) {
        console.error('Ошибка:', error);
        document.getElementById('result').innerHTML = `<p style="color: red;">Ошибка: ${error.message}</p>`;
    }
});

// Загрузка сохраненных данных при открытии Web App
window.onload = async function() {
    try {
        // Запрашиваем данные у бота
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: '/getReadings'
            })
        });

        if (!response.ok) {
            throw new Error('Ошибка при загрузке данных');
        }

        const data = await response.json();

        // Если есть сохраненные данные, заполняем начальные показания
        if (data.length > 0) {
            const lastReading = data[data.length - 1]; // Берем последние показания
            document.getElementById('initialGVS').value = lastReading.currentGVS;
            document.getElementById('initialHVS').value = lastReading.currentHVS;
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
};
