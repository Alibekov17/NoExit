import React, { useState, useEffect, useRef } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { supabase } from "./Supabase";
import ProductCard from "./components/ProductCard";
import ProductModal from "./components/ProductModal";
import AuthModal from "./components/AuthModal";
import AdminSellers from './components/AdminSellers';
import CartPage from "./pages/CartPage";
import AdminPage from "./pages/AdminPage";
import "./App.css";

import {
  fetchCartItems,
  addToCartDb,
  removeFromCartDb,
  clearCartDb,
} from "./services/cartService";

export default function App() {
  // --- Состояния авторизации ---
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // --- Состояния товаров и корзины ---
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("all");
  const [brand, setBrand] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const searchRef = useRef(null);

  // --- Проверка сессии авторизации Supabase ---
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // --- Загрузка товаров из базы ---
  const fetchProducts = async () => {
    let query = supabase.from("products").select("*");
    if (category !== "all") query = query.eq("category", category);
    if (brand) query = query.eq("brand", brand);

    const { data, error } = await query;
    if (!error) setProducts(data || []);
  };

  // --- Загрузка корзины из базы ---
  const loadCart = async () => {
    const items = await fetchCartItems();
    setCart(items);
  };

  useEffect(() => {
    fetchProducts();
  }, [category, brand]);

  useEffect(() => {
    loadCart();
  }, []);

  // --- Обработка клика вне поиска ---
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Обработчики корзины ---
  const handleAddToCart = async (product) => {
    await addToCartDb(product);
    await loadCart();
  };

  const handleRemoveFromCart = async (productId) => {
    const item = cart.find(
      (c) => c.id === productId || c.productId === productId
    );
    if (item) {
      await removeFromCartDb(item);
      await loadCart();
    }
  };

  const handleClearCart = async () => {
    await clearCartDb();
    setCart([]);
  };

  const filteredProducts = products.filter((p) =>
    p.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const availableBrands = [
    ...new Set(products.map((p) => p.brand).filter(Boolean)),
  ];

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-top">
          <Link to="/" className="brand-logo">
            ALIBEKOVTECH
          </Link>

          {/* Панель поиска */}
          <div className="search-bar" ref={searchRef}>
            <input
              className="search-input"
              placeholder="Поиск товаров..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
            />

            {isSearchOpen && searchQuery.trim().length > 0 && (
              <div className="search-dropdown">
                {filteredProducts.length > 0 ? (
                  filteredProducts.slice(0, 5).map((product) => (
                    <div
                      key={product.id}
                      className="search-dropdown-item"
                      onClick={() => {
                        setSelectedProduct(product);
                        setIsSearchOpen(false);
                      }}
                    >
                      <img
                        src={
                          product.image_url ||
                          "https://via.placeholder.com/40"
                        }
                        alt={product.title}
                        className="search-item-img"
                      />
                      <div className="search-item-info">
                        <span className="search-item-title">
                          {product.title}
                        </span>
                        <span className="search-item-price">
                          {product.price} сом
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="search-dropdown-empty">
                    Ничего не найдено
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Действия в шапке (Авторизация + Корзина) */}
          <div className="header-actions">
            {user ? (
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{ fontSize: "12px", fontWeight: "600" }}>
                  {user.user_metadata?.role === "admin"
                    ? "👑 Админ"
                    : "👤 " + (user.email ? user.email.split("@")[0] : "Пользователь")}
                </span>

                {user.user_metadata?.role === "admin" && (
                  <Link
                    to="/admin"
                    className="btn-stylish btn-stylish-outline"
                    style={{ fontSize: "12px", padding: "6px 12px" }}
                  >
                    ⚙️ Админка
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="btn-stylish btn-stylish-outline"
                  style={{ fontSize: "12px", padding: "6px 12px" }}
                >
                  Выйти
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="btn-stylish btn-stylish-primary"
                style={{ fontSize: "12px", padding: "6px 14px" }}
              >
                👤 Войти
              </button>
            )}

            <Link to="/cart" className="cart-badge-link">
              🛒 Корзина ({cart.reduce((a, b) => a + b.quantity, 0)})
            </Link>
          </div>
        </div>

        {/* Навигация категорий */}
        <div className="category-nav">
          <span
            className={`cat-item ${category === "all" ? "active" : ""}`}
            onClick={() => setCategory("all")}
          >
            Все
          </span>
          <span
            className={`cat-item ${category === "laptops" ? "active" : ""}`}
            onClick={() => setCategory("laptops")}
          >
            Ноутбуки
          </span>
          <span
            className={`cat-item ${category === "phones" ? "active" : ""}`}
            onClick={() => setCategory("phones")}
          >
            Телефоны
          </span>
          <span
            className={`cat-item ${category === "computers" ? "active" : ""}`}
            onClick={() => setCategory("computers")}
          >
            Компьютеры
          </span>
        </div>
      </header>

      {/* Маршрутизация страниц */}
      <Routes>
        <Route
          path="/"
          element={
            <div className="main-container">
              <aside className="filters-sidebar">
                <h3 className="filter-title">Фильтры</h3>
                <div className="filter-group">
                  <label className="filter-label">Бренд</label>
                  <button
                    className={`filter-btn ${brand === "" ? "active" : ""}`}
                    onClick={() => setBrand("")}
                  >
                    Все бренды
                  </button>
                  {availableBrands.map((b) => (
                    <button
                      key={b}
                      className={`filter-btn ${brand === b ? "active" : ""}`}
                      onClick={() => setBrand(b)}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </aside>

              <main className="products-content">
                <div className="products-grid">
                  {filteredProducts.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      cartItem={cart.find(
                        (item) => item.id === p.id || item.productId === p.id
                      )}
                      onAddToCart={handleAddToCart}
                      onRemoveFromCart={handleRemoveFromCart}
                      onOpenModal={(prod) => setSelectedProduct(prod)}
                    />
                  ))}
                </div>
              </main>
            </div>
          }
        />
        <Route
          path="/cart"
          element={
            <CartPage
              cart={cart}
              onAddToCart={handleAddToCart}
              onRemoveFromCart={handleRemoveFromCart}
              onClearCart={handleClearCart}
            />
          }
        />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>

      {/* Модальное окно просмотра товара */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Модальное окно авторизации */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(userData) => setUser(userData)}
      />
    </div>
  );
}