import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { fetchMovieSystemServiceDetails } from '../tmdbApi';
import { Star, Play, Heart, Bookmark, ArrowLeft, X, MessageSquare, Clock, Globe, Maximize, Minimize, Lock, Flame, ShieldCheck } from 'lucide-react';
import './MovieDetail.css';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Состояния подписки и уведомлений
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  
  // Состояния плееров
  const [isPlayingMovie, setIsPlayingMovie] = useState(false);
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);
  
  // Режим во весь экран (кинотеатр)
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  
  // Автоматическое скрытие элементов управления при бездействии
  const [showControls, setShowControls] = useState(true);
  const inactivityTimerRef = useRef(null);

  // Избранное и закладки
  const [isFavorite, setIsFavorite] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  // Отзывы
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: '5', comment: '' });

  // Загрузка данных фильма
  useEffect(() => {
    const loadDetails = async () => {
      setLoading(true);
      const data = await fetchMovieSystemServiceDetails(id, 'ru-RU');
      if (data) {
        setMovie(data);
      }
      setLoading(false);
    };
    loadDetails();
    checkUserSubscription();
    checkUserInteractions();
    window.scrollTo(0, 0);
  }, [id]);

  // Управление видимостью контроллеров плеера при бездействии мыши
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      inactivityTimerRef.current = setTimeout(() => {
        if (isPlayingMovie || isPlayingTrailer) {
          setShowControls(false);
        }
      }, 4000);
    };

    if (isPlayingMovie || isPlayingTrailer) {
      window.addEventListener('mousemove', handleMouseMove);
    } else {
      setShowControls(true);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [isPlayingMovie, isPlayingTrailer]);

  const checkUserSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: subData } = await supabase
        .from('subscriptions')
        .select('is_premium, subscription_expires_at')
        .eq('id', user.id)
        .single();

      if (subData && subData.is_premium) {
        const expiresAt = subData.subscription_expires_at ? new Date(subData.subscription_expires_at) : null;
        const now = new Date();
        if (!expiresAt || expiresAt > now) {
          setIsPremiumUser(true);
        }
      }
    } catch (err) {
      console.error('Ошибка при проверке подписки:', err);
    }
  };

  const checkUserInteractions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: fav } = await supabase
        .from('user_favorites')
        .select('*')
        .eq('user_id', user.id)
        .eq('movie_id', id)
        .maybeSingle();
      if (fav) setIsFavorite(true);

      const { data: book } = await supabase
        .from('user_bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .eq('movie_id', id)
        .maybeSingle();
      if (book) setIsBookmarked(true);
    } catch (err) {
      console.error('Ошибка загрузки интерактивных элементов:', err);
    }
  };

  const toggleFavorite = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      if (isFavorite) {
        await supabase.from('user_favorites').delete().eq('user_id', user.id).eq('movie_id', id);
        setIsFavorite(false);
      } else {
        await supabase.from('user_favorites').insert([{ user_id: user.id, movie_id: id }]);
        setIsFavorite(true);
      }
    } catch (err) {
      console.error('Ошибка обновления избранного:', err);
    }
  };

  const toggleBookmark = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      if (isBookmarked) {
        await supabase.from('user_bookmarks').delete().eq('user_id', user.id).eq('movie_id', id);
        setIsBookmarked(false);
      } else {
        await supabase.from('user_bookmarks').insert([{ user_id: user.id, movie_id: id }]);
        setIsBookmarked(true);
      }
    } catch (err) {
      console.error('Ошибка обновления закладок:', err);
    }
  };

  const handleWatchClick = () => {
    if (isPremiumUser) {
      setIsTheaterMode(true);
      setIsPlayingMovie(true);
    } else {
      setShowNotification(true);
    }
  };

  if (loading && !movie) {
    return <div className="movie-loading">Загрузка информации о фильме...</div>;
  }

  if (!movie) {
    return <div className="movie-loading">Фильм не найден или произошла ошибка загрузки.</div>;
  }

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}?autoplay=1` : null;
  };

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!newReview.comment.trim()) return;
    
    const reviewItem = {
      id: Date.now(),
      user: 'Зритель',
      rating: newReview.rating,
      comment: newReview.comment
    };
    
    setReviews([reviewItem, ...reviews]);
    setNewReview({ rating: '5', comment: '' });
  };

  const renderStars = (count) => {
    return Array.from({ length: Number(count) }).map((_, i) => (
      <Star key={i} size={14} fill="#f5c518" color="#f5c518" style={{ marginRight: '2px' }} />
    ));
  };

  return (
    <div 
      className="movie-detail-container"
      style={{ backgroundImage: `url(${movie.image})` }}
    >
      <div className="movie-overlay"></div>

      <div className="movie-content-wrapper">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button className="back-btn-abs" onClick={() => navigate(-1)} style={{ position: 'static' }}>
            <ArrowLeft size={18} /> Назад
          </button>
        </div>

        <div className="movie-info-card">
          <div className="movie-top-badges-row">
            <span className="movie-genre">{movie.genre}</span>
            <div className="action-top-icons">
              <button 
                className={`icon-action-btn ${isFavorite ? 'active' : ''}`}
                onClick={toggleFavorite}
                title="В избранное"
              >
                <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
              <button 
                className={`icon-action-btn ${isBookmarked ? 'active' : ''}`}
                onClick={toggleBookmark}
                title="В закладки"
              >
                <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>

          <h1 className="movie-title">{movie.title}</h1>

          <div className="movie-meta">
            <span className="rating-tag">
              <Star size={14} fill="#f5c518" color="#f5c518" /> {movie.rating} TMDb
            </span>
            <span className="rotten-badge">
              <Flame size={14} color="#ff453a" style={{ marginRight: '4px' }} /> {movie.rotten}
            </span>
            <span className="duration-time"><Clock size={14} /> {movie.duration}</span>
            <span className="duration-time"><Globe size={14} /> {movie.country}</span>
          </div>

          <p className="movie-summary">{movie.description}</p>

          <div className="movie-crew">
            <div><strong>Режиссер:</strong> {movie.producer}</div>
            <div><strong>В главных ролях:</strong> {movie.cast_members}</div>
          </div>

          {/* Стандартные кнопки просмотра */}
          <div style={{ marginTop: '25px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn-watch-full" onClick={handleWatchClick} style={{ padding: '12px 24px', width: 'auto' }}>
              {!isPremiumUser && <Lock size={16} style={{ marginRight: '6px' }} />}
              <Play size={16} fill="currentColor" /> Смотреть фильм
            </button>

            {movie.trailer_url ? (
              <button className="btn-trailer" onClick={() => { setIsTheaterMode(true); setIsPlayingTrailer(true); }}>
                Трейлер
              </button>
            ) : null}
          </div>
        </div>

        <div className="reviews-section">
          <h3><MessageSquare size={20} /> Отзывы зрителей</h3>
          
          <form className="review-form" onSubmit={handleAddReview}>
            <div className="form-group">
              <label>Оценка</label>
              <select 
                value={newReview.rating} 
                onChange={(e) => setNewReview({ ...newReview, rating: e.target.value })}
              >
                <option value="5">Отлично (5/5)</option>
                <option value="4">Хорошо (4/5)</option>
                <option value="3">Нормально (3/5)</option>
                <option value="2">Плохо (2/5)</option>
                <option value="1">Ужасно (1/5)</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Ваш отзыв</label>
              <textarea 
                placeholder="Поделитесь впечатлениями о фильме..."
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              />
            </div>

            <button type="submit" className="btn-submit-review">Отправить отзыв</button>
          </form>

          <div className="reviews-list">
            {reviews.length === 0 ? (
              <p className="no-reviews">Пока нет отзывов. Станьте первым!</p>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="review-item">
                  <div className="review-header">
                    <span className="review-user">{rev.user}</span>
                    <span className="review-rating" style={{ display: 'flex', alignItems: 'center' }}>
                      {renderStars(rev.rating)}
                    </span>
                  </div>
                  <p className="review-comment">{rev.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Модальное окно плеера фильма */}
      {isPlayingMovie && isPremiumUser && (
        <div 
          className={`player-modal ${isTheaterMode ? 'fullscreen-mode' : ''}`} 
          onClick={() => setShowControls(!showControls)}
        >
          <div className="player-content" onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
            
            <div style={{
              position: 'absolute', top: '15px', right: '20px', zIndex: 3000,
              display: 'flex', alignItems: 'center', gap: '12px',
              opacity: showControls ? 1 : 0, transition: 'opacity 0.4s ease-in-out',
              pointerEvents: showControls ? 'auto' : 'none'
            }}>
              <button 
                className="close-player" style={{ position: 'static', margin: 0 }} 
                onClick={() => setIsTheaterMode(!isTheaterMode)}
                title={isTheaterMode ? "Свернуть окно" : "Во весь экран"}
              >
                {isTheaterMode ? <Minimize size={18} /> : <Maximize size={18} />}
              </button>
              <button className="close-player" style={{ position: 'static', margin: 0 }} onClick={() => setIsPlayingMovie(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="video-placeholder" style={{ position: 'relative' }}>
              <div className={`controls-header ${!showControls ? 'hidden-controls' : ''}`}>
                <h2>Просмотр: {movie.title}</h2>
              </div>
              
              <div style={{ position: 'relative', width: '100%', height: isTheaterMode ? '100vh' : '450px' }}>
                <iframe 
                  src={`https://vidsrc.me/embed/movie?tmdb=${id}`} 
                  title="Online Movie Player" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen 
                  style={{ width: '100%', height: '100%', border: 'none', borderRadius: isTheaterMode ? '0' : '12px' }} 
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно трейлера */}
      {isPlayingTrailer && (
        <div 
          className={`player-modal ${isTheaterMode ? 'fullscreen-mode' : ''}`} 
          onClick={() => setShowControls(!showControls)}
        >
          <div className="player-content" onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute', top: '15px', right: '20px', zIndex: 3000,
              display: 'flex', alignItems: 'center', gap: '12px',
              opacity: showControls ? 1 : 0, transition: 'opacity 0.4s ease-in-out',
              pointerEvents: showControls ? 'auto' : 'none'
            }}>
              <button 
                className="close-player" style={{ position: 'static', margin: 0 }} 
                onClick={() => setIsTheaterMode(!isTheaterMode)}
                title={isTheaterMode ? "Свернуть окно" : "Во весь экран"}
              >
                {isTheaterMode ? <Minimize size={18} /> : <Maximize size={18} />}
              </button>
              <button className="close-player" style={{ position: 'static', margin: 0 }} onClick={() => setIsPlayingTrailer(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="video-placeholder">
              <h2>Трейлер: {movie.title}</h2>
              {getYouTubeEmbedUrl(movie.trailer_url) ? (
                <iframe 
                  src={getYouTubeEmbedUrl(movie.trailer_url)} 
                  title="YouTube Trailer" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen 
                  style={{ width: '100%', height: isTheaterMode ? '100vh' : '450px', border: 'none', borderRadius: isTheaterMode ? '0' : '12px' }} 
                />
              ) : (
                <p className="no-video-text">Трейлер на YouTube не найден</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Уведомление для пользователей без премиума */}
      {showNotification && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0, 0, 0, 0.75)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 2000, backdropFilter: 'blur(8px)'
        }}>
          <div style={{
            background: '#1c1c1e', padding: '30px', borderRadius: '24px',
            maxWidth: '400px', width: '90%', textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            position: 'relative', color: '#fff'
          }}>
            <button 
              onClick={() => setShowNotification(false)}
              style={{
                position: 'absolute', top: '15px', right: '15px',
                background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            <div style={{ color: '#0a84ff', marginBottom: '15px', display: 'flex', justifyContent: 'center' }}>
              <ShieldCheck size={48} />
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '10px' }}>
              Требуется Премиум-подписка
            </h2>
            <p style={{ fontSize: '14px', color: '#8e8e93', marginBottom: '25px', lineHeight: '1.4' }}>
              Просмотр этого фильма доступен только по подписке. Перейдите к покупке, чтобы разблокировать весь контент.
            </p>

            <button 
              onClick={() => {
                setShowNotification(false);
                navigate('/profile');
              }}
              style={{
                width: '100%', background: '#0a84ff', color: '#fff', border: 'none',
                padding: '12px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer',
                fontSize: '15px', boxShadow: '0 4px 15px rgba(10, 132, 255, 0.4)'
              }}
            >
              Купить подписку
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetail;