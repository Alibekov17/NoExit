import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Film } from 'lucide-react';
import './GenrePage.css';

const SeriesPage = () => {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSeries();
  }, []);

  const fetchSeries = async () => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .or('genre.ilike.%сериал%,genre.ilike.%сезоны%,genre.ilike.%шоу%');

      if (error) throw error;
      if (data) setSeries(data);
    } catch (err) {
      console.error('Ошибка при загрузке сериалов:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="genre-page-container">
      <h2><Film size={24} /> Сериалы</h2>
      
      {loading ? (
        <p className="loading-text">Загрузка...</p>
      ) : series.length === 0 ? (
        <p className="empty-text">В разделе «Сериалы» пока нет контента.</p>
      ) : (
        <div className="genre-movies-grid">
          {series.map(item => (
            <div key={item.id} className="genre-movie-card">
              <img src={item.image} alt={item.title} />
              <div className="genre-movie-info">
                <h3>{item.title}</h3>
                <span>{item.genre}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SeriesPage;