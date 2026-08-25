import { supabase } from "../Supabase";

// 1. Получение товаров из корзины с объединением данных из таблицы products
export const fetchCartItems = async () => {
  const { data, error } = await supabase
    .from("cart_items")
    .select("id, quantity, product_id, products(*)");

  if (error) {
    console.error("Ошибка при получении корзины:", error.message);
    return [];
  }

  // Приводим структуру к удобному виду для React
  return (data || []).map((item) => ({
    cartItemId: item.id,
    quantity: item.quantity,
    productId: item.product_id,
    ...item.products,
  }));
};

// 2. Добавление товара в корзину (или +1 к quantity)
export const addToCartDb = async (product) => {
  if (!product || !product.id) return;

  const { data: existing, error: selectError } = await supabase
    .from("cart_items")
    .select("*")
    .eq("product_id", product.id)
    .maybeSingle();

  if (selectError) {
    console.error("Ошибка проверки корзины:", selectError.message);
    return;
  }

  if (existing) {
    const { error: updateError } = await supabase
      .from("cart_items")
      .update({ quantity: existing.quantity + 1 })
      .eq("id", existing.id);

    if (updateError) console.error("Ошибка обновления:", updateError.message);
  } else {
    const { error: insertError } = await supabase
      .from("cart_items")
      .insert([{ product_id: product.id, quantity: 1 }]);

    if (insertError) console.error("Ошибка добавления:", insertError.message);
  }
};

// 3. Уменьшение количества или удаление из корзины
export const removeFromCartDb = async (cartItem) => {
  if (!cartItem || !cartItem.cartItemId) return;

  if (cartItem.quantity > 1) {
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: cartItem.quantity - 1 })
      .eq("id", cartItem.cartItemId);

    if (error) console.error("Ошибка обновления:", error.message);
  } else {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", cartItem.cartItemId);

    if (error) console.error("Ошибка удаления:", error.message);
  }
};

// 4. Очистка всей корзины
export const clearCartDb = async () => {
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (error) console.error("Ошибка очистки:", error.message);
};