import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Film } from 'lucide-react';
import './GenrePage.css';

const FilmsPage = () => {
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFilms();
  }, []);

  const fetchFilms = async () => {
    try {
      // Загружаем фильмы, исключая явные сериалы и мультфильмы
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .not('genre', 'ilike', '%сериал%')
        .not('genre', 'ilike', '%мультфильм%')
        .not('genre', 'ilike', '%анимация%');

      if (error) throw error;
      if (data) setFilms(data);
    } catch (err) {
      console.error('Ошибка при загрузке фильмов:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="genre-page-container">
      <h2><Film size={24} /> Фильмы</h2>
      
      {loading ? (
        <p className="loading-text">Загрузка...</p>
      ) : films.length === 0 ? (
        <p className="empty-text">В разделе «Фильмы» пока ничего нет.</p>
      ) : (
        <div className="genre-movies-grid">
          {films.map(movie => (
            <div key={movie.id} className="genre-movie-card">
              <img src={movie.image} alt={movie.title} />
              <div className="genre-movie-info">
                <h3>{movie.title}</h3>
                <span>{movie.genre || 'Фильм'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilmsPage;