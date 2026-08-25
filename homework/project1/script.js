// Тестовая база данных товаров
const productsData = [
    {
        id: 1,
        title: "Кроссовки PUMA Softride Enzo 5 Slip Tech",
        brand: "PUMA",
        price: 7048.11,
        oldPrice: 10692.36,
        discount: "-34%",
        img: "https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_600,h_600/global/378258/01/sv01/fnd/EEA/fmt/png"
    },
    {
        id: 2,
        title: "Кроссовки Nike Air Max Motion",
        brand: "Nike",
        price: 8500.00,
        oldPrice: 12000.00,
        discount: "-29%",
        img: "https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_600,h_600/global/377048/01/mod01/fnd/PNA/fmt/png"
    },
    {
        id: 3,
        title: "Спортивные кроссовки Adidas Runfalcon",
        brand: "Adidas",
        price: 5400.00,
        oldPrice: 8000.00,
        discount: "-32%",
        img: "https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_600,h_600/global/376676/01/sv01/fnd/PNA/fmt/png"
    }
];

// Глобальное состояние приложения
let cart = {};
let favorites = new Set();

// Получение элементов DOM
const productsGrid = document.getElementById('productsGrid');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const cartBadge = document.getElementById('cartBadge');
const favBadge = document.getElementById('favBadge');

// Функция рендеринга карточек товаров
function renderProducts(products) {
    productsGrid.innerHTML = '';
    
    if (products.length === 0) {
        productsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-gray);">Товары не найдены</p>';
        return;
    }

    products.forEach(product => {
        const isInCart = cart[product.id] && cart[product.id] > 0;
        const isFav = favorites.has(product.id);

        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="card-actions">
                <button class="action-icon favorite ${isFav ? 'active' : ''}" onclick="toggleFavorite(${product.id}, this)">
                    <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                </button>
                <button class="action-icon" onclick="shareProduct('${product.title}')">
                    <i class="fa-solid fa-share-nodes"></i>
                </button>
            </div>
            <img src="${product.img}" alt="${product.title}" class="product-img">
            <div class="price-block">
                <span class="current-price">${product.price.toFixed(2)} c</span>
                <span class="old-price">${product.oldPrice.toFixed(2)} c</span>
                <span class="discount">${product.discount}</span>
            </div>
            <div class="product-title">${product.title}</div>
            
            <div class="cart-control">
                <button class="add-to-cart-btn" style="display: ${isInCart ? 'none' : 'block'};" onclick="addToCart(${product.id}, this)">В корзину</button>
                <div class="quantity-counter" style="display: ${isInCart ? 'grid' : 'none'};">
                    <button class="counter-btn" onclick="changeQuantity(${product.id}, -1, this)">-</button>
                    <span class="counter-value">${cart[product.id] || 0}</span>
                    <button class="counter-btn" onclick="changeQuantity(${product.id}, 1, this)">+</button>
                </div>
            </div>
        `;
        productsGrid.appendChild(card);
    });
}

// Логика фильтрации и поиска
function filterProducts() {
    const searchText = searchInput.value.toLowerCase();
    const checkedBrands = Array.from(document.querySelectorAll('.brand-filter:checked')).map(cb => cb.value);

    const filtered = productsData.filter(product => {
        const matchesSearch = product.title.toLowerCase().includes(searchText);
        const matchesBrand = checkedBrands.length === 0 || checkedBrands.includes(product.brand);
        return matchesSearch && matchesBrand;
    });

    renderProducts(filtered);
}

// Добавление товара в корзину (первый клик)
function addToCart(id, btn) {
    cart[id] = 1;
    const controlDiv = btn.nextElementSibling;
    btn.style.display = 'none';
    controlDiv.style.display = 'grid';
    controlDiv.querySelector('.counter-value').textContent = 1;
    updateBadges();
}

// Изменение количества товара (+/-)
function changeQuantity(id, delta, btn) {
    cart[id] = (cart[id] || 0) + delta;
    const counterValueSpan = btn.parentElement.querySelector('.counter-value');
    
    if (cart[id] <= 0) {
        delete cart[id];
        const addToCartBtn = btn.parentElement.previousElementSibling;
        btn.parentElement.style.display = 'none';
        addToCartBtn.style.display = 'block';
    } else {
        counterValueSpan.textContent = cart[id];
    }
    updateBadges();
}

// Добавление / Удаление из избранного
function toggleFavorite(id, btn) {
    const icon = btn.querySelector('i');
    if (favorites.has(id)) {
        favorites.delete(id);
        btn.classList.remove('active');
        icon.className = 'fa-regular fa-heart';
    } else {
        favorites.add(id);
        btn.classList.add('active');
        icon.className = 'fa-solid fa-heart';
    }
    updateBadges();
}

// Функция "Поделиться"
function shareProduct(title) {
    if (navigator.share) {
        navigator.share({
            title: title,
            text: `Посмотри на этот товар: ${title}`,
            url: window.location.href
        }).catch(console.error);
    } else {
        // Если браузер не поддерживает Web Share API, имитируем копирование
        alert(`Ссылка на товар скопирована: ${title}`);
    }
}

// Обновление счетчиков в шапке сайта
function updateBadges() {
    const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
    cartBadge.textContent = totalItems;
    favBadge.textContent = favorites.size;
}

// Навешивание слушателей событий
searchBtn.addEventListener('click', filterProducts);
searchInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') filterProducts(); });
document.querySelectorAll('.brand-filter').forEach(cb => cb.addEventListener('change', filterProducts));

// Инициализация первой отрисовки при загрузке страницы
renderProducts(productsData);