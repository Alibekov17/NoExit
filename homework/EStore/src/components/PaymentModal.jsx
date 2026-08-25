import React, { useState, useEffect } from "react";
import { supabase } from "../Supabase";

export default function PaymentModal({ isOpen, onClose, totalAmount, onSuccess }) {
  const [savedCards, setSavedCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState("");
  
  // Данные новой/вводимой карты
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expDate, setExpDate] = useState("");
  const [cvv, setCvv] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // 1. Поиск и загрузка карт авторизованного пользователя
  useEffect(() => {
    if (isOpen) {
      fetchUserCards();
    }
  }, [isOpen]);

  const fetchUserCards = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("user_cards")
      .select("*")
      .eq("user_id", user.id);

    if (!error && data) {
      setSavedCards(data);
      if (data.length > 0) {
        setSelectedCardId(data[0].id); // По умолчанию выбираем первую карту
      }
    }
  };

  // 2. Алгоритм проверки правильности номера карты (Формула Луна)
  const validateCardNumber = (number) => {
    const cleanNumber = number.replace(/\D/g, "");
    if (cleanNumber.length < 13 || cleanNumber.length > 19) return false;

    let sum = 0;
    let shouldDouble = false;
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber.charAt(i), 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  };

  // 3. Обработка оплаты
  const handlePay = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      if (selectedCardId === "new") {
        // Если пользователь вводит новую карту
        if (!validateCardNumber(cardNumber)) {
          throw new Error("Некорректный номер карты. Проверьте введённые данные.");
        }

        if (cvv.length < 3) {
          throw new Error("Введите правильный CVC/CVV код.");
        }

        // При желании можно сохранить карту для будущих покупок
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const last4 = cardNumber.slice(-4);
          await supabase.from("user_cards").insert([
            {
              user_id: user.id,
              card_number: `•••• ${last4}`,
              card_holder: cardHolder || "Покупатель",
              exp_month: expDate.split("/")[0] || "12",
              exp_year: expDate.split("/")[1] || "28",
            },
          ]);
        }
      }

      // Имитация задержки проведения платежа через банк
      await new Promise((resolve) => setTimeout(resolve, 1500));

      alert(`Оплата на сумму ${totalAmount} сом прошла успешно!`);
      onSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Ошибка при проведении платежа");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="payment-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>✕</button>

        <h2>💳 Оплата заказа</h2>
        <p className="payment-total">К оплате: <b>{totalAmount} сом</b></p>

        {errorMsg && <div className="auth-error">{errorMsg}</div>}

        <form onSubmit={handlePay} className="auth-form">
          {/* Если есть сохранённые карты */}
          {savedCards.length > 0 && (
            <div className="auth-field">
              <label>Выберите карту для оплаты</label>
              <select
                value={selectedCardId}
                onChange={(e) => setSelectedCardId(e.target.value)}
              >
                {savedCards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.card_number} ({card.card_holder})
                  </option>
                ))}
                <option value="new">+ Использовать новую карту</option>
              </select>
            </div>
          )}

          {/* Ввод новой карты, если выбрано "новая" или у пользователя нет карт */}
          {(savedCards.length === 0 || selectedCardId === "new") && (
            <>
              <div className="auth-field">
                <label>Номер карты</label>
                <input
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  maxLength="19"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  required
                />
              </div>

              <div className="auth-field">
                <label>Имя и фамилия на карте</label>
                <input
                  type="text"
                  placeholder="IVAN IVANOV"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <div className="auth-field" style={{ flex: 1 }}>
                  <label>Срок (ММ/ГГ)</label>
                  <input
                    type="text"
                    placeholder="12/28"
                    maxLength="5"
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    required
                  />
                </div>

                <div className="auth-field" style={{ flex: 1 }}>
                  <label>CVV / CVC</label>
                  <input
                    type="password"
                    placeholder="123"
                    maxLength="3"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    required
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            className="btn-stylish btn-stylish-primary"
            style={{ marginTop: "10px" }}
            disabled={loading}
          >
            {loading ? "Обработка платежа..." : `Оплатить ${totalAmount} сом`}
          </button>
        </form>
      </div>
    </div>
  );
}