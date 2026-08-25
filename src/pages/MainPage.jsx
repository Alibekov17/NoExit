import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import HomeBanner from "../components/HomeBanner";
import './MainPage.css'; // Создайте или подключите свои стили

const MainPage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserMovies();
  }, []);

  // Загружаем добавленные фильмы/мультики из базы данных, сортируя по новым
  const fetchUserMovies = async () => {
    try {
      const { data, error } = await supabase
        .from('banners') // таблица, куда вы добавляете элементы
        .select('*')
        .order('created_at', { ascending: false }); // новые сверху

      if (error) throw error;
      if (data) setMovies(data);
    } catch (error) {
      console.error('Ошибка при загрузке фильмов:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMovieClick = (id) => {
    navigate(`/movie/${id}`);
  };

  return (
    <div className="main-page">
      {/* Баннер сверху */}
      <HomeBanner />

      {/* Секция со списком добавленных фильмов и мультиков */}
      <div className="content-section" style={{ padding: '40px' }}>
        <h2 style={{ color: '#fff', marginBottom: '20px', fontSize: '24px', fontWeight: '700' }}>
          Недавние добавления
        </h2>

        {loading ? (
          <p style={{ color: '#8f8f9d' }}>Загрузка...</p>
        ) : movies.length === 0 ? (
          <p style={{ color: '#8f8f9d' }}>Вы еще ничего не добавили.</p>
        ) : (
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '20px'
            }}
          >
            {movies.map((item) => (
              <div 
                key={item.id} 
                onClick={() => handleMovieClick(item.movie_id || item.id)}
                style={{
                  background: '#1a1a24',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '1px solid #2d2d42',
                  transition: 'transform 0.2s ease'
                }}
              >
                <img 
                  src={item.image || 'https://via.placeholder.com/200x300'} 
                  alt={item.title} 
                  style={{ width: '100%', height: '260px', objectFit: 'cover' }}
                />
                <div style={{ padding: '12px' }}>
                  <h4 style={{ color: '#fff', fontSize: '15px', margin: '0 0 6px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.title}
                  </h4>
                  <span style={{ color: '#8f8f9d', fontSize: '13px' }}>
                    {item.genre || 'Фильм / Мультфильм'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MainPage;