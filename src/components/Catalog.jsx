import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Search, Filter, Star, Play, Film, Calendar, Globe, Award, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Catalog.css';

const Catalog = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Состояния для фильтров
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [sortBy, setSortBy] = useState('rating_desc');

  // Списки доступных вариантов для фильтров
  const genres = ['Фантастика', 'Драма', 'Боевик', 'Комедия', 'Триллер', 'Ужасы', 'Приключения'];
  const years = ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018'];
  const languages = ['Русский', 'Английский', 'Французский', 'Испанский', 'Корейский'];

  useEffect(() => {
    fetchCatalogMovies();
  }, []);

  const fetchCatalogMovies = async () => {
    setLoading(true);
    // Загружаем абсолютно все фильмы из таблицы базы данных
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('id', { ascending: false });

    if (!error && data) {
      setMovies(data);
    }
    setLoading(false);
  };

  // Логика фильтрации и сортировки
  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'all' || movie.genre?.toLowerCase().includes(selectedGenre.toLowerCase());
    const matchesYear = selectedYear === 'all' || movie.year?.toString() === selectedYear;
    const matchesLang = selectedLanguage === 'all' || movie.language?.toLowerCase() === selectedLanguage.toLowerCase();
    
    return matchesSearch && matchesGenre && matchesYear && matchesLang;
  }).sort((a, b) => {
    if (sortBy === 'rating_desc') {
      return (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0);
    } else if (sortBy === 'rating_asc') {
      return (parseFloat(a.rating) || 0) - (parseFloat(b.rating) || 0);
    } else if (sortBy === 'year_desc') {
      return (parseInt(b.year) || 0) - (parseInt(a.year) || 0);
    } else if (sortBy === 'title_asc') {
      return (a.title || '').localeCompare(b.title || '');
    }
    return 0;
  });

  return (
    <div className="catalog-page">
      <div className="catalog-container">
        
        {/* Шапка и поиск */}
        <div className="catalog-header ios-glass">
          <div className="catalog-title-area">
            <h2><Film size={26} /> Каталог фильмов</h2>
            <p>Найдите кино по душе с помощью расширенных фильтров</p>
          </div>

          <div className="search-bar-wrapper">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Поиск по названию фильма в базе..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Панель фильтров */}
        <div className="filters-panel ios-glass">
          <div className="filter-group">
            <label><Filter size={14} /> Жанр</label>
            <select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)}>
              <option value="all">Все жанры</option>
              {genres.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label><Calendar size={14} /> Год</label>
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
              <option value="all">Все годы</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label><Globe size={14} /> Язык</label>
            <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}>
              <option value="all">Все языки</option>
              {languages.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label><Award size={14} /> Сортировка</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="rating_desc">Сначала с высоким рейтингом</option>
              <option value="rating_asc">Сначала с низким рейтингом</option>
              <option value="year_desc">Сначала новые</option>
              <option value="title_asc">По алфавиту (А-Я)</option>
            </select>
          </div>
        </div>

        {/* Сетка результатов */}
        {loading ? (
          <div className="catalog-loading">Загрузка каталога...</div>
        ) : filteredMovies.length === 0 ? (
          <div className="catalog-empty ios-glass">
            <p>По вашему запросу ничего не найдено в базе данных. Попробуйте изменить параметры фильтрации.</p>
          </div>
        ) : (
          <div className="movies-catalog-grid">
            {filteredMovies.map(movie => (
              <div key={movie.id} className="catalog-movie-card ios-glass">
                <div className="movie-poster-box">
                  <img src={movie.image || 'https://via.placeholder.com/300x450?text=No+Image'} alt={movie.title} />
                  {movie.requires_premium && (
                    <span className="prem-tag" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <ShieldCheck size={12} /> PRO
                    </span>
                  )}
                  <div className="movie-rating-badge">
                    <Star size={12} fill="#ffcc00" color="#ffcc00" />
                    <span>{movie.rating || '—'}</span>
                  </div>
                </div>

                <div className="movie-card-content">
                  <h4>{movie.title}</h4>
                  <div className="movie-meta-info">
                    <span>{movie.genre || 'Кино'}</span>
                    <span>•</span>
                    <span>{movie.year || '2026'}</span>
                  </div>
                  <p className="movie-short-desc">{movie.description}</p>
                  
                  <Link to={`/movie/${movie.id}`} className="watch-now-btn" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Play size={14} fill="currentColor" /> Смотреть
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

Catalog.displayName = "Catalog";
export default Catalog;