import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Film } from 'lucide-react';
import './GenrePage.css';

const HorrorPage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHorrorMovies();
  }, []);

  const fetchHorrorMovies = async () => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .or('genre.ilike.%ужасы%,genre.ilike.%хоррор%,genre.ilike.%horror%');

      if (error) throw error;
      if (data) setMovies(data);
    } catch (err) {
      console.error('Ошибка при загрузке хорроров:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="genre-page-container">
      <h2><Film size={24} /> Хоррор / Ужасы</h2>
      
      {loading ? (
        <p className="loading-text">Загрузка...</p>
      ) : movies.length === 0 ? (
        <p className="empty-text">В жанре «Хоррор» пока нет фильмов.</p>
      ) : (
        <div className="genre-movies-grid">
          {movies.map(movie => (
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

export default HorrorPage;