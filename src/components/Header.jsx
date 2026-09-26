import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const clickCountRef = useRef(0);
  const timeoutRef = useRef(null);

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  const handleLogoClick = (e) => {
    e.preventDefault();
    if (e.detail === 0) {
      clickCountRef.current = 0;
      navigate('/');
      return;
    }

    window.clearTimeout(timeoutRef.current);
    clickCountRef.current += 1;

    if (clickCountRef.current >= 5) {
      clickCountRef.current = 0;
      navigate('/admin');
    } else {
      navigate('/');
      timeoutRef.current = window.setTimeout(() => {
        clickCountRef.current = 0;
      }, 1400);
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