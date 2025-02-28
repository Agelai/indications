document.getElementById('readingsForm').addEventListener('submit', function(event) {
    event.preventDefault();

    app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

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

    fetch('/saveReadings', {
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
    fetch('/getReadings')
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
