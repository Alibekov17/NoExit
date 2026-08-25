import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './AdminPayments.css';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('payment_time', { ascending: false }); // Новые сверху

      if (error) throw error;
      if (data) setPayments(data);
    } catch (error) {
      console.error('Ошибка загрузки платежей:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      // Обновляем локальный стейт
      setPayments(payments.map(p => p.id === id ? { ...p, status: newStatus } : p));
    } catch (error) {
      console.error('Ошибка обновления статуса:', error.message);
    }
  };

  if (loading) return <div className="admin-loading">Загрузка панели админа...</div>;

  return (
    <div className="admin-payments-container">
      <h2>Панель администратора: Проверка платежей</h2>
      
      {payments.length === 0 ? (
        <p>Пока нет новых платежей.</p>
      ) : (
        <div className="payments-table-wrapper">
          <table className="payments-table">
            <thead>
              <tr>
                <th>ФИО клиента</th>
                <th>Банк</th>
                <th>Дата и Время</th>
                <th>Чек</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.full_name}</strong></td>
                  <td>{item.bank}</td>
                  <td>{new Date(item.payment_time).toLocaleString()}</td>
                  <td>
                    <a href={item.receipt_url} target="_blank" rel="noopener noreferrer" className="receipt-link">
                      Открыть чек
                    </a>
                  </td>
                  <td>
                    <span className={`status-badge ${item.status}`}>
                      {item.status === 'pending' ? 'Ожидает' : item.status === 'approved' ? 'Подтвержден' : 'Отклонен'}
                    </span>
                  </td>
                  <td className="action-buttons">
                    {item.status === 'pending' && (
                      <>
                        <button className="approve-btn" onClick={() => updateStatus(item.id, 'approved')}>Принять</button>
                        <button className="reject-btn" onClick={() => updateStatus(item.id, 'rejected')}>Отклонить</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;