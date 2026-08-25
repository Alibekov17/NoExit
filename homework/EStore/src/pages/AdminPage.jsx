import React, { useState, useEffect } from "react";
import { supabase } from "../Supabase";
import { Link } from "react-router-dom";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    category: "laptops",
    brand: "",
    model: "",
    price: "",
    memory: "",
    color: "",
    image_url: "",
  });

  const fetchProducts = async () => {
    const { data, error } = await supabase.from("products").select("*");
    if (!error) setProducts(data || []);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === "admin123") {
      setIsAuthenticated(true);
    } else {
      alert("Неверный пароль!");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      title: product.title || "",
      category: product.category || "laptops",
      brand: product.brand || "",
      model: product.model || "",
      price: product.price || "",
      memory: product.memory || "",
      color: product.color || "",
      image_url: product.image_url || "",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      title: "",
      category: "laptops",
      brand: "",
      model: "",
      price: "",
      memory: "",
      color: "",
      image_url: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData, price: Number(formData.price) };

    if (editingId) {
      await supabase.from("products").update(payload).eq("id", editingId);
    } else {
      await supabase.from("products").insert([payload]);
    }
    handleCloseModal();
    fetchProducts();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Удалить товар?")) {
      await supabase.from("products").delete().eq("id", id);
      fetchProducts();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login-container">
        <form onSubmit={handleLogin} className="admin-login-card">
          <h2>🔒 Вход в админ-панель</h2>
          <input
            type="password"
            placeholder="Введите пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
            required
          />
          <button type="submit" className="btn-stylish btn-stylish-primary btn-full">
            Войти
          </button>
          <Link to="/" className="back-link" style={{ display: "block", marginTop: "12px", textAlign: "center" }}>
            ← На главную
          </Link>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>⚙️ Панель управления товарами</h1>
        <div>
          <button className="btn-stylish btn-stylish-primary" onClick={() => setIsModalOpen(true)}>
            + Добавить товар
          </button>
          <button
            className="btn-stylish btn-stylish-outline"
            style={{ marginLeft: "8px" }}
            onClick={() => setIsAuthenticated(false)}
          >
            Выйти
          </button>
        </div>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Фото</th>
              <th>Название</th>
              <th>Категория</th>
              <th>Бренд</th>
              <th>Цена</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  <img src={p.image_url || "https://via.placeholder.com/40"} alt="" className="admin-thumb" />
                </td>
                <td><strong>{p.title}</strong></td>
                <td>{p.category}</td>
                <td>{p.brand}</td>
                <td>{p.price} сом</td>
                
                 
                
                 <button className="btn-small" onClick={() => handleEdit(p)}>✏️ </button>{" "}
                  <button className="btn-small btn-danger" onClick={() => handleDelete(p.id)}>🗑️</button>
                  
                
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="form-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? "✏️ Редактирование товара" : "➕ Новый товар"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group-full">
                  <input
                    type="text"
                    name="title"
                    placeholder="Название *"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <select name="category" value={formData.category} onChange={handleInputChange} className="form-input">
                    <option value="laptops">Ноутбуки</option>
                    <option value="phones">Телефоны</option>
                    <option value="computers">Компьютеры</option>
                  </select>
                </div>
                <div>
                  <input type="text" name="brand" placeholder="Бренд" value={formData.brand} onChange={handleInputChange} className="form-input" />
                </div>
                <div>
                  <input type="number" name="price" placeholder="Цена *" value={formData.price} onChange={handleInputChange} className="form-input" required />
                </div>
                <div>
                  <input type="text" name="memory" placeholder="Память" value={formData.memory} onChange={handleInputChange} className="form-input" />
                </div>
                <div className="form-group-full">
                  <input type="text" name="image_url" placeholder="Ссылка на фото (URL)" value={formData.image_url} onChange={handleInputChange} className="form-input" />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-stylish btn-stylish-primary" style={{ flex: 2 }}>
                    Сохранить
                  </button>
                  <button type="button" className="btn-stylish btn-stylish-outline" onClick={handleCloseModal} style={{ flex: 1 }}>
                    Отмена
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}