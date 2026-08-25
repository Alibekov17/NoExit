import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Film, Tv, Smile, Skull, Flame } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <aside className="sidebar-left-hover">
      <div className="sidebar-content">
        <div className="sidebar-links">
          <Link to="/" className="sidebar-item" title="Главная">
            <Home size={20} />
            <span className="nav-text">Главная</span>
          </Link>
          <Link to="/Catalog" className="sidebar-item" title="Каталог">
            <Film size={20} />
            <span className="nav-text">Каталог</span>
          </Link>
          
          <div className="sidebar-divider"></div>
          
          <Link to="/films" className="sidebar-item" title="Фильмы">
            <Film size={20} />
            <span className="nav-text">Фильмы</span>
          </Link>
          <Link to="/series" className="sidebar-item" title="Сериалы">
            <Tv size={20} />
            <span className="nav-text">Сериалы</span>
          </Link>
          <Link to="/cartoons" className="sidebar-item" title="Мультфильмы">
            <Smile size={20} />
            <span className="nav-text">Мультфильмы</span>
          </Link>
          <Link to="/horror" className="sidebar-item" title="Хоррор">
            <Skull size={20} />
            <span className="nav-text">Хоррор</span>
          </Link>
          <Link to="/action" className="sidebar-item" title="Боевики">
            <Flame size={20} />
            <span className="nav-text">Боевики</span>
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;