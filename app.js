const serverUrl = 'https://test-bot-tawny-delta.vercel.app'; // Локальный сервер http://localhost:3000

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
        // Запрашиваем архив данных с сервера
        const response = await fetch(`${serverUrl}/getReadings/${chatId}`);
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

    // Формируем данные для отправки на сервер
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
        // Отправляем данные на сервер
        const response = await fetch(`${serverUrl}/saveReadings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
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
        const response = await fetch(`${serverUrl}/getReadings/${chatId}`);
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
