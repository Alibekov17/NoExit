import React from "react";

export default function ProductCard({
  product,
  cartItem,
  onAddToCart,
  onRemoveFromCart,
  onOpenModal,
}) {
  return (
    <div className="product-card" onClick={() => onOpenModal(product)}>
      <div className="product-img-container">
        <img
          src={product.image_url || "https://via.placeholder.com/150"}
          alt={product.title}
          className="product-img"
        />
      </div>

      <div className="product-card-body">
        <h3 className="product-title">{product.title}</h3>

        <div className="product-specs">
          {product.brand && <span>{product.brand}</span>}
          {product.memory && <span> • {product.memory}</span>}
        </div>

        <div className="price-section">
          <span className="price-current">{product.price} сом</span>
        </div>

        <div className="card-buyer-actions">
          {cartItem ? (
            <div className="cart-item-quantity card-qty">
              <button
                className="qty-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFromCart(product.id);
                }}
              >
                −
              </button>
              <span className="qty-count">{cartItem.quantity}</span>
              <button
                className="qty-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(product);
                }}
              >
                +
              </button>
            </div>
          ) : (
            <button
              className="btn-stylish btn-stylish-primary btn-full-card"
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
            >
              🛒 В корзину
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
