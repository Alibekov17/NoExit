// src/services/orderService.js
import { supabase } from "../Supabase";

export const createOrderWithCommission = async ({
  customerId,
  sellerId,
  productId,
  price,
  cardLast4,
  phoneLinked,
}) => {
  const platformFee = Number((price * 0.04).toFixed(2)); // 4% магазину
  const sellerAmount = Number((price * 0.96).toFixed(2)); // 96% продавцу

  // 1. Создаем запись о заказе
  const { data: order, error: orderError } = await supabase.from("orders").insert([
    {
      customer_id: customerId,
      seller_id: sellerId,
      product_id: productId,
      total_amount: price,
      platform_fee: platformFee,
      seller_amount: sellerAmount,
      card_last4: cardLast4,
      phone_linked: phoneLinked,
      status: "paid",
    },
  ]);

  if (orderError) throw orderError;

  // 2. Начисляем продавцу 96% на баланс
  const { error: balanceError } = await supabase.rpc("increment_seller_balance", {
    seller_uuid: sellerId,
    amount_to_add: sellerAmount,
  });

  return order;
};