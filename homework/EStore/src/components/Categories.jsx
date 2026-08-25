import React from 'react';

export default function Categories({ 
  currentCategory, 
  currentBrand, 
  availableBrands, 
  onSelectCategory, 
  onSelectBrand 
}) {
  const categoriesList = [
    { id: 'all', label: '⚡ Все товары' },
    { id: 'laptops', label: '💻 Ноутбуки' },
    { id: 'computers', label: '🖥️ Компьютеры' },
    { id: 'phones', label: '📱 Телефоны' },
  ];

  return (
    <div className="categories-section">
      <div className="categories">
        {categoriesList.map((cat) => (
          <button
            key={cat.id}
            className={`cat-btn ${currentCategory === cat.id ? 'active' : ''}`}
            onClick={() => onSelectCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {currentCategory !== 'all' && availableBrands.length > 0 && (
        <div className="brands-panel">
          {availableBrands.map((brand) => (
            <span
              key={brand}
              className={`brand-chip ${currentBrand === brand ? 'active' : ''}`}
              onClick={() => onSelectBrand(brand)}
            >
              {brand}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}