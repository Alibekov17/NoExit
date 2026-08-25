// src/utils/validators.js

// Проверка 14-значного ИНН Кыргызстана
export const validateKGInn = (inn) => {
  const cleanInn = inn.trim();
  // ИНН КР состоит строго из 14 цифр
  const innRegex = /^[12]\d{13}$/;
  
  if (!innRegex.test(cleanInn)) {
    return { valid: false, message: "ИНН КР должен состоять из 14 цифр и начинаться с 1 или 2" };
  }
  
  return { valid: true };
};