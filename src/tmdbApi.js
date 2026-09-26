// Кинопоиск API конфигурация
const KINOPOISK_API_KEY = import.meta.env.VITE_KINOPOISK_API_KEY;
const BASE_URL = 'https://kinopoiskapiunofficial.tech/api';
const REQUEST_TIMEOUT = 8000;

const requestJson = async (url, options = {}) => {
  if (!KINOPOISK_API_KEY) {
    throw new Error('Kinopoisk API key is not configured');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        'X-API-KEY': KINOPOISK_API_KEY,
      },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  } finally {
    clearTimeout(timeoutId);
  }
};

// Правильные URL для изображений Кинопоиска
const IMAGE_BASE_URL = 'https://st.kp.yandex.net/images/';
const IMAGE_SIZES = {
  small: 'film_iphone/iphone360_',     // 360px
  medium: 'film_iphone/iphone600_',    // 600px  
  large: 'film_big/'                   // большой постер
};

// Альтернативные URL для изображений
const ALTERNATIVE_IMAGE_URL = 'https://avatars.mds.yandex.net/get-kinopoisk-image/';

// Вспомогательная функция для безопасного форматирования рейтинга
const formatRating = (rating) => {
  if (rating === undefined || rating === null) return '7.0';
  const numRating = parseFloat(rating);
  return isNaN(numRating) ? '7.0' : numRating.toFixed(1);
};

// Функция для получения правильного URL изображения
const getMovieImage = (movie, size = 'medium') => {
  // Сначала проверяем наличие прямых URL из API
  if (movie.posterUrlPreview) {
    return movie.posterUrlPreview;
  }
  if (movie.posterUrl) {
    return movie.posterUrl;
  }
  
  const filmId = movie.filmId || movie.kinopoiskId || movie.id;
  if (!filmId) {
    return 'https://via.placeholder.com/300x450/2c3e50/ffffff?text=No+Image';
  }

  // Формируем URL в зависимости от размера
  const sizeMap = {
    small: IMAGE_SIZES.small,
    medium: IMAGE_SIZES.medium,
    large: IMAGE_SIZES.large
  };
  
  const sizePath = sizeMap[size] || IMAGE_SIZES.medium;
  
  // Пробуем разные варианты URL для изображений
  const urls = [
    `${IMAGE_BASE_URL}${sizePath}${filmId}.jpg`,
    `${IMAGE_BASE_URL}film_phone/iphone360_${filmId}.jpg`,
    `${ALTERNATIVE_IMAGE_URL}${filmId}/x1000`,
    `https://st.kp.yandex.net/images/film_iphone/iphone360_${filmId}.jpg`
  ];
  
  return urls[0];
};

// Функция для получения всех возможных URL изображения (для fallback)
export const getMovieImageUrls = (movie) => {
  const filmId = movie.filmId || movie.kinopoiskId || movie.id;
  if (!filmId) return [];
  
  return [
    movie.posterUrlPreview,
    movie.posterUrl,
    `${IMAGE_BASE_URL}${IMAGE_SIZES.medium}${filmId}.jpg`,
    `${IMAGE_BASE_URL}${IMAGE_SIZES.small}${filmId}.jpg`,
    `${IMAGE_BASE_URL}film_phone/iphone360_${filmId}.jpg`,
    `https://avatars.mds.yandex.net/get-kinopoisk-image/${filmId}/x1000`,
    `https://st.kp.yandex.net/images/film_iphone/iphone360_${filmId}.jpg`
  ].filter(Boolean);
};

// Проверка наличия русского озвучивания
const hasRussianAudio = (movie) => {
  if (movie.countries) {
    const countries = Array.isArray(movie.countries) 
      ? movie.countries.map(c => c.country || c.name) 
      : [];
    if (countries.some(c => c.includes('Россия') || c.includes('СССР') || c.includes('Russian'))) {
      return true;
    }
  }
  
  if (movie.nameRu) {
    return true;
  }
  
  if (movie.description && movie.description.length > 10) {
    const russianChars = /[а-яА-Я]/g;
    if (russianChars.test(movie.description)) {
      return true;
    }
  }
  
  return false;
};

