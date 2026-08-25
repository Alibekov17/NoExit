const TMDB_API_KEY = '3359f3c284377e460cb92b3f753ee87c';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const GENRES_MAP = {
  28: 'Боевик', 12: 'Приключения', 16: 'Мультфильм', 35: 'Комедия',
  80: 'Криминал', 99: 'Документальный', 18: 'Драма', 10751: 'Семейный',
  14: 'Фэнтези', 36: 'История', 27: 'Ужасы', 10402: 'Музыка',
  9648: 'Детектив', 10749: 'Мелодрама', 878: 'Фантастика',
  10770: 'Телевизионный фильм', 53: 'Триллер', 10752: 'Военный', 37: 'Вестерн'
};

export const fetchPopularMovies = async (lang = 'ru-RU') => {
  try {
    const promises = [1, 2, 3].map(page => 
      fetch(`${BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=${lang}&page=${page}`).then(res => res.json())
    );
    const results = await Promise.all(promises);
    let allMovies = [];
    results.forEach(data => {
      if (data && data.results) {
        allMovies = [...allMovies, ...data.results];
      }
    });

    return allMovies
      .filter(movie => movie.title && movie.poster_path)
      .map(formatMovieData);
  } catch (error) {
    console.error('Ошибка загрузки фильмов:', error);
    return [];
  }
};

const formatMovieData = (movie) => {
  const movieGenres = movie.genre_ids 
    ? movie.genre_ids.map(id => GENRES_MAP[id]).filter(Boolean).slice(0, 2).join(', ') 
    : 'Кино';

  return {
    id: movie.id,
    title: movie.title || movie.name,
    description: movie.overview,
    rating: movie.vote_average ? movie.vote_average.toFixed(1) : '7.0',
    image: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : '',
    genre: movieGenres || 'Кино',
    release_date: movie.release_date
  };
};

export const searchMovies = async (query, lang = 'ru-RU') => {
  if (!query || !query.trim()) return [];
  try {
    const response = await fetch(`${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&language=${lang}&query=${encodeURIComponent(query.trim())}&include_adult=false`);
    const data = await response.json();
    if (data && data.results) {
      return data.results.filter(movie => movie.title && movie.poster_path).map(formatMovieData);
    }
    return [];
  } catch (error) {
    console.error('Ошибка поиска:', error);
    return [];
  }
};

export const fetchMovieSystemServiceDetails = async (tmdbId, lang = 'ru-RU') => {
  try {
    const response = await fetch(`${BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}&language=${lang}&append_to_response=credits,videos`);
    const data = await response.json();
    
    const cast = data.credits?.cast?.slice(0, 5).map(c => c.name).join(', ') || 'Не указано';
    const director = data.credits?.crew?.find(c => c.job === 'Director')?.name || 'Не указано';
    const youtubeTrailer = data.videos?.results?.find(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'));
    const trailerUrl = youtubeTrailer ? `https://www.youtube.com/watch?v=${youtubeTrailer.key}` : '';

    return {
      title: data.title || data.original_title,
      description: data.overview || 'Описание отсутствует',
      rating: data.vote_average ? data.vote_average.toFixed(1) : '7.0',
      rotten: data.vote_count ? `${Math.min(Math.round(data.vote_average * 10), 99)}%` : '80%',
      image: data.poster_path ? `${IMAGE_BASE_URL}${data.poster_path}` : '',
      genre: data.genres?.map(g => g.name).join(', ') || 'Кино',
      cast_members: cast,
      producer: director,
      duration: data.runtime ? `${data.runtime} мин` : '120 мин',
      country: data.production_countries?.[0]?.name || 'США',
      trailer_url: trailerUrl,
      video_url: ''
    };
  } catch (error) {
    console.error('Ошибка деталей фильма:', error);
    return null;
  }
};