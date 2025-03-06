const serverUrl = 'https://mytestbot.com/lander'; // Локальный сервер http://localhost:3000

// Получаем chatId из URL
const urlParams = new URLSearchParams(window.location.search);
let chatId = urlParams.get('chatId');

if (!chatId) {
    chatId = 'defaultChatId';
    console.warn('chatId не указан в URL. Используется значение по умолчанию:', chatId);
}

// Обработчик для кнопки "Архив"
document.getElementById('archiveButton').addEventListener('click', async function() {
    try {
        const response = await fetch(`${serverUrl}/getReadings/${chatId}`);
        if (!response.ok) {
            throw new Error('Ошибка при загрузке архива данных');
        }

        const data = await response.json();

        let archiveHtml = '<h2>Архив показаний</h2>';
        if (data.length > 0) {
            data.forEach((reading) => {
                const date = new Date(reading.timestamp).toLocaleString();
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

        archiveHtml += '<button id="closeArchiveButton">Закрыть архив</button>';
        document.getElementById('archiveResult').innerHTML = archiveHtml;

        document.getElementById('closeArchiveButton').addEventListener('click', function() {
            document.getElementById('archiveResult').innerHTML = '';
        });
    } catch (error) {
        console.error('Ошибка:', error);
        document.getElementById('archiveResult').innerHTML = `<p style="color: red;">Ошибка: ${error.message}</p>`;
    }
});

document.getElementById('readingsForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const initialGVS = parseFloat(document.getElementById('initialGVS').value);
    const currentGVS = parseFloat(document.getElementById('currentGVS').value);
    const initialHVS = parseFloat(document.getElementById('initialHVS').value);
    const currentHVS = parseFloat(document.getElementById('currentHVS').value);

    if (isNaN(initialGVS) || isNaN(currentGVS) || isNaN(initialHVS) || isNaN(currentHVS)) {
        alert('Пожалуйста, заполните все поля корректно.');
        return;
    }

    if (currentGVS < initialGVS || currentHVS < initialHVS) {
        alert('Текущие показания не могут быть меньше предыдущих!');
        return;
    }

    const consumptionGVS = (currentGVS - initialGVS).toFixed(3);
    const consumptionHVS = (currentHVS - initialHVS).toFixed(3);

    const data = {
        chatId,
        initialGVS,
        currentGVS,
        initialHVS,
        currentHVS,
        consumptionGVS: parseFloat(consumptionGVS),
        consumptionHVS: parseFloat(consumptionHVS)
    };

    try {
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

        document.getElementById('result').innerHTML = `
            <p>Расход ГВС: ${consumptionGVS}</p>
            <p>Расход ХВС: ${consumptionHVS}</p>
        `;
    } catch (error) {
        console.error('Ошибка:', error);
        document.getElementById('result').innerHTML = `<p style="color: red;">Ошибка: ${error.message}</p>`;
    }
});

window.onload = async function() {
    try {
        const response = await fetch(`${serverUrl}/getReadings/${chatId}`);
        if (!response.ok) {
            throw new Error('Ошибка при загрузке данных');
        }

        const data = await response.json();

        if (data.length > 0) {
            const lastReading = data[data.length - 1];
            document.getElementById('initialGVS').value = lastReading.currentGVS;
            document.getElementById('initialHVS').value = lastReading.currentHVS;
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
};
