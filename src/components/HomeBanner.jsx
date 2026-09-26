import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './HomeBanner.css';

const fallbackBanners = [
  {
    id: 'fallback-1',
    title: 'NO EXIT — Новый сезон кино',
    description: 'Популярные премьеры, блокбастеры и свежие русские релизы в одном каталоге.',
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'fallback-2',
    title: 'Человек-паук: Новый день',
    description: 'Новый герой, новые приключения и яркая русская локализация прямо в каталоге.',
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'fallback-3',
    title: 'Лето киношных премьер',
    description: 'Смотрите свежие фильмы, боевики, фантастику и мультфильмы без задержек.',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80'
  }
];

const HomeBanner = () => {
  const [banners, setBanners] = useState(fallbackBanners);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const { data, error } = await supabase.from('banners').select('*').limit(5);
        if (!error && Array.isArray(data) && data.length > 0) {
          setBanners(data);
          return;
        }
      } catch (error) {
        // offline/local fallback is used below
      }
      setBanners(fallbackBanners);
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const currentBanner = banners[currentIndex] || banners[0];

  const handleWatchClick = () => {
    if (currentBanner?.id && currentBanner.id.startsWith('fallback')) {
      navigate('/catalog');
      return;
    }

    if (currentBanner?.id) {
      navigate(`/movie/${currentBanner.id}`);
    }
  };

  if (banners.length === 0) return null;

  return (
    <div className="home-banner" style={{ backgroundImage: `url(${currentBanner?.image})` }}>
      <div className="banner-overlay"></div>

      <div className="banner-content" key={currentIndex}>
        <h1 className="banner-title">{currentBanner?.title}</h1>
        <p className="banner-desc">{currentBanner?.description}</p>

        <button className="trailer-btn" onClick={handleWatchClick}>
          Смотреть фильм
        </button>
      </div>

      <div className="banner-indicators">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`indicator-dot ${currentIndex === index ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
          >
            {String(index + 1).padStart(2, '0')}
          </button>
        ))}
      </div>
    </div>
  );
};

export default HomeBanner;