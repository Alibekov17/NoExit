import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import './PaymentForm.css';

const PaymentForm = () => {
  const [fullName, setFullName] = useState('');
  const [selectedBank, setSelectedBank] = useState('MBANK');
  const [receiptFile, setReceiptFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Список популярных банков Кыргызстана
  const kyrgyzBanks = [
    'MBANK (Мбанк)',
    'O!Dengi (О! Деньги)',
    'Optima Bank (Оптима)',
    'Bakai Bank (Бакай)',
    'DemirBank (Демир)',
    'RSK Bank (РСК)',
    'Companion Bank (Компаньон)'
  ];

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !receiptFile) {
      alert('Пожалуйста, заполните ФИО и прикрепите чек');
      return;
    }

    setLoading(true);

    try {
      // 1. Загружаем файл чека в хранилище Supabase (Storage)
      const fileExt = receiptFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `receipts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('payment_receipts') // Убедитесь, что создали такой Bucket в Supabase Storage
        .upload(filePath, receiptFile);

      if (uploadError) throw uploadError;

      // Получаем публичную ссылку на загруженный чек
      const { data: publicURLData } = supabase.storage
        .from('payment_receipts')
        .getPublicUrl(filePath);

      const receiptUrl = publicURLData.publicUrl;
      const paymentTime = new Date().toISOString();

      // 2. Сохраняем данные платежа в таблицу базы данных `payments`
      const { error: dbError } = await supabase.from('payments').insert([
        {
          full_name: fullName,
          bank: selectedBank,
          receipt_url: receiptUrl,
          payment_time: paymentTime,
          status: 'pending' // Статус: ожидает проверки админом
        }
      ]);

      if (dbError) throw dbError;

      setSuccess(true);
      setFullName('');
      setReceiptFile(null);
    } catch (error) {
      console.error('Ошибка отправки платежа:', error.message);
      alert('Произошла ошибка при отправке. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-container">
      <form className="payment-form" onSubmit={handlePaymentSubmit}>
        <h2>Подтверждение оплаты</h2>
        
        {success && <div className="success-msg">Чек успешно отправлен на проверку администратору!</div>}

        <div className="form-group">
          <label>ФИО владельца карты:</label>
          <input 
            type="text" 
            placeholder="Иванов Иван Иванович" 
            value={fullName} 
            onChange={(e) => setFullName(e.target.value)} 
            required 
          />
        </div>

        <div className="form-group">
          <label>Выберите банк:</label>
          <select 
            value={selectedBank} 
            onChange={(e) => setSelectedBank(e.target.value)}
          >
            {kyrgyzBanks.map((bank, index) => (
              <option key={index} value={bank}>{bank}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Прикрепите скриншот чека:</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => setReceiptFile(e.target.files[0])} 
            required 
          />
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Отправка...' : 'Отправить чек'}
        </button>
      </form>
    </div>
  );
};

export default PaymentForm;