import React, { useState } from "react";
import { supabase } from "../Supabase";
import { validateKGInn } from "../utils/validators";

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const [userType, setUserType] = useState("customer"); // "customer" | "seller"
  const [step, setStep] = useState(1); // 1: данные, 2: код из Telegram

  // Поля формы
  const [phone, setPhone] = useState("+996");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Поля Продавца
  const [companyName, setCompanyName] = useState("");
  const [innNumber, setInnNumber] = useState("");
  const [docType, setDocType] = useState("ip");

  const [otpCode, setOtpCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // 1. Отправка кода через Telegram-бота (t.me/estore_auth_bot)
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanPhone = phone.trim().replace(/[^\d+]/g, "");

    if (userType === "seller") {
      const innCheck = validateKGInn(innNumber);
      if (!innCheck.valid) {
        setErrorMsg(innCheck.message);
        return;
      }
    }

    setLoading(true);
    try {
      // Отправка запроса в Edge Function Supabase для бота @estore_auth_bot
      const { data, error } = await supabase.functions.invoke("send-telegram-otp", {
        body: { phone: cleanPhone },
      });

      if (error) throw error;

      setStep(2);
    } catch (err) {
      setErrorMsg(err.message || "Ошибка отправки кода в Telegram");
    } finally {
      setLoading(false);
    }
  };

  // 2. Подтверждение кода из Telegram
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const cleanPhone = phone.trim().replace(/[^\d+]/g, "");

    try {
      // Проверка кода из таблицы otp_codes
      const { data: otpData, error: otpError } = await supabase
        .from("otp_codes")
        .select("*")
        .eq("phone_number", cleanPhone)
        .eq("code", otpCode.trim())
        .gte("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (otpError) throw otpError;

      if (!otpData) {
        setErrorMsg("Неверный или истекший код из Telegram!");
        setLoading(false);
        return;
      }

      // Создание или обновление профиля
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .upsert(
          {
            phone: cleanPhone,
            first_name: firstName,
            last_name: lastName,
            role: userType,
          },
          { onConflict: "phone" }
        )
        .select()
        .single();

      if (profileError) throw profileError;

      // Если продавец — сохраняем данные ИП/Патента
      if (userType === "seller") {
        const { error: sellerError } = await supabase
          .from("sellers")
          .upsert(
            {
              user_id: profile.id,
              company_name: companyName,
              inn_number: innNumber,
              document_type: docType,
              is_verified: true,
            },
            { onConflict: "user_id" }
          );

        if (sellerError) throw sellerError;
      }

      onSuccess(profile);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Ошибка при проверке кода");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          ✕
        </button>

        {/* Выбор роли (без Админа) */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
          <button
            type="button"
            className={`filter-btn ${userType === "customer" ? "active" : ""}`}
            onClick={() => setUserType("customer")}
          >
            Покупатель
          </button>
          <button
            type="button"
            className={`filter-btn ${userType === "seller" ? "active" : ""}`}
            onClick={() => setUserType("seller")}
          >
            Продавец (ИП)
          </button>
        </div>

        {errorMsg && <div className="auth-error">{errorMsg}</div>}

        {step === 1 ? (
          /* Шаг 1: Данные Покупателя / Продавца */
          <form onSubmit={handleSendOtp} className="auth-form">
            <div className="auth-field">
              <label>Номер телефона (Кыргызстан)</label>
              <input
                type="tel"
                placeholder="+996XXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <div className="auth-field" style={{ flex: 1 }}>
                <label>Имя</label>
                <input
                  type="text"
                  placeholder="Асан"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="auth-field" style={{ flex: 1 }}>
                <label>Фамилия</label>
                <input
                  type="text"
                  placeholder="Усенов"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            {/* Дополнительные поля для Продавца */}
            {userType === "seller" && (
              <>
                <div className="auth-field">
                  <label>Название компании / магазина</label>
                  <input
                    type="text"
                    placeholder='ОСОО "TechStore" / ИП Асанов'
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>

                <div className="auth-field">
                  <label>Тип документа</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                  >
                    <option value="ip">Свидетельство ИП</option>
                    <option value="patent">Добровольный патент</option>
                  </select>
                </div>

                <div className="auth-field">
                  <label>14-значный ИНН (КР)</label>
                  <input
                    type="text"
                    placeholder="12345678901234"
                    maxLength="14"
                    value={innNumber}
                    onChange={(e) => setInnNumber(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className="btn-stylish btn-stylish-primary"
              disabled={loading}
            >
              {loading ? "Отправка..." : "Получить код в Telegram"}
            </button>
          </form>
        ) : (
          /* Шаг 2: Ввод кода из Telegram */
          <form onSubmit={handleVerifyOtp} className="auth-form">
            <p className="auth-info-text">
              Перейдите в бота{" "}
              <a
                href="https://t.me/estore_auth_bot"
                target="_blank"
                rel="noreferrer"
                style={{ color: "#0088cc", fontWeight: "bold" }}
              >
                @estore_auth_bot
              </a>
              , отправьте свой контакт и введите полученный код ниже:
            </p>
            <div className="auth-field">
              <label>Код из Telegram</label>
              <input
                type="text"
                placeholder="123456"
                maxLength="6"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn-stylish btn-stylish-primary"
              disabled={loading}
            >
              {loading ? "Проверка..." : "Подтвердить и войти"}
            </button>
            <button
              type="button"
              className="btn-stylish"
              style={{ marginTop: "8px", background: "transparent" }}
              onClick={() => setStep(1)}
              disabled={loading}
            >
              ← Изменить номер
            </button>
          </form>
        )}
      </div>
    </div>
  );
}