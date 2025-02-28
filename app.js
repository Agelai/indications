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

    // Рассчитываем расход
    const consumptionGVS = currentGVS - initialGVS;
    const consumptionHVS = currentHVS - initialHVS;

    // Формируем данные для отправки на сервер
    const data = {
        initialGVS: currentGVS, // Сохраняем текущие показания как начальные для следующего раза
        initialHVS: currentHVS,
        consumptionGVS,
        consumptionHVS
    };

    try {
        // Отправляем данные на сервер
        const response = await fetch('http://94.245.149.41:3000/saveReadings', {
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
        const response = await fetch('http://94.245.149.41:3000/getReadings');
        if (!response.ok) {
            throw new Error('Ошибка при загрузке данных');
        }

        const data = await response.json();

        // Заполняем поля ввода сохраненными данными
        if (data.initialGVS) {
            document.getElementById('initialGVS').value = data.initialGVS;
        }
        if (data.initialHVS) {
            document.getElementById('initialHVS').value = data.initialHVS;
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
};
