import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { User, Crown, CreditCard, Phone, Mail, LogOut, CheckCircle, Clock, X, RefreshCw, Heart, Bookmark, Film } from 'lucide-react';
import './ProfilePage.css';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [fullName, setFullName] = useState('');
  const [selectedBank, setSelectedBank] = useState('MBANK (Мбанк)');
  const [receiptFile, setReceiptFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [successNotification, setSuccessNotification] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('/qr-code.png');
  const [userPayments, setUserPayments] = useState([]);

  // Состояния для лайков и сохраненного (закладок)
  const [favorites, setFavorites] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);

  const navigate = useNavigate();

  const kyrgyzBanks = [
    'MBANK (Мбанк)',
    'O!Dengi (О! Деньги)',
    'Optima Bank (Оптима)',
    'Bakai Bank (Бакай)',
    'DemirBank (Демир)',
    'RSK Bank (РСК)',
    'Companion Bank (Компаньон)'
  ];

  const plans = [
    { months: 1, price: 299, label: '1 месяц' },
    { months: 3, price: 799, label: '3 месяца' },
    { months: 6, price: 1499, label: '6 месяцев' },
    { months: 12, price: 2799, label: '12 месяцев' },
  ];

  useEffect(() => {
    fetchUserData();
    fetchCurrentQrCode();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      setUser(session.user);

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (!error && data) {
        setProfile(data);
      }

      const { data: paymentsData } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', session.user.id)
        .order('payment_time', { ascending: false });

      if (paymentsData) {
        setUserPayments(paymentsData);
      }

      // Загрузка лайков (избранного) пользователя из SQL
      const { data: favData } = await supabase
        .from('user_favorites')
        .select('*, banners(*)')
        .eq('user_id', session.user.id);
      if (favData) {
        setFavorites(favData.map(item => item.banners || item));
      }

      // Загрузка закладок (сохраненных) пользователя из SQL
      const { data: bookData } = await supabase
        .from('user_bookmarks')
        .select('*, banners(*)')
        .eq('user_id', session.user.id);
      if (bookData) {
        setBookmarks(bookData.map(item => item.banners || item));
      }

    } catch (err) {
      console.error('Ошибка загрузки данных профиля:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentQrCode = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'admin_qr_code')
        .single();

      if (!error && data && data.value) {
        setQrCodeUrl(data.value);
      }
    } catch (err) {
      console.log('Используется стандартный QR-код системы');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setShowQrModal(true);
    setSuccessNotification(false);
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    if (!fullName || !receiptFile || !selectedPlan) {
      alert('Пожалуйста, заполните ФИО и прикрепите чек');
      return;
    }

    setSubmitting(true);

    try {
      const fileExt = receiptFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `receipts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('payment_receipts')
        .upload(filePath, receiptFile);

      if (uploadError) throw uploadError;

      const { data: publicURLData } = supabase.storage
        .from('payment_receipts')
        .getPublicUrl(filePath);

      const receiptUrl = publicURLData.publicUrl;
      const paymentTime = new Date().toISOString();

      const paymentPayload = {
        user_id: user.id,
        email: user.email,
        full_name: fullName,
        bank: selectedBank,
        months: selectedPlan.months,
        amount: selectedPlan.price,
        receipt_url: receiptUrl,
        payment_time: paymentTime,
        status: 'pending'
      };

      const { error: dbError } = await supabase.from('payments').insert([paymentPayload]);
      if (dbError) throw dbError;

      await supabase.from('deposit_requests').insert([paymentPayload]);

      setSuccessNotification(true);
      setFullName('');
      setReceiptFile(null);
      
      fetchUserData();

      setTimeout(() => {
        setShowQrModal(false);
        setSuccessNotification(false);
      }, 4000);

    } catch (error) {
      console.error('Ошибка отправки платежа:', error.message);
      alert('Произошла ошибка при отправке. Попробуйте еще раз.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="profile-loading">Загрузка профиля...</div>;

  const isPremActive = profile?.is_premium && profile?.subscription_expires_at && new Date(profile.subscription_expires_at) > new Date();

  return (
    <div className="profile-page">
      <div className="profile-container">
        
        <div className="profile-hero ios-glass">
          <div className="profile-avatar">
            <User size={40} />
          </div>
          <div className="profile-main-info">
            <h2>{user?.email}</h2>
            <span className={`status-badge ${isPremActive ? 'active' : 'inactive'}`}>
              {isPremActive ? <CheckCircle size={14} /> : <Crown size={14} />}
              {isPremActive ? 'Премиум активен' : 'Стандартный аккаунт'}
            </span>
          </div>
        </div>

        <div className="profile-section ios-glass">
          <h3>Личные данные</h3>
          <div className="info-row">
            <div className="info-label"><Mail size={16} /> Email</div>
            <div className="info-value">{user?.email}</div>
          </div>
          <div className="info-row">
            <div className="info-label"><Phone size={16} /> Телефон</div>
            <div className="info-value">{profile?.phone || 'Не указан'}</div>
          </div>
        </div>

        {/* Секция: Избранное (Лайки) */}
        <div className="profile-section ios-glass">
          <h3><Heart size={18} color="#ff3b30" /> Избранные фильмы (Лайки)</h3>
          {favorites.length > 0 ? (
            <div className="profile-movies-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px', marginTop: '12px' }}>
              {favorites.map((movie) => (
                <Link to={`/movie/${movie.id || movie.movie_id}`} key={movie.id} style={{ textDecoration: 'none', color: '#fff' }}>
                  <div style={{ background: '#1c1c1e', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <img src={movie.image} alt={movie.title} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                    <div style={{ padding: '8px', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{movie.title}</div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="no-payments" style={{ marginTop: '10px' }}>Вы еще ничего не добавили в избранное.</p>
          )}
        </div>

        {/* Секция: Сохраненное (Закладки) */}
        <div className="profile-section ios-glass">
          <h3><Bookmark size={18} color="#0a84ff" /> Сохраненные фильмы (Закладки)</h3>
          {bookmarks.length > 0 ? (
            <div className="profile-movies-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px', marginTop: '12px' }}>
              {bookmarks.map((movie) => (
                <Link to={`/movie/${movie.id || movie.movie_id}`} key={movie.id} style={{ textDecoration: 'none', color: '#fff' }}>
                  <div style={{ background: '#1c1c1e', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <img src={movie.image} alt={movie.title} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                    <div style={{ padding: '8px', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{movie.title}</div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="no-payments" style={{ marginTop: '10px' }}>У вас нет сохраненных фильмов.</p>
          )}
        </div>

        <div className="profile-section ios-glass">
          <h3>Управление премиумом</h3>
          <div className="subscription-box">
            <div className="sub-status-text">
              {isPremActive ? (
                <p>Действует до: <strong>{new Date(profile.subscription_expires_at).toLocaleDateString()}</strong></p>
              ) : (
                <p>Выберите срок подписки для доступа ко всем фильмам:</p>
              )}
            </div>

            <div className="sub-buttons-grid grid-4">
              {plans.map((plan) => (
                <button 
                  key={plan.months} 
                  onClick={() => handleSelectPlan(plan)} 
                  className={`ios-btn-sub ${plan.months === 12 ? 'highlight' : ''}`}
                >
                  <span className="plan-label">{plan.label}</span>
                  <span className="plan-price">{plan.price} сом</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {showQrModal && selectedPlan && (
          <div className="modal-overlay">
            <div className="ios-glass modal-content">
              <button onClick={() => setShowQrModal(false)} className="modal-close-btn">
                <X size={20} />
              </button>
              
              {successNotification ? (
                <div className="success-banner">
                  <Clock size={40} color="#30d158" />
                  <h3>Чек успешно отправлен!</h3>
                  <p>Ожидайте подтверждение администратора. Подписка активируется в течение нескольких минут.</p>
                </div>
              ) : (
                <>
                  <h3>Оплата: {selectedPlan.label}</h3>
                  <p className="modal-price-text">К оплате: <strong>{selectedPlan.price} сом</strong></p>
                  
                  <div className="qr-container">
                    <img src={qrCodeUrl} alt="QR Код для оплаты" className="payment-qr-img" />
                    <p className="qr-hint">Отсканируйте QR-код через мобильное приложение банка для оплаты</p>
                  </div>

                  <form onSubmit={handleConfirmPayment} className="payment-modal-form">
                    <div className="form-group">
                      <label>ФИО владельца карты:</label>
                      <input 
                        type="text" 
                        placeholder="Иванов Иван Иванович" 
                        value={fullName} 
                        onChange={(e) => setFullName(e.target.value)} 
                        required 
                      />
                    </div>

                    <div className="form-group">
                      <label>Кыргызский банк:</label>
                      <select 
                        value={selectedBank} 
                        onChange={(e) => setSelectedBank(e.target.value)}
                      >
                        {kyrgyzBanks.map((bank, index) => (
                          <option key={index} value={bank}>{bank}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Прикрепите скриншот чека:</label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => setReceiptFile(e.target.files[0])} 
                        required 
                      />
                    </div>

                    <button type="submit" className="ios-btn-sub highlight submit-payment-btn" disabled={submitting}>
                      {submitting ? 'Отправка...' : 'Я оплатил'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        )}

        <div className="profile-section ios-glass">
          <div className="section-header-flex">
            <h3><CreditCard size={18} /> История платежей</h3>
            <button onClick={fetchUserData} className="refresh-btn" title="Обновить историю">
              <RefreshCw size={14} />
            </button>
          </div>
          
          <div className="payments-list">
            {userPayments.length > 0 ? (
              userPayments.map((item) => (
                <div key={item.id} className="payment-item">
                  <div className="pay-info">
                    <span className="pay-title">{item.months} мес. ({item.amount} сом) — {item.bank}</span>
                    <span className="pay-date"><Clock size={12} /> {new Date(item.payment_time).toLocaleString()}</span>
                  </div>
                  <span className={`pay-status ${item.status}`}>
                    {item.status === 'pending' ? 'Ожидает проверки' : item.status === 'approved' ? 'Подтвержден' : 'Отклонен'}
                  </span>
                </div>
              ))
            ) : (
              <p className="no-payments">У вас пока нет истории платежей.</p>
            )}
          </div>
        </div>

        <button onClick={handleLogout} className="ios-btn-logout">
          <LogOut size={16} /> Выйти из аккаунта
        </button>

      </div>
    </div>
  );
};

ProfilePage.displayName = "ProfilePage";
export default ProfilePage;