// Получение популярных фильмов с русской озвучкой
export const fetchPopularMovies = async (lang = 'ru-RU') => {
  void lang;
  if (!KINOPOISK_API_KEY) return fallbackMovies;
  try {
    const currentYear = new Date().getFullYear();
    const promises = [1, 2, 3].map(page => 
      requestJson(`${BASE_URL}/v2.2/films?order=RATING&yearFrom=${currentYear-3}&yearTo=${currentYear}&page=${page}`, {
        method: 'GET',
        headers: {
          'X-API-KEY': KINOPOISK_API_KEY,
          'Content-Type': 'application/json',
        },
      })
    );
    
    const settledResults = await Promise.allSettled(promises);
    const results = settledResults
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);
    let allMovies = [];
    results.forEach(data => {
      if (data && data.films) {
        allMovies = [...allMovies, ...data.films];
      }
    });

    const uniqueMovies = Array.from(
      new Map(allMovies.map(movie => [movie.filmId, movie])).values()
    );

    const filteredMovies = uniqueMovies
      .filter(movie => {
        return movie.nameRu && 
               movie.posterUrlPreview && 
               hasRussianAudio(movie);
      })
      .sort((a, b) => {
        const ratingA = parseFloat(a.ratingKinopoisk) || 0;
        const ratingB = parseFloat(b.ratingKinopoisk) || 0;
        return ratingB - ratingA;
      });

    return filteredMovies
      .slice(0, 30)
      .map(formatMovieData);
  } catch (error) {
    console.error('Ошибка загрузки фильмов:', error);
    return fetchRussianMoviesFallback();
  }
};

const fallbackMovies = [
  ['Человек-паук: Новый день', 2026, 'Фантастика, Боевик'],
  ['Миссия невыполнима: Финальная расплата', 2025, 'Боевик, Триллер'],
  ['Капитан Америка: Новый мир', 2025, 'Фантастика, Боевик'],
  ['Аватар: Огонь и пепел', 2025, 'Фантастика, Приключения'],
  ['Супермен', 2025, 'Фантастика, Боевик'],
  ['Фантастическая четвёрка: Первые шаги', 2025, 'Фантастика, Боевик'],
  ['Лига справедливости: Новое начало', 2025, 'Боевик, Фантастика'],
  ['Громовержцы: Война миров', 2025, 'Боевик, Фантастика'],
  ['Дэдпул и Росомаха', 2024, 'Боевик, Комедия'],
  ['Зверополис 2', 2025, 'Анимация, Комедия'],
  ['Как приручить дракона', 2025, 'Фэнтези, Приключения'],
  ['Minecraft в кино', 2025, 'Фэнтези, Комедия'],
  ['Головоломка 2', 2024, 'Анимация, Комедия'],
  ['Джокер: Безумие в два счета', 2025, 'Триллер, Драма'],
  ['Ожидание: Последняя битва', 2025, 'Боевик, Триллер'],
  ['Время волков', 2024, 'Драма, Триллер'],
  ['Бэтмен: Сумерки', 2025, 'Боевик, Драма'],
  ['Звёздные войны: Пределы галактики', 2025, 'Фантастика, Приключения']
].map(([title, year, genre], index) => ({
  id: `fallback-${year}-${index}`,
  title,
  description: 'Популярный фильм в русской локализации. Подробности появятся после загрузки каталога.',
  rating: '7.8',
  image: `https://placehold.co/600x900/171820/f5f5f5?text=${encodeURIComponent(title)}`,
  imageUrls: [],
  genre,
  release_date: `${year}-01-01`,
  year,
  hasRussianAudio: true
}));

export const getFallbackMovies = () => fallbackMovies;

// Запасной вариант для получения фильмов с русской озвучкой
const fetchRussianMoviesFallback = async () => {
  try {
    const data = await requestJson(`${BASE_URL}/v2.2/films/top?type=TOP_250_BEST_FILMS&page=1`, {
      method: 'GET',
      headers: {
        'X-API-KEY': KINOPOISK_API_KEY,
        'Content-Type': 'application/json',
      },
    });
    
    if (data && data.films) {
      return data.films
        .filter(movie => {
          return movie.nameRu && 
                 movie.posterUrlPreview && 
                 hasRussianAudio(movie);
        })
        .slice(0, 30)
        .map(formatMovieData);
    }
    return fallbackMovies;
  } catch (error) {
    console.error('Ошибка загрузки русских фильмов:', error);
    return fallbackMovies;
  }
};

// Форматирование данных фильма
const formatMovieData = (movie) => {
  let movieGenres = 'Кино';
  if (movie.genres && Array.isArray(movie.genres)) {
    movieGenres = movie.genres.slice(0, 2).map(g => g.genre || g.name).join(', ');
  }

  const rating = formatRating(movie.ratingKinopoisk || movie.rating || movie.ratingImdb);

  return {
    id: movie.filmId || movie.kinopoiskId || movie.id,
    title: movie.nameRu || movie.nameEn || movie.nameOriginal || 'Без названия',
    description: movie.description || movie.shortDescription || movie.slogan || 'Описание отсутствует',
    rating: rating,
    image: getMovieImage(movie, 'medium'),
    imageUrls: getMovieImageUrls(movie),
    genre: movieGenres,
    release_date: movie.year ? `${movie.year}-01-01` : null,
    year: movie.year || 'Не указан',
    hasRussianAudio: hasRussianAudio(movie)
  };
};

// Поиск фильмов с русской озвучкой
export const searchMovies = async (query, lang = 'ru-RU') => {
  void lang;
  if (!KINOPOISK_API_KEY || !query || !query.trim()) return [];
  try {
    const data = await requestJson(`${BASE_URL}/v2.1/films/search-by-keyword?keyword=${encodeURIComponent(query.trim())}&page=1`);
    
    if (data && data.films) {
      return data.films
        .filter(movie => {
          return movie.nameRu && 
                 movie.posterUrlPreview && 
                 hasRussianAudio(movie);
        })
        .map(formatMovieData);
    }
    return [];
  } catch (error) {
    console.error('Ошибка поиска:', error);
    return [];
  }
};

// Получение деталей фильма
export const fetchMovieSystemServiceDetails = async (kinopoiskId, lang = 'ru-RU') => {
  void lang;
  if (!KINOPOISK_API_KEY) return null;
  try {
    const data = await requestJson(`${BASE_URL}/v2.2/films/${encodeURIComponent(kinopoiskId)}`);
    
    let cast = 'Не указано';
    if (data.actors && Array.isArray(data.actors)) {
      cast = data.actors.slice(0, 5).map(c => c.name).join(', ');
    }
    
    let director = 'Не указано';
    if (data.directors && Array.isArray(data.directors)) {
      director = data.directors.slice(0, 1).map(d => d.name).join(', ');
    }

    const rating = formatRating(data.ratingKinopoisk || data.ratingImdb);

    let imageUrl = data.posterUrl || '';
    if (!imageUrl && kinopoiskId) {
      imageUrl = `${IMAGE_BASE_URL}${IMAGE_SIZES.large}${kinopoiskId}.jpg`;
    }

    return {
      title: data.nameRu || data.nameEn || data.nameOriginal || 'Без названия',
      description: data.description || data.shortDescription || data.slogan || 'Описание отсутствует',
      rating: rating,
      rotten: data.ratingKinopoiskVoteCount ? `${Math.min(Math.round(parseFloat(data.ratingKinopoisk) * 10), 99)}%` : '80%',
      image: imageUrl || 'https://via.placeholder.com/300x450/2c3e50/ffffff?text=No+Image',
      imageUrls: getMovieImageUrls(data),
      genre: data.genres?.map(g => g.genre || g.name).join(', ') || 'Кино',
      cast_members: cast,
      producer: director,
      duration: data.filmLength ? `${data.filmLength} мин` : '120 мин',
      country: data.countries?.map(c => c.country || c.name).join(', ') || 'США',
      trailer_url: data.trailerUrl || '',
      video_url: '',
      year: data.year || 'Не указан'
    };
  } catch (error) {
    console.error('Ошибка деталей фильма:', error);
    return null;
  }
};

// Получение фильмов по фильтрам (только с русской озвучкой)
export const fetchMoviesByFilters = async (filters = {}, page = 1) => {
  if (!KINOPOISK_API_KEY) return [];
  try {
    const params = new URLSearchParams({
      page: page,
      ...filters
    });
    
    const data = await requestJson(`${BASE_URL}/v2.2/films?${params}`);
    
    if (data && data.films) {
      return data.films
        .filter(movie => {
          return movie.nameRu && 
                 movie.posterUrlPreview && 
                 hasRussianAudio(movie);
        })
        .map(formatMovieData);
    }
    return [];
  } catch (error) {
    console.error('Ошибка загрузки фильмов по фильтрам:', error);
    return [];
  }
};

// Получение российских фильмов
export const fetchRussianMovies = async () => {
  if (!KINOPOISK_API_KEY) return fallbackMovies;
  try {
    const currentYear = new Date().getFullYear();
    const data = await requestJson(`${BASE_URL}/v2.2/films?order=RATING&countries=1&yearFrom=${currentYear-5}&yearTo=${currentYear}&page=1`);
    
    if (data && data.films) {
      return data.films
        .filter(movie => movie.nameRu && movie.posterUrlPreview)
        .sort((a, b) => {
          const ratingA = parseFloat(a.ratingKinopoisk) || 0;
          const ratingB = parseFloat(b.ratingKinopoisk) || 0;
          return ratingB - ratingA;
        })
        .slice(0, 30)
        .map(formatMovieData);
    }
    return [];
  } catch (error) {
    console.error('Ошибка загрузки российских фильмов:', error);
    return [];
  }
};

// Функция для обработки ошибок загрузки изображений в компоненте
export const handleImageError = (event, movie) => {
  const img = event.target;
  const urls = getMovieImageUrls(movie);
  
  // Находим текущий индекс URL
  let currentIndex = urls.indexOf(img.src);
  if (currentIndex === -1) currentIndex = 0;
  
  // Пробуем следующий URL
  if (currentIndex < urls.length - 1) {
    img.src = urls[currentIndex + 1];
  } else {
    // Если все URL не работают, показываем заглушку
    img.src = 'https://via.placeholder.com/300x450/2c3e50/ffffff?text=No+Image';
  }
};