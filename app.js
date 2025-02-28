document.getElementById('readingsForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const initialGVS = parseFloat(document.getElementById('initialGVS').value);
    const currentGVS = parseFloat(document.getElementById('currentGVS').value);
    const initialHVS = parseFloat(document.getElementById('initialHVS').value);
    const currentHVS = parseFloat(document.getElementById('currentHVS').value);

    const consumptionGVS = currentGVS - initialGVS;
    const consumptionHVS = currentHVS - initialHVS;

    const data = {
        initialGVS: currentGVS,
        initialHVS: currentHVS,
        consumptionGVS,
        consumptionHVS
    };

    fetch('https://ваш-сервер:3000/saveReadings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('result').innerHTML = `
            <p>Расход ГВС: ${consumptionGVS}</p>
            <p>Расход ХВС: ${consumptionHVS}</p>
        `;
    })
    .catch(error => {
        console.error('Ошибка:', error);
    });
});

// Загрузка сохраненных данных при открытии Web App
window.onload = function() {
    fetch('https://ваш-сервер:3000/getReadings')
        .then(response => response.json())
        .then(data => {
            if (data.initialGVS) {
                document.getElementById('initialGVS').value = data.initialGVS;
            }
            if (data.initialHVS) {
                document.getElementById('initialHVS').value = data.initialHVS;
            }
        })
        .catch(error => {
            console.error('Ошибка:', error);
        });
};
