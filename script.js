const chatId = msg.chat.id; // Получаем chatId из сообщения пользователя

async function calculateAndSave() {
    const initialHotWater = parseFloat(document.getElementById('initialHotWater').value);
    const currentHotWater = parseFloat(document.getElementById('currentHotWater').value);
    const initialColdWater = parseFloat(document.getElementById('initialColdWater').value);
    const currentColdWater = parseFloat(document.getElementById('currentColdWater').value);

    const hotWaterUsage = currentHotWater - initialHotWater;
    const coldWaterUsage = currentColdWater - initialColdWater;

    document.getElementById('hotWaterUsage').textContent = `Расход ГВС: ${hotWaterUsage.toFixed(2)}`;
    document.getElementById('coldWaterUsage').textContent = `Расход ХВС: ${coldWaterUsage.toFixed(2)}`;

    // Отправка данных на сервер
    try {
        const response = await fetch('/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                initialHotWater,
                currentHotWater,
                initialColdWater,
                currentColdWater,
            }),
        });
        const result = await response.json();
        if (result.success) {
            alert('Данные успешно сохранены на сервере!');
        } else {
            alert('Ошибка при сохранении данных.');
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

// Загрузка последних показаний при открытии Web App
async function loadLastReadings() {
    try {
        const response = await fetch(`/last?userId=${userId}`);
        const result = await response.json();
        if (result.success && result.readings) {
            document.getElementById('initialHotWater').value = result.readings.currentHotWater;
            document.getElementById('initialColdWater').value = result.readings.currentColdWater;
        }
    } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
    }
}

window.onload = loadLastReadings;
