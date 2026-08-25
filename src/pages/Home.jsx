import React, { useState, useEffect } from 'react';
import { fetchPopularMovies } from '../tmdbApi';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import HomeBanner from '../components/HomeBanner';
import './Home.css';

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllMovies();
  }, []);

  const loadAllMovies = async () => {
    setLoading(true);
    const result = await fetchPopularMovies();
    setMovies(result);
    setLoading(false);
  };

  return (
    <div className="home-page" style={{ paddingTop: '20px' }}>
      <div className="catalog-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* iOS-баннер */}
        <HomeBanner />

        <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '30px 0 25px 0', color: '#fff' }}>
          Все фильмы и мультфильмы
        </h1>

        {loading ? (
          <div style={{ color: '#aaa', textAlign: 'center', padding: '40px' }}>Загрузка каталога с TMDb...</div>
        ) : (
          <div className="movies-grid">
            {movies.map((movie) => (
              <Link key={movie.id} to={`/movie/${movie.id}`} className="movie-card">
                <img src={movie.image} alt={movie.title} />
                <div className="movie-card-info">
                  <h3>{movie.title}</h3>
                  <p style={{ fontSize: '12px', color: '#888', margin: '4px 0 8px 0' }}>{movie.genre}</p>
                  <div className="movie-card-meta">
                    <span className="genre-tag"></span>
                    <span className="rating-tag">
                      <Star size={12} fill="#f5c518" color="#f5c518" /> {movie.rating}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;