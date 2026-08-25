import React, { useState, useEffect } from "react";
import { supabase } from "../Supabase";

export default function AdminSellers() {
  const [sellers, setSellers] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [products, setProducts] = useState([]);

  const [loadingSellers, setLoadingSellers] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState("");

  // 1. Загрузка всех продавцов из БД
  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    setLoadingSellers(true);
    setError("");
    try {
      // Получаем список всех продавцов вместе с их профилями
      const { data, error } = await supabase
        .from("sellers")
        .select(`
          id,
          user_id,
          company_name,
          inn_number,
          document_type,
          is_verified,
          created_at,
          profiles:user_id (
            first_name,
            last_name,
            phone
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSellers(data || []);
    } catch (err) {
      console.error("Ошибка при загрузке продавцов:", err.message);
      setError("Не удалось загрузить список продавцов");
    } finally {
      setLoadingSellers(false);
    }
  };

  // 2. Выбор продавца и загрузка его товаров
  const handleSelectSeller = async (seller) => {
    setSelectedSeller(seller);
    setLoadingProducts(true);
    setError("");

    try {
      // Ищем товары, принадлежащие конкретному продавцу
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("seller_id", seller.user_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error("Ошибка при загрузке товаров:", err.message);
      setError("Не удалось загрузить товары выбранного продавца");
    } finally {
      setLoadingProducts(false);
    }
  };

  // 3. Переключение статуса верификации продавца (опционально)
  const toggleVerifySeller = async (seller, e) => {
    e.stopPropagation(); // Предотвращаем срабатывание клика по всей карточке
    try {
      const updatedStatus = !seller.is_verified;
      const { error } = await supabase
        .from("sellers")
        .update({ is_verified: updatedStatus })
        .eq("id", seller.id);

      if (error) throw error;

      // Обновляем состояние локально
      setSellers((prev) =>
        prev.map((s) => (s.id === seller.id ? { ...s, is_verified: updatedStatus } : s))
      );
      if (selectedSeller?.id === seller.id) {
        setSelectedSeller((prev) => ({ ...prev, is_verified: updatedStatus }));
      }
    } catch (err) {
      console.error("Ошибка обновления статуса:", err.message);
      alert("Не удалось изменить статус верификации");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", maxWidth: "1200px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "20px" }}>Панель администратора — Продавцы и их Товары</h2>

      {error && (
        <div style={{ padding: "12px", backgroundColor: "#f8d7da", color: "#721c24", borderRadius: "6px", marginBottom: "16px" }}>
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "350px 1fr", gap: "24px" }}>
        
        {/* Колонна слева: Список продавцов */}
        <div>
          <h3>Список продавцов ({sellers.length})</h3>
          
          {loadingSellers ? (
            <p>Загрузка продавцов...</p>
          ) : sellers.length === 0 ? (
            <p style={{ color: "#666" }}>Продавцов пока нет.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {sellers.map((seller) => {
                const isSelected = selectedSeller?.id === seller.id;
                const profile = seller.profiles || {};

                return (
                  <div
                    key={seller.id}
                    onClick={() => handleSelectSeller(seller)}
                    style={{
                      padding: "14px",
                      borderRadius: "8px",
                      border: isSelected ? "2px solid #0088cc" : "1px solid #e0e0e0",
                      backgroundColor: isSelected ? "#f0f8ff" : "#ffffff",
                      cursor: "pointer",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ fontSize: "16px" }}>
                        {seller.company_name || "Без названия"}
                      </strong>
                      <button
                        onClick={(e) => toggleVerifySeller(seller, e)}
                        style={{
                          fontSize: "11px",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          border: "none",
                          cursor: "pointer",
                          backgroundColor: seller.is_verified ? "#d4edda" : "#fff3cd",
                          color: seller.is_verified ? "#155724" : "#856404"
                        }}
                      >
                        {seller.is_verified ? "✓ Проверен" : "⏳ Не проверен"}
                      </button>
                    </div>

                    <div style={{ fontSize: "14px", color: "#444", marginTop: "6px" }}>
                      👤 {profile.first_name || ""} {profile.last_name || "Имя не указано"}
                    </div>

                    <div style={{ fontSize: "13px", color: "#0088cc", marginTop: "2px" }}>
                      📞 {profile.phone || "Телефон не привязан"}
                    </div>

                    <div style={{ fontSize: "12px", color: "#888", marginTop: "6px" }}>
                      ИНН: <b>{seller.inn_number || "—"}</b> ({seller.document_type === "ip" ? "ИП" : "Патент"})
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Колонна справа: Товары выбранного продавца */}
        <div>
          <h3>
            {selectedSeller
              ? `Товары продавца: ${selectedSeller.company_name || "Без названия"}`
              : "Выберите продавца слева"}
          </h3>

          {!selectedSeller ? (
            <div style={{
              padding: "40px",
              border: "2px dashed #ccc",
              borderRadius: "8px",
              textAlign: "center",
              color: "#888"
            }}>
              👈 Нажмите на карточку любого продавца, чтобы посмотреть его ассортимент.
            </div>
          ) : loadingProducts ? (
            <p>Загрузка товаров продавца...</p>
          ) : products.length === 0 ? (
            <div style={{ padding: "20px", background: "#f9f9f9", borderRadius: "8px", color: "#666" }}>
              У этого продавца пока нет добавленных товаров.
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "16px"
            }}>
              {products.map((product) => (
                <div
                  key={product.id}
                  style={{
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    padding: "12px",
                    backgroundColor: "#fff",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.03)"
                  }}
                >
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.title}
                      style={{ width: "100%", height: "140px", objectFit: "cover", borderRadius: "6px" }}
                    />
                  ) : (
                    <div style={{
                      height: "140px",
                      background: "#eee",
                      borderRadius: "6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#aaa"
                    }}>
                      Нет фото
                    </div>
                  )}

                  <h4 style={{ margin: "10px 0 4px 0", fontSize: "15px" }}>{product.title}</h4>
                  
                  <p style={{ margin: "0 0 8px 0", fontWeight: "bold", color: "#0088cc", fontSize: "16px" }}>
                    {product.price} сом
                  </p>

                  {product.category && (
                    <span style={{
                      fontSize: "11px",
                      background: "#eef2f5",
                      color: "#475569",
                      padding: "3px 8px",
                      borderRadius: "4px"
                    }}>
                      {product.category}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}