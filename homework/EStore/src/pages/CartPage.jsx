import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function CartPage({
  cart = [],
  onAddToCart,
  onRemoveFromCart,
  onClearCart,
}) {
  const [step, setStep] = useState("cart"); // "cart" | "card" | "sms" | "success"
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [smsCode, setSmsCode] = useState("");

  const totalPrice = cart.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );

  const handleCardSubmit = (e) => {
    e.preventDefault();
    const cleanNumber = cardNumber.replace(/\s/g, "");
    if (cleanNumber.length < 16) {
      alert("Введите корректный 16-значный номер карты");
      return;
    }
    setStep("sms");
  };

  const handleSmsSubmit = async (e) => {
    e.preventDefault();
    if (smsCode.trim().length !== 4) {
      alert("Введите 4-значный код из SMS");
      return;
    }
    if (onClearCart) await onClearCart();
    setStep("success");
  };

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1>🛒 Корзина</h1>
        <Link to="/" className="back-link">
          ← Назад в магазин
        </Link>
      </div>

      {cart.length === 0 && step !== "success" ? (
        <div className="cart-empty">
          <h2>Корзина пуста</h2>
          <p>Выберите товары в каталоге, чтобы оформить заказ.</p>
          <Link to="/" className="btn-stylish btn-stylish-primary">
            Перейти к покупкам
          </Link>
        </div>
      ) : step === "success" ? (
        <div className="cart-empty">
          <h2>🎉 Заказ успешно оплачен!</h2>
          <p>Мы отправляем ваш заказ. Спасибо за покупку!</p>
          <button
            className="btn-stylish btn-stylish-primary"
            onClick={() => setStep("cart")}
          >
            Вернуться в каталог
          </button>
        </div>
      ) : (
        <div className="cart-content">
          {/* Список товаров */}
          <div className="cart-items-list">
            {cart.map((item) => (
              <div key={item.id || item.productId} className="cart-item">
                <img
                  src={item.image_url || "https://via.placeholder.com/80"}
                  alt={item.title}
                  className="cart-item-img"
                />

                <div className="cart-item-info">
                  <h3 className="cart-item-title">{item.title}</h3>
                  <p className="cart-item-meta">
                    {item.brand} {item.memory && `• ${item.memory}`}
                  </p>
                  <span className="cart-item-price">{item.price} сом</span>
                </div>

                {/* Переключатель количества */}
                <div className="cart-item-quantity">
                  <button
                    className="qty-btn"
                    onClick={() => onRemoveFromCart(item.id || item.productId)}
                  >
                    −
                  </button>
                  <span className="qty-count">{item.quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => onAddToCart(item)}
                  >
                    +
                  </button>
                </div>

                <div className="cart-item-total">
                  {item.price * item.quantity} сом
                </div>
              </div>
            ))}
          </div>

          {/* Панель оформления заказа */}
          <div className="cart-summary">
            <h3>Итого</h3>

            <div className="summary-row">
              <span>
                Товары ({cart.reduce((a, b) => a + b.quantity, 0)} шт)
              </span>
              <span>{totalPrice} сом</span>
            </div>

            <div className="summary-row">
              <span>Доставка</span>
              <span className="free-text">Бесплатно</span>
            </div>

            <hr className="summary-divider" />

            <div className="summary-row summary-total">
              <span>К оплате:</span>
              <span>{totalPrice} сом</span>
            </div>

            {/* Шаг 1: Кнопка "Оформить" */}
            {step === "cart" && (
              <button
                className="btn-stylish btn-stylish-primary btn-full"
                onClick={() => setStep("card")}
              >
                Оформить товар
              </button>
            )}

            {/* Шаг 2: Ввод данных карты */}
            {step === "card" && (
              <form onSubmit={handleCardSubmit} className="checkout-form">
                <h4>💳 Оплата картой</h4>
                <input
                  type="text"
                  placeholder="Номер карты (16 цифр)"
                  maxLength="16"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="form-input"
                  required
                />
                <div className="form-grid-2">
                  <input
                    type="text"
                    placeholder="ММ/ГГ"
                    maxLength="5"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="form-input"
                    required
                  />
                  <input
                    type="password"
                    placeholder="CVC/CVV"
                    maxLength="3"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn-stylish btn-stylish-primary btn-full"
                >
                  Получить SMS-код
                </button>
                <button
                  type="button"
                  className="btn-stylish btn-stylish-outline btn-full"
                  onClick={() => setStep("cart")}
                >
                  Отмена
                </button>
              </form>
            )}

            {/* Шаг 3: Ввод SMS кода */}
            {step === "sms" && (
              <form onSubmit={handleSmsSubmit} className="checkout-form">
                <h4>📩 Подтверждение</h4>
                <p className="sms-note">
                  Код отправлен на номер, привязанный к вашей карте.
                </p>
                <input
                  type="text"
                  placeholder="Код из SMS (например, 7788)"
                  maxLength="4"
                  value={smsCode}
                  onChange={(e) => setSmsCode(e.target.value)}
                  className="form-input sms-input"
                  required
                />
                <button
                  type="submit"
                  className="btn-stylish btn-stylish-primary btn-full"
                >
                  Подтвердить и оплатить
                </button>
                <button
                  type="button"
                  className="btn-stylish btn-stylish-outline btn-full"
                  onClick={() => setStep("card")}
                >
                  Назад к карте
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}