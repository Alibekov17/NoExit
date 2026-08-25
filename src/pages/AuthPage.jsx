import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, Phone } from 'lucide-react';
import './AuthPage.css';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Вход
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        alert('Успешный вход!');
        navigate('/profile');
      } else {
        // Регистрация
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        // Создаем запись в таблице профилей/подписок
        if (data.user) {
          await supabase.from('subscriptions').insert([
            { id: data.user.id, email, phone, is_premium: false }
          ]);
        }

        alert('Регистрация прошла успешно! Проверьте почту для подтверждения (если требуется).');
        navigate('/profile');
      }
    } catch (error) {
      alert('Ошибка: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card ios-glass">
        <div className="auth-header">
          <Shield size={36} className="auth-logo-icon" />
          <h2>{isLogin ? 'Вход в NO EXIT' : 'Создать аккаунт'}</h2>
          <p>{isLogin ? 'Войдите, чтобы смотреть любимое кино' : 'Зарегистрируйтесь и получите доступ к каталогу'}</p>
        </div>

        <form onSubmit={handleAuth} className="auth-form">
          <div className="ios-input-group">
            <Mail size={18} />
            <input 
              type="email" 
              placeholder="Email адрес" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="ios-input-group">
            <Lock size={18} />
            <input 
              type="password" 
              placeholder="Пароль" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          {!isLogin && (
            <div className="ios-input-group">
              <Phone size={18} />
              <input 
                type="text" 
                placeholder="Номер телефона" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
              />
            </div>
          )}

          <button type="submit" className="ios-button-primary" disabled={loading}>
            {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
          </button>
        </form>

        <div className="auth-switch">
          <button onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;