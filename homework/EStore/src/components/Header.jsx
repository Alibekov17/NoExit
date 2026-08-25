import React from 'react';
import { Link } from 'react-router-dom';

export default function Header({ cartCount, onOpenModal }) {
  return (
    <header className="header">
      <Link to="/" className="logo">
        E<span>STORE</span>
      </Link>

      <div className="header-right">
        <Link to="/cart" className="cart-icon-btn">
          🛒
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </Link>
        <button className="btn-add" onClick={onOpenModal}>
          + Добавить товар
        </button>
      </div>
    </header>
  );
}