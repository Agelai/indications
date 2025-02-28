function calculateAndSave() {
    // Получаем значения из полей ввода
    const initialHotWater = parseFloat(document.getElementById('initialHotWater').value);
    const currentHotWater = parseFloat(document.getElementById('currentHotWater').value);
    const initialColdWater = parseFloat(document.getElementById('initialColdWater').value);
    const currentColdWater = parseFloat(document.getElementById('currentColdWater').value);

    // Рассчитываем расход
    const hotWaterUsage = currentHotWater - initialHotWater;
    const coldWaterUsage = currentColdWater - initialColdWater;

    // Отображаем результат
    document.getElementById('hotWaterUsage').textContent = `Расход ГВС: ${hotWaterUsage.toFixed(2)}`;
    document.getElementById('coldWaterUsage').textContent = `Расход ХВС: ${coldWaterUsage.toFixed(2)}`;

    // Сохраняем текущие показания как начальные для следующего использования
    localStorage.setItem('initialHotWater', currentHotWater);
    localStorage.setItem('initialColdWater', currentColdWater);
}

// Загрузка сохраненных данных при открытии Web App
window.onload = function () {
    const savedInitialHotWater = localStorage.getItem('initialHotWater');
    const savedInitialColdWater = localStorage.getItem('initialColdWater');

    if (savedInitialHotWater) {
        document.getElementById('initialHotWater').value = savedInitialHotWater;
    }
    if (savedInitialColdWater) {
        document.getElementById('initialColdWater').value = savedInitialColdWater;
    }
};
