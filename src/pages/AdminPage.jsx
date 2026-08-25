import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Film, Image as ImageIcon, Users, Trash2, Edit, CheckCircle, XCircle, Shield, Upload, DollarSign, Bell, Eye, X, QrCode, Search, Video, Clock, Globe2, ShieldAlert } from 'lucide-react';
import { searchMovies, fetchMovieSystemServiceDetails } from '../tmdbApi';
import './AdminPage.css';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('banners');

  const [items, setItems] = useState([]);
  const [movieForm, setMovieForm] = useState({ 
    title: '', description: '', rating: '', rotten: '', image: '', genre: '', 
    cast_members: '', producer: '', duration: '', country: '', age_rating: '16+',
    trailer_url: '', video_url: '', is_banner: false, requires_premium: true 
  });
  
  const [posterSourceType, setPosterSourceType] = useState('file');
  const [trailerSourceType, setTrailerSourceType] = useState('url');
  const [videoSourceType, setVideoSourceType] = useState('url');

  const [imageFile, setImageFile] = useState(null);
  const [trailerFile, setTrailerFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [tmdbQuery, setTmdbQuery] = useState('');
  const [tmdbResults, setTmdbResults] = useState([]);
  const [isSearchingTmdb, setIsSearchingTmdb] = useState(false);

  const [clients, setClients] = useState([]);
  const [clientFilter, setClientFilter] = useState('premium');
  const [deposits, setDeposits] = useState([]);

  const [notifications, setNotifications] = useState([]);
  const [selectedClientHistory, setSelectedClientHistory] = useState(null);
  const [clientPaymentsHistory, setClientPaymentsHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Состояния для управления QR-кодом
  const [adminQrUrl, setAdminQrUrl] = useState('/qr-code.png');
  const [uploadingQr, setUploadingQr] = useState(false);

  // Состояние для просмотра чека в полном размере
  const [previewReceiptUrl, setPreviewReceiptUrl] = useState(null);

  useEffect(() => {
    fetchData();
    fetchClients();
    fetchDeposits();
    fetchAdminQr();

    const subscription = supabase
      .channel('admin_deposits_channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'deposit_requests' }, payload => {
        const newDep = payload.new;
        setDeposits(prev => [newDep, ...prev]);
        triggerNotification(`Новая заявка на подписку от ${newDep.email} (${newDep.amount || '—'} сом)`);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const triggerNotification = (text) => {
    setNotifications(prev => [...prev, { id: Date.now(), text }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => Date.now() - n.id < 6000));
    }, 6000);
  };

  const fetchData = async () => {
    const { data, error } = await supabase.from('banners').select('*').order('id', { ascending: false });
    if (!error && data) setItems(data);
  };

  const fetchClients = async () => {
    const { data, error } = await supabase.from('subscriptions').select('*');
    if (!error && data) setClients(data);
  };

  const fetchDeposits = async () => {
    const { data, error } = await supabase.from('deposit_requests').select('*').order('id', { ascending: false });
    if (!error && data) setDeposits(data);
  };

  // Загрузка сохраненного QR-кода из таблицы settings
  const fetchAdminQr = async () => {
    try {
      const { data } = await supabase.from('settings').select('value').eq('key', 'admin_qr_code').single();
      if (data && data.value) setAdminQrUrl(data.value);
    } catch (e) {
      console.log('Используется дефолтный QR-код');
    }
  };

  // Функция обновления и сохранения QR-кода через админку
  const handleUpdateSystemQr = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingQr(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `qr_code_${Date.now()}.${fileExt}`;
      const filePath = `system/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('payment_receipts').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('payment_receipts').getPublicUrl(filePath);
      const newUrl = data.publicUrl;

      const { error: dbError } = await supabase.from('settings').upsert({ key: 'admin_qr_code', value: newUrl });
      if (dbError) throw dbError;

      setAdminQrUrl(newUrl);
      alert('QR-код успешно обновлен!');
    } catch (error) {
      alert('Ошибка при загрузке QR-кода: ' + error.message);
    } finally {
      setUploadingQr(false);
    }
  };

  const handleSearchTmdb = async (e) => {
    e.preventDefault();
    if (!tmdbQuery.trim()) return;
    setIsSearchingTmdb(true);
    try {
      const results = await searchMovies(tmdbQuery);
      setTmdbResults(results);
    } catch (err) {
      alert('Ошибка при поиске в TMDb');
    } finally {
      setIsSearchingTmdb(false);
    }
  };

  const handleSelectTmdbMovie = async (tmdbId) => {
    try {
      const details = await fetchMovieSystemServiceDetails(tmdbId);
      if (details) {
        setMovieForm(prev => ({
          ...prev,
          title: details.title || '',
          description: details.description || '',
          rating: details.rating || '',
          rotten: details.rotten || '',
          image: details.image || '',
          genre: details.genre || '',
          cast_members: details.cast_members || '',
          producer: details.producer || '',
          duration: details.duration || '120 мин',
          country: details.country || 'США',
          trailer_url: details.trailer_url || prev.trailer_url
        }));
        setPosterSourceType('url');
        if (details.trailer_url) setTrailerSourceType('tmdb');
        setTmdbResults([]);
        setTmdbQuery('');
        alert('Данные успешно загружены из TMDb!');
      }
    } catch (err) {
      alert('Не удалось загрузить данные из TMDb');
    }
  };

  const uploadFileToStorage = async (file, folder) => {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage.from('movie-storage').upload(filePath, file);
    if (uploadError) throw uploadError;

    const { data } = await supabase.storage.from('movie-storage').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSaveMovie = async (e) => {
    e.preventDefault();
    if (!movieForm.title) return;

    setUploading(true);
    try {
      let imageUrl = movieForm.image;
      let trailerUrl = movieForm.trailer_url;
      let videoUrl = movieForm.video_url;

      if (posterSourceType === 'file' && imageFile) {
        setUploadProgress('Загрузка постера...');
        imageUrl = await uploadFileToStorage(imageFile, 'images');
      }

      if (trailerSourceType === 'file' && trailerFile) {
        setUploadProgress('Загрузка трейлера...');
        trailerUrl = await uploadFileToStorage(trailerFile, 'trailers');
      }

      if (videoSourceType === 'file' && videoFile) {
        setUploadProgress('Загрузка полного фильма...');
        videoUrl = await uploadFileToStorage(videoFile, 'videos');
      }

      setUploadProgress('Сохранение...');
      const payload = { ...movieForm, image: imageUrl, trailer_url: trailerUrl, video_url: videoUrl };

      if (editingId) {
        const { error } = await supabase.from('banners').update(payload).eq('id', editingId);
        if (error) throw error;
        alert('Фильм обновлен!');
        setEditingId(null);
      } else {
        const { error } = await supabase.from('banners').insert([payload]);
        if (error) throw error;
        alert('Фильм добавлен!');
      }

      resetForm(activeTab);
      fetchData();
    } catch (error) {
      alert('Ошибка: ' + error.message);
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  };

  const handleEditClick = (item) => {
    setEditingId(item.id);
    setMovieForm({
      title: item.title || '',
      description: item.description || '',
      rating: item.rating || '',
      rotten: item.rotten || '',
      image: item.image || '',
      genre: item.genre || '',
      cast_members: item.cast_members || '',
      producer: item.producer || '',
      duration: item.duration || '',
      country: item.country || '',
      age_rating: item.age_rating || '16+',
      trailer_url: item.trailer_url || '',
      video_url: item.video_url || '',
      is_banner: item.is_banner ?? false,
      requires_premium: item.requires_premium ?? true
    });
    setPosterSourceType('url');
    setTrailerSourceType('url');
    setVideoSourceType('url');
    setImageFile(null);
    setTrailerFile(null);
    setVideoFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = (tab) => {
    setMovieForm({ 
      title: '', description: '', rating: '', rotten: '', image: '', genre: '', cast_members: '',
      producer: '', duration: '', country: '', age_rating: '16+', trailer_url: '', video_url: '', 
      is_banner: tab === 'banners', requires_premium: true 
    });
    setPosterSourceType('file');
    setTrailerSourceType('url');
    setVideoSourceType('url');
    setImageFile(null);
    setTrailerFile(null);
    setVideoFile(null);
    setTmdbResults([]);
    setTmdbQuery('');
  };

  const handleDeleteMovie = async (id) => {
    if (window.confirm('Удалить фильм?')) {
      const { error } = await supabase.from('banners').delete().eq('id', id);
      if (!error) fetchData();
    }
  };

  const handleGrantSubscription = async (clientId, months) => {
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + Number(months));

    const { error } = await supabase
      .from('subscriptions')
      .update({ is_premium: true, subscription_expires_at: expiresAt.toISOString() })
      .eq('id', clientId);

    if (!error) {
      alert(`Подписка выдана на ${months} мес.`);
      fetchClients();
    }
  };

  const handleRevokeSubscription = async (clientId) => {
    if (!window.confirm('Отключить премиум?')) return;
    const { error } = await supabase
      .from('subscriptions')
      .update({ is_premium: false, subscription_expires_at: null })
      .eq('id', clientId);

    if (!error) fetchClients();
  };

  const handleApproveDeposit = async (depositId, userId, months = 1) => {
    try {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + Number(months || 1));

      await supabase.from('subscriptions').update({ is_premium: true, subscription_expires_at: expiresAt.toISOString() }).eq('id', userId);
      if (depositId) {
        await supabase.from('deposit_requests').update({ status: 'approved' }).eq('id', depositId);
      }
      await supabase.from('payments').update({ status: 'approved' }).eq('user_id', userId).eq('status', 'pending');

      alert('Подписка успешно подтверждена!');
      fetchDeposits();
      fetchClients();
      if (selectedClientHistory) {
        handleOpenClientHistory(selectedClientHistory);
      }
    } catch (error) {
      alert('Ошибка: ' + error.message);
    }
  };

  const handleOpenClientHistory = async (client) => {
    setSelectedClientHistory(client);
    setLoadingHistory(true);
    try {
      const { data } = await supabase.from('payments').select('*').eq('user_id', client.id).order('payment_time', { ascending: false });
      setClientPaymentsHistory(data || []);
    } catch (err) {
      setClientPaymentsHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const filteredItems = activeTab === 'banners' ? items.filter(i => i.is_banner) : items;
  const filteredClients = clients.filter(client => {
    const isExpired = !client.subscription_expires_at || new Date(client.subscription_expires_at) < new Date();
    const hasActivePrem = client.is_premium && !isExpired;
    return clientFilter === 'premium' ? hasActivePrem : !hasActivePrem;
  });

  return (
    <div className="admin-page">
      <div className="admin-notifications-container">
        {notifications.map(n => (
          <div key={n.id} className="admin-toast-alert">
            <Bell size={18} color="#0a84ff" />
            <span>{n.text}</span>
          </div>
        ))}
      </div>

      <div className="admin-container">
        <div className="admin-top-header">
          <h2><Shield size={24} /> Панель управления NO EXIT</h2>
          <div className="admin-tabs-nav">
            <button className={`tab-btn ${activeTab === 'banners' ? 'active' : ''}`} onClick={() => { setActiveTab('banners'); resetForm('banners'); setEditingId(null); }}>
              <ImageIcon size={18} /> Баннеры
            </button>
            <button className={`tab-btn ${activeTab === 'movies' ? 'active' : ''}`} onClick={() => { setActiveTab('movies'); resetForm('movies'); setEditingId(null); }}>
              <Film size={18} /> Каталог ({items.length})
            </button>
            <button className={`tab-btn ${activeTab === 'clients' ? 'active' : ''}`} onClick={() => { setActiveTab('clients'); setEditingId(null); }}>
              <Users size={18} /> Клиенты ({clients.length})
            </button>
            <button className={`tab-btn ${activeTab === 'deposits' ? 'active' : ''}`} onClick={() => { setActiveTab('deposits'); setEditingId(null); }}>
              <DollarSign size={18} /> Оплаты ({deposits.filter(d => d.status === 'pending').length})
            </button>
            <button className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => { setActiveTab('settings'); setEditingId(null); }}>
              <QrCode size={18} /> QR-код
            </button>
          </div>
        </div>

        {/* Секция управления QR-кодом */}
        {activeTab === 'settings' && (
          <div className="admin-section" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <h3 style={{ marginBottom: '15px' }}>Управление QR-кодом для оплаты</h3>
            <p style={{ color: '#8e8e93', fontSize: '14px', marginBottom: '20px' }}>
              Этот QR-код отображается на странице оплаты (Checkout) для пользователей.
            </p>
            
            <div style={{ display: 'inline-block', background: '#fff', padding: '15px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
              <img 
                src={adminQrUrl} 
                alt="Payment QR Code" 
                style={{ width: '220px', height: '220px', objectFit: 'contain', display: 'block' }} 
              />
            </div>
            
            <div style={{ marginTop: '25px' }}>
              <label className="admin-btn-save" style={{ display: 'inline-flex', cursor: 'pointer', alignItems: 'center', gap: '8px', padding: '12px 24px' }}>
                <Upload size={18} /> {uploadingQr ? 'Загрузка...' : 'Загрузить новый QR-код'}
                <input type="file" accept="image/*" onChange={handleUpdateSystemQr} style={{ display: 'none' }} />
              </label>
            </div>
          </div>
        )}

        {activeTab !== 'clients' && activeTab !== 'deposits' && activeTab !== 'settings' && (
          <div className="admin-section">
            <h3>{editingId ? 'Редактировать фильм' : (activeTab === 'banners' ? 'Добавить баннер' : 'Загрузить фильм')}</h3>
            
            {!editingId && (
              <div style={{ background: 'rgba(10, 132, 255, 0.1)', border: '1px solid rgba(10, 132, 255, 0.3)', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '14px', marginBottom: '8px', color: '#0a84ff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Search size={16} /> Автозаполнение из TMDb
                </h4>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input 
                    type="text" 
                    placeholder="Название фильма..." 
                    value={tmdbQuery} 
                    onChange={e => setTmdbQuery(e.target.value)}
                    style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px', borderRadius: '8px', color: '#fff' }}
                  />
                  <button onClick={handleSearchTmdb} disabled={isSearchingTmdb} style={{ background: '#0a84ff', color: '#fff', border: 'none', padding: '0 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                    {isSearchingTmdb ? 'Ищем...' : 'Найти'}
                  </button>
                </div>

                {tmdbResults.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px', maxHeight: '180px', overflowY: 'auto' }}>
                    {tmdbResults.map(movie => (
                      <div key={movie.id} onClick={() => handleSelectTmdbMovie(movie.id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.4)', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' }}>
                        <span style={{ fontSize: '13px' }}>{movie.title} ({movie.release_date ? movie.release_date.split('-')[0] : '—'})</span>
                        <span style={{ fontSize: '12px', color: '#0a84ff' }}>Выбрать ↵</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSaveMovie} className="admin-form-clean">
              <div className="form-grid-clean">
                <div className="field-block">
                  <label>Название фильма *</label>
                  <input type="text" placeholder="Название" value={movieForm.title} onChange={e => setMovieForm({ ...movieForm, title: e.target.value })} required />
                </div>

                <div className="field-block">
                  <label>Жанр</label>
                  <input type="text" placeholder="Фантастика" value={movieForm.genre} onChange={e => setMovieForm({ ...movieForm, genre: e.target.value })} />
                </div>

                <div className="field-block" style={{ gridColumn: '1 / -1', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                    <label style={{ fontSize: '13px', fontWeight: '600' }}>Постер фильма</label>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button type="button" onClick={() => setPosterSourceType('file')} style={{ background: posterSourceType === 'file' ? '#0a84ff' : 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>С файла</button>
                      <button type="button" onClick={() => setPosterSourceType('url')} style={{ background: posterSourceType === 'url' ? '#0a84ff' : 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>По ссылке</button>
                    </div>
                  </div>

                  {posterSourceType === 'file' ? (
                    <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} />
                  ) : (
                    <input type="url" placeholder="https://..." value={movieForm.image} onChange={e => setMovieForm({ ...movieForm, image: e.target.value })} />
                  )}
                </div>

                <div className="field-block full-width">
                  <label>Описание</label>
                  <textarea rows="3" placeholder="Описание..." value={movieForm.description} onChange={e => setMovieForm({ ...movieForm, description: e.target.value })}></textarea>
                </div>
              </div>

              <div className="ios-switches-container">
                <div className="ios-switch-row">
                  <div className="switch-text">
                    <span className="switch-title">Требовать Премиум</span>
                  </div>
                  <label className="ios-switch">
                    <input type="checkbox" checked={movieForm.requires_premium} onChange={e => setMovieForm({ ...movieForm, requires_premium: e.target.checked })} />
                    <span className="slider round"></span>
                  </label>
                </div>

                <div className="ios-switch-row">
                  <div className="switch-text">
                    <span className="switch-title">Показывать на главном баннере</span>
                  </div>
                  <label className="ios-switch">
                    <input type="checkbox" checked={movieForm.is_banner} onChange={e => setMovieForm({ ...movieForm, is_banner: e.target.checked })} />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>

              <div className="form-actions-clean">
                <button type="submit" className="admin-btn-save" disabled={uploading}>
                  <Upload size={18} /> {uploading ? (uploadProgress || 'Загрузка...') : (editingId ? 'Обновить фильм' : 'Сохранить фильм')}
                </button>
              </div>
            </form>

            <div className="admin-list-container">
              <h4>Элементы в базе ({filteredItems.length})</h4>
              <div className="movies-grid-list">
                {filteredItems.map(item => (
                  <div key={item.id} className="movie-list-card">
                    <img src={item.image} alt={item.title} />
                    <div className="movie-list-info">
                      <h5>{item.title}</h5>
                    </div>
                    <div className="movie-list-actions">
                      <button onClick={() => handleEditClick(item)}><Edit size={16} /></button>
                      <button onClick={() => handleDeleteMovie(item.id)} className="del"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="admin-section">
            <div className="clients-filter-header">
              <h3>База клиентов</h3>
              <div className="filter-buttons">
                <button className={`filter-btn ${clientFilter === 'premium' ? 'active-prem' : ''}`} onClick={() => setClientFilter('premium')}>С премиумом</button>
                <button className={`filter-btn ${clientFilter === 'expired' ? 'active-exp' : ''}`} onClick={() => setClientFilter('expired')}>Без премиума</button>
              </div>
            </div>

            <div className="clients-list">
              {filteredClients.map(client => {
                const isExpired = !client.subscription_expires_at || new Date(client.subscription_expires_at) < new Date();
                const hasActivePrem = client.is_premium && !isExpired;
                return (
                  <div key={client.id} className={`client-card ${hasActivePrem ? 'active' : 'expired'}`}>
                    <div className="client-info">
                      <span className="client-email">{client.email}</span>
                      <span style={{ fontSize: '11px', color: '#8e8e93' }}>Доступ до: {client.subscription_expires_at ? new Date(client.subscription_expires_at).toLocaleDateString() : 'Не активен'}</span>
                    </div>
                    <div className="client-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button onClick={() => handleOpenClientHistory(client)} style={{ background: '#0a84ff', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Eye size={14} /> История
                      </button>
                      <button onClick={() => handleGrantSubscription(client.id, 1)} className="sub-btn">＋1м</button>
                      {hasActivePrem && (
                        <button onClick={() => handleRevokeSubscription(client.id)} style={{ background: '#ff3b30', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}>Отключить</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'deposits' && (
          <div className="admin-section">
            <h3>Заявки на оплату и чеки</h3>
            <div className="clients-list">
              {deposits.length === 0 ? (
                <p style={{ color: '#8e8e93', textAlign: 'center', padding: '20px' }}>Нет входящих заявок на оплату</p>
              ) : (
                deposits.map(dep => (
                  <div key={dep.id} className="client-card active" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div className="client-info">
                      <span className="client-email">{dep.email || 'Пользователь'}</span>
                      <span className="client-status">Сумма: <strong>{dep.amount || '4.99'} сом</strong> | Месяцев: <strong>{dep.months || 1}</strong></span>
                      <span style={{ fontSize: '11px', color: '#8e8e93' }}>Статус: <strong style={{ color: dep.status === 'approved' ? '#28a745' : '#ff9500' }}>{dep.status}</strong></span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      {dep.receipt_url && (
                        <button onClick={() => setPreviewReceiptUrl(dep.receipt_url)} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Eye size={16} /> Чек
                        </button>
                      )}
                      {dep.status !== 'approved' && (
                        <button onClick={() => handleApproveDeposit(dep.id, dep.user_id, dep.months || 1)} style={{ background: '#28a745', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                          Подтвердить
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Модальное окно истории клиента и его чеков */}
      {selectedClientHistory && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#1c1c1e', width: '100%', maxWidth: '650px', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px' }}>История клиента</h3>
                <span style={{ fontSize: '13px', color: '#8e8e93' }}>{selectedClientHistory.email}</span>
              </div>
              <button onClick={() => setSelectedClientHistory(null)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ marginBottom: '20px', background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '10px' }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}>Статус подписки: <strong>{selectedClientHistory.is_premium ? 'Активна' : 'Неактивна'}</strong></p>
              <p style={{ margin: 0, fontSize: '13px', color: '#8e8e93' }}>Истекает: {selectedClientHistory.subscription_expires_at ? new Date(selectedClientHistory.subscription_expires_at).toLocaleString() : '—'}</p>
            </div>

            <h4 style={{ fontSize: '15px', marginBottom: '10px' }}>Чеки и платежи ({clientPaymentsHistory.length})</h4>
            {loadingHistory ? (
              <p style={{ textAlign: 'center', color: '#8e8e93' }}>Загрузка истории...</p>
            ) : clientPaymentsHistory.length === 0 ? (
              <p style={{ color: '#8e8e93', fontSize: '14px' }}>У этого клиента пока нет истории платежей.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {clientPaymentsHistory.map(pay => (
                  <div key={pay.id} style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <p style={{ margin: '0 0 4px 0', fontSize: '14px' }}>Банк: <strong>{pay.bank || '—'}</strong> | ФИО: {pay.full_name || '—'}</p>
                      <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#8e8e93' }}>Сумма: {pay.amount || '4.99'} сом | Период: {pay.months || 1} мес.</p>
                      <p style={{ margin: 0, fontSize: '11px', color: '#8e8e93' }}>Дата: {new Date(pay.payment_time || pay.created_at).toLocaleString()} | Статус: <span style={{ color: pay.status === 'approved' ? '#28a745' : '#ff9500' }}>{pay.status}</span></p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {pay.receipt_url && (
                        <button onClick={() => setPreviewReceiptUrl(pay.receipt_url)} style={{ background: '#0a84ff', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                          <Eye size={14} /> Чек
                        </button>
                      )}
                      {pay.status !== 'approved' && (
                        <button onClick={() => handleApproveDeposit(null, selectedClientHistory.id, pay.months || 1)} style={{ background: '#28a745', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                          Подтвердить
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Просмотр чека на весь экран */}
      {previewReceiptUrl && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100, padding: '20px' }}>
          <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
            <button onClick={() => setPreviewReceiptUrl(null)} style={{ position: 'absolute', top: -40, right: 0, background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
              <X size={28} />
            </button>
            <img src={previewReceiptUrl} alt="Receipt Preview" style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '12px', objectFit: 'contain', background: '#000' }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;