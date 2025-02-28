// Получаем chatId из URL (например, https://your-web-app.com?chatId=12345)
const urlParams = new URLSearchParams(window.location.search);
const chatId = urlParams.get('chatId');

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
    const consumptionGVS = currentGVS - initialGVS;
    const consumptionHVS = currentHVS - initialHVS;

    // Формируем данные для отправки на сервер
    const data = {
        chatId, // Добавляем chatId
        initialGVS,
        currentGVS,
        initialHVS,
        currentHVS,
        consumptionGVS,
        consumptionHVS
    };
    
    try {
        // Отправляем данные на сервер
        const response = await fetch('http://localhost:3000/saveReadings', {
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
        const response = await fetch('http://localhost:3000/getReadings');
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
