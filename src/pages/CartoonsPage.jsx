import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Film } from 'lucide-react';
import './GenrePage.css'; // Общие стили для страниц жанров

const CartoonsPage = () => {
  const [cartoons, setCartoons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCartoons();
  }, []);

  const fetchCartoons = async () => {
    try {
      // Делаем запрос в Supabase и фильтруем по жанру
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .ilike('genre', '%мультфильм%'); // или '%анимация%'

      if (error) throw error;
      if (data) setCartoons(data);
    } catch (err) {
      console.error('Ошибка при загрузке мультфильмов:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="genre-page-container">
      <h2><Film size={24} /> Мультфильмы</h2>
      
      {loading ? (
        <p className="loading-text">Загрузка...</p>
      ) : cartoons.length === 0 ? (
        <p className="empty-text">В этом жанре пока нет фильмов.</p>
      ) : (
        <div className="genre-movies-grid">
          {cartoons.map(movie => (
            <div key={movie.id} className="genre-movie-card">
              <img src={movie.image} alt={movie.title} />
              <div className="genre-movie-info">
                <h3>{movie.title}</h3>
                <span>{movie.genre}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CartoonsPage;