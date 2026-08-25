import React from "react";

export default function ProductModal({ product, onClose, onAddToCart }) {
  if (!product) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="product-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          ✕
        </button>

        <div className="modal-grid">
          <div className="modal-img-container">
            <img
              src={product.image_url || "https://via.placeholder.com/250"}
              alt={product.title}
            />
          </div>

          <div className="modal-info">
            <h2>{product.title}</h2>
            <div className="modal-price">{product.price} сом</div>

            <div className="modal-details">
              {product.brand && <p><strong>Бренд:</strong> {product.brand}</p>}
              {product.model && <p><strong>Модель:</strong> {product.model}</p>}
              {product.memory && <p><strong>Память:</strong> {product.memory}</p>}
              {product.color && <p><strong>Цвет:</strong> {product.color}</p>}
            </div>

            <button
              className="btn-stylish btn-stylish-primary btn-full"
              style={{ marginTop: "16px" }}
              onClick={() => {
                onAddToCart(product);
                onClose();
              }}
            >
              🛒 В корзину
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}