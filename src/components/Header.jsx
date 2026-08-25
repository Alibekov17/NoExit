import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const [clickCount, setClickCount] = useState(0);
  const timeoutRef = useRef(null);

  // Обработчик кликов: нужно нажать 5 раз
  const handleLogoClick = (e) => {
    e.preventDefault(); // отменяем стандартный переход по ссылке на время кликов

    // Очищаем предыдущий таймер сброса
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const nextCount = clickCount + 1;

    if (nextCount >= 5) {
      // Сбрасываем счетчик и переходим в админку
      setClickCount(0);
      navigate('/admin');
    } else {
      setClickCount(nextCount);
      
      // Если в течение 500мс нет новых кликов — сбрасываем счетчик
      timeoutRef.current = setTimeout(() => {
        setClickCount(0);
      }, 500);
    }
  };

  return (
    <header className="site-header">
      <div className="header-container">
        {/* Логотип со скрытым переходом в админку по 5 кликам */}
        <Link 
          to="/" 
          className="header-logo" 
          onClick={handleLogoClick}
          title="Главная"
        >
          <span className="logo-no">NO</span> <span className="logo-exit">EXIT</span>
        </Link>

        {/* Иконка профиля в правом углу */}
        <div className="header-right-actions">
          <Link to="/profile" className="profile-icon-btn" title="Профиль">
            <User size={22} />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;