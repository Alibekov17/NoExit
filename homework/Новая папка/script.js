const modal = document.getElementById('addProductModal');
const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const addProductForm = document.getElementById('addProductForm');
const productsGrid = document.getElementById('productsGrid');

// HTML шаблон для кнопок управления
function createActionButtons() {
    return `
        <div class="product-actions">
            <button class="btn-action btn-edit" title="Редактировать">✏️</button>
            <button class="btn-action btn-delete" title="Удалить">🗑️</button>
        </div>
    `;
}

// Инициализация кнопок для стартовых товаров на витрине
document.querySelectorAll('.product-card').forEach(card => {
    card.insertAdjacentHTML('afterbegin', createActionButtons());
});

// Модальное окно (Открыть/Закрыть)
openModalBtn.addEventListener('click', () => modal.classList.add('active'));
closeModalBtn.addEventListener('click', () => modal.classList.remove('active'));
window.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
});

// Управление кликами (Удаление и Редактирование текста)
productsGrid.addEventListener('click', (event) => {
    
    // ЛОГИКА УДАЛЕНИЯ
    if (event.target.classList.contains('btn-delete')) {
        const card = event.target.closest('.product-card');
        if (confirm('Вы действительно хотите удалить этот товар из F10?')) {
            card.remove();
        }
    }

    // ЛОГИКА РЕДАКТИРОВАНИЯ
    if (event.target.classList.contains('btn-edit')) {
        const card = event.target.closest('.product-card');
        const titleElement = card.querySelector('.product-title');
        const priceElement = card.querySelector('.product-price');

        const currentTitle = titleElement.textContent;
        const currentPrice = priceElement.textContent.replace(/[^0-9]/g, '');

        const newTitle = prompt('Введите новое название товара:', currentTitle);
        if (newTitle === null) return;

        const newPrice = prompt('Введите новую цену товара:', currentPrice);
        if (newPrice === null) return;

        if (newTitle.trim() !== '') titleElement.textContent = newTitle;
        if (newPrice.trim() !== '' && !isNaN(newPrice)) {
            priceElement.textContent = Number(newPrice).toLocaleString('ru-RU') + ' ₽';
        }
    }
});

// ОБРАБОТКА СУБМИТА ФОРМЫ (Создание товара с картинкой)
addProductForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = document.getElementById('prodName').value;
    const price = document.getElementById('prodPrice').value;
    const imageFile = document.getElementById('prodImage').files[0]; // Получаем выбранный файл

    const formattedPrice = Number(price).toLocaleString('ru-RU') + ' ₽';

    // Читаем файл изображения
    const reader = new FileReader();
    
    reader.onload = function(e) {
        // e.target.result — это временный закодированный адрес нашей загруженной картинки
        const imageUrl = e.target.result;

        // Создаем карточку товара
        const newCard = document.createElement('div');
        newCard.className = 'product-card';
        newCard.innerHTML = `
            ${createActionButtons()}
            <div class="product-image">
                <img src="${imageUrl}" alt="${name}">
            </div>
            <div class="product-info">
                <div class="product-price">${formattedPrice}</div>
                <div class="product-title">${name}</div>
                <button class="btn-cart">В корзину</button>
            </div>
        `;

        // Размещаем в начале списка каталога
        productsGrid.insertBefore(newCard, productsGrid.firstChild);

        // Сброс формы и закрытие окна
        addProductForm.reset();
        modal.classList.remove('active');
    };

    // Запускаем процесс чтения картинки
    if (imageFile) {
        reader.readAsDataURL(imageFile);
    }
});