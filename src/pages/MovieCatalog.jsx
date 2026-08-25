import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { Film, Star, Search } from 'lucide-react';
import './MovieCatalog.css';

const MovieCatalog = () => {
  const [movies, setMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('is_banner', false);
    
    if (!error && data) {
      setMovies(data);
    }
  };

  const filteredMovies = movies.filter(movie => 
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="catalog-container">
      <div className="catalog-header">
        <h2>Каталог кино</h2>
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Поиск..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="movies-grid">
        {filteredMovies.length === 0 ? (
          <p className="no-movies">Фильмы не найдены. Добавьте их в админ-панели, сняв галочку «Баннер».</p>
        ) : (
          filteredMovies.map(movie => (
            <Link to={`/movie/${movie.id}`} key={movie.id} className="movie-card">
              <img src={movie.image} alt={movie.title} />
              <div className="movie-card-info">
                <h3>{movie.title}</h3>
                <span className="rating-tag"><Star size={12} fill="#f5c518" color="#f5c518" /> {movie.rating || '8.0'}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default MovieCatalog;