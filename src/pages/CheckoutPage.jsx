import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { QrCode, ShieldCheck, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const [searchParams] = useSearchParams();
  const months = parseInt(searchParams.get('months') || '1');

  // Динамический расчет стоимости в зависимости от выбранного периода
  const getPrice = (m) => {
    switch (m) {
      case 3: return 12.99;
      case 6: return 22.99;
      case 12: return 39.99;
      default: return 4.99; // 1 месяц
    }
  };

  const price = getPrice(months);

  const getTariffTitle = (m) => {
    switch (m) {
      case 3: return 'Квартальный (3 месяца)';
      case 6: return 'Полугодовой (6 месяцев)';
      case 12: return 'Годовой (12 месяцев)';
      default: return 'Месячный (1 месяц)';
    }
  };

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }
    setUser(session.user);
  };

  const handlePaymentSuccess = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { error } = await supabase.rpc('top_up_and_subscribe', {
        user_id: user.id,
        amount: price,
        months_to_add: months
      });

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        navigate('/profile');
      }, 2500);
    } catch (error) {
      alert('Ошибка при активации подписки: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-container ios-glass">
        
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Назад
        </button>

        {success ? (
          <div className="success-box">
            <CheckCircle2 size={64} className="success-icon" />
            <h2>Оплата прошла успешно!</h2>
            <p>Премиум-подписка активирована. Перенаправление в профиль...</p>
          </div>
        ) : (
          <>
            <div className="checkout-header">
              <h2>Оплата подписки</h2>
              <p>Тариф: <strong>{getTariffTitle(months)}</strong></p>
              <div className="checkout-price">${price}</div>
            </div>

            <div className="qr-section">
              <div className="qr-wrapper">
                <div className="qr-mock">
                  <QrCode size={140} color="#fff" />
                </div>
              </div>
              <p className="qr-hint">Отсканируйте QR-код через приложение банка для оплаты</p>
            </div>

            <div className="payment-features">
              <div className="feat-item"><ShieldCheck size={16} /> Безопасное соединение 256-bit</div>
              <div className="feat-item">⚡ Автоматическое зачисление средств</div>
            </div>

            <button 
              className="ios-button-primary pay-btn" 
              onClick={handlePaymentSuccess}
              disabled={loading}
            >
              {loading ? <Loader2 className="spinner" size={20} /> : `Я оплатил ($${price})`}
            </button>
          </>
        )}

      </div>
    </div>
  );
};

export default CheckoutPage;