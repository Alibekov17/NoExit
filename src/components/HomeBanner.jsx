import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './HomeBanner.css';

const HomeBanner = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    const { data, error } = await supabase.from('banners').select('*');
    if (!error && data) setBanners(data);
  };

  useEffect(() => {
    if (banners.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const currentBanner = banners[currentIndex] || banners[0];

  const handleWatchClick = () => {
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