import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Star, ChevronRight, Lock, Plus, Check } from 'lucide-react';
import {
  getHeroBanners,
  getMovieCatalog,
  getMyListMovies,
  getNewReleases,
  getTopTenMovies,
  saveMyListMovies,
  isPremiumAccessActive,
} from '../data/movieCatalog';
import './Home.css';

const Home = () => {
  const [movies, setMovies] = useState(() => getMovieCatalog());
  const [heroIndex, setHeroIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [watchlist, setWatchlist] = useState(() => getMyListMovies(getMovieCatalog()));
  const [isPremium, setIsPremium] = useState(() => isPremiumAccessActive());

  const heroSlides = useMemo(() => getHeroBanners(), []);

  useEffect(() => {
    const movieList = getMovieCatalog();
    setMovies(movieList);
    setWatchlist(getMyListMovies(movieList));
    setIsPremium(isPremiumAccessActive());
  }, []);

  useEffect(() => {
    if (!heroSlides.length) return undefined;
    const timer = window.setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [heroSlides]);

  const activeHero = heroSlides[heroIndex] || heroSlides[0];
  const topTenList = useMemo(() => getTopTenMovies(movies), [movies]);
  const newReleases = useMemo(() => getNewReleases(movies), [movies]);
  const myList = useMemo(() => (watchlist.length ? watchlist : getMyListMovies(movies)), [movies, watchlist]);

  const toggleWatchlist = (movieId) => {
    const selected = movies.filter((movie) => movie.id === movieId);
    const next = watchlist.some((movie) => movie.id === movieId)
      ? watchlist.filter((movie) => movie.id !== movieId)
      : [...watchlist, ...selected];

    setWatchlist(next);
    saveMyListMovies(next.map((movie) => movie.id));
  };

  const renderMovieRow = (title, items, isCompact = false) => {
    if (!items.length) return null;

    return (
      <section className="content-row">
        <div className="row-header">
          <h2>{title}</h2>
          <Link to="/catalog" className="see-all">
            Смотреть все <ChevronRight size={16} />
          </Link>
        </div>

        <div className={`movies-grid ${isCompact ? 'movies-grid--compact' : ''}`}>
          {items.map((movie) => {
            const isSaved = watchlist.some((item) => item.id === movie.id);

            return (
              <article key={movie.id} className="movie-poster-card">
                <div className="poster-wrapper">
                  <img src={movie.image || movie.posterUrlPreview} alt={movie.title} loading="lazy" />
                  {!isPremium && movie.requires_premium && (
                    <div className="premium-badge"><Lock size={10} /> PRO</div>
                  )}

                  <button
                    type="button"
                    className="watchlist-button"
                    onClick={() => toggleWatchlist(movie.id)}
                    aria-label={isSaved ? 'Удалить из списка' : 'Добавить в список'}
                  >
                    {isSaved ? <Check size={14} /> : <Plus size={14} />}
                  </button>
                </div>

                <div className="poster-info">
                  <div className="poster-meta">
                    <span className="poster-rating"><Star size={12} fill="#ffc442" color="#ffc442" /> {movie.rating || '8.8'}</span>
                    <span className="poster-year">{movie.year || movie.years || '2026'}</span>
                  </div>

                  <h3>{movie.title}</h3>
                  <p>{movie.genre}</p>

                  <div className="poster-actions">
                    <Link to={`/movie/${movie.id}`} className="poster-watch-btn">
                      <Play size={14} fill="currentColor" /> Смотреть
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    );
  };

  return (
    <div className="home-page">
      <section
        className="hero-netflix"
        style={{ backgroundImage: `linear-gradient(90deg, rgba(8,10,15,0.86), rgba(8,10,15,0.25)), url(${activeHero?.image})` }}
      >
        <div className="hero-netflix__content">
          <span className="hero-badge">НОВЫЕ ПРЕМЬЕРЫ</span>
          <h1>{activeHero?.title}</h1>
          <p className="hero-subtitle">{activeHero?.subtitle}</p>
          <p className="hero-description">{activeHero?.description}</p>

          <div className="hero-actions">
            <Link to="/catalog" className="hero-button hero-button--primary">
              <Play size={18} fill="currentColor" /> Смотреть
            </Link>
            <Link to={`/movie/${movies[0]?.id || 'spider-2026'}`} className="hero-button hero-button--ghost">
              Подробнее
            </Link>
          </div>
        </div>

        <div className="hero-dots" aria-label="hero slider navigation">
          {heroSlides.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={index === heroIndex ? 'dot active' : 'dot'}
              aria-label={`Slide ${index + 1}`}
              onClick={() => setHeroIndex(index)}
            />
          ))}
        </div>
      </section>

      <div className="catalog-shell">
        {loading ? <div className="loading-box">Загружаем кино...</div> : (
          <>
            {renderMovieRow('Топ 10', topTenList, true)}
            {renderMovieRow('Новинки', newReleases, false)}
            {renderMovieRow('Мой список', myList, false)}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
