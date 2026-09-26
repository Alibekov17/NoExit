export const storageKeys = {
  movies: 'noexit_movies_catalog',
  banners: 'noexit_site_banners',
  settings: 'noexit_site_settings',
};

const safeStorage = {
  get(key) {
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  },
  set(key, value) {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      // ignore storage quota issues during local-only demo mode
    }
  },
};

export const defaultMovieCatalog = [
  {
    id: 'spider-2026',
    title: 'Человек-паук: Новый день',
    year: 2026,
    years: 2026,
    rating: 8.9,
    genre: 'Фантастика, Боевик',
    description: 'Питер Паркер сталкивается с новой угрозой, которая меняет его мир и ставит под удар всё, что ему дорого.',
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=900&q=80',
    backdrop: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1400&q=80',
    trailer_url: 'https://www.youtube.com/watch?v=8L8v8f-sq7M',
    video_url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    language: 'Русский',
    duration: '148 мин',
    country: 'США',
    requires_premium: true,
    is_banner: true,
    featured: 'top10',
    rank: 1,
  },
  {
    id: 'mission-final',
    title: 'Миссия невыполнима: Финальная расплата',
    year: 2025,
    years: 2025,
    rating: 8.7,
    genre: 'Боевик, Триллер',
    description: 'Команда Итона должна сделать невозможное в финальной операции, где ставки выросли до предела.',
    image: 'https://images.unsplash.com/photo-1513106580091-1d82408b8cd6?auto=format&fit=crop&w=900&q=80',
    backdrop: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1400&q=80',
    trailer_url: 'https://www.youtube.com/watch?v=OHxvLr7k2vY',
    video_url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
    language: 'Русский',
    duration: '139 мин',
    country: 'США',
    requires_premium: true,
    is_banner: true,
    featured: 'new',
    rank: 2,
  },
  {
    id: 'avatar-fire',
    title: 'Аватар: Огонь и пепел',
    year: 2025,
    years: 2025,
    rating: 8.8,
    genre: 'Фантастика, Приключения',
    description: 'Новая глава в легендарной вселенной открывает древние тайны и объединяет два мира.',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=80',
    backdrop: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1400&q=80',
    trailer_url: 'https://www.youtube.com/watch?v=5PSNL1qE6VY',
    video_url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    language: 'Русский',
    duration: '163 мин',
    country: 'США',
    requires_premium: true,
    featured: 'top10',
    rank: 3,
  },
  {
    id: 'superman',
    title: 'Супермен',
    year: 2025,
    years: 2025,
    rating: 8.4,
    genre: 'Фантастика, Боевик',
    description: 'Кларк Кент начинает новый этап в жизни и сталкивается с тайной, которая меняет сущность супергероя.',
    image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80',
    backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1400&q=80',
    trailer_url: 'https://www.youtube.com/watch?v=TQfGQY7yH5Y',
    video_url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
    language: 'Русский',
    duration: '134 мин',
    country: 'США',
    requires_premium: false,
    featured: 'new',
    rank: 4,
  },
  {
    id: 'fantastic-four',
    title: 'Фантастическая четвёрка: Первые шаги',
    year: 2025,
    years: 2025,
    rating: 8.1,
    genre: 'Фантастика, Боевик',
    description: 'Семья исследователей отправляется в космос и возвращается совершенно иначе, чем все ожидали.',
    image: 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&w=900&q=80',
    backdrop: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80',
    trailer_url: 'https://www.youtube.com/watch?v=I4F67IfcTzQ',
    video_url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    language: 'Русский',
    duration: '126 мин',
    country: 'США',
    requires_premium: false,
    featured: 'new',
    rank: 5,
  },
  {
    id: 'justice-begins',
    title: 'Лига справедливости: Новое начало',
    year: 2025,
    years: 2025,
    rating: 8.3,
    genre: 'Боевик, Фантастика',
    description: 'Команда обретает союзников, но столкновение со смертельной угрозой меняет всё.',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    backdrop: 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=1400&q=80',
    trailer_url: 'https://www.youtube.com/watch?v=5v5KJrJWSN8',
    video_url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
    language: 'Русский',
    duration: '143 мин',
    country: 'США',
    requires_premium: true,
    featured: 'top10',
    rank: 6,
  },
  {
    id: 'joker-2',
    title: 'Джокер: Безумие в два счета',
    year: 2025,
    years: 2025,
    rating: 8.6,
    genre: 'Триллер, Драма',
    description: 'Баланс между хаосом и интеллектом приводит героя к новой, ещё более опасной главе.',
    image: 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=900&q=80',
    backdrop: 'https://images.unsplash.com/photo-1513116476489-7635e79feb27?auto=format&fit=crop&w=1400&q=80',
    trailer_url: 'https://www.youtube.com/watch?v=t433PEQGErc',
    video_url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    language: 'Русский',
    duration: '152 мин',
    country: 'США',
    requires_premium: true,
    featured: 'top10',
    rank: 7,
  },
  {
    id: 'dragons-2',
    title: 'Как приручить дракона',
    year: 2025,
    years: 2025,
    rating: 8.2,
    genre: 'Фэнтези, Приключения',
    description: 'Новые друзья, новые риски и неожиданная дружба между человеком и крылатым существом.',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=900&q=80',
    backdrop: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80',
    trailer_url: 'https://www.youtube.com/watch?v=Z9ayJ4R2vN0',
    video_url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
    language: 'Русский',
    duration: '118 мин',
    country: 'США',
    requires_premium: false,
    featured: 'new',
    rank: 8,
  },
  {
    id: 'minecraft',
    title: 'Minecraft в кино',
    year: 2025,
    years: 2025,
    rating: 7.9,
    genre: 'Фэнтези, Комедия',
    description: 'Игровой мир становится огромной фантастической реальностью, где каждый шаг может изменить судьбу.',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80',
    backdrop: 'https://images.unsplash.com/photo-1513106580091-1d82408b8cd6?auto=format&fit=crop&w=1400&q=80',
    trailer_url: 'https://www.youtube.com/watch?v=MmB9b5njVbA',
    video_url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    language: 'Русский',
    duration: '105 мин',
    country: 'США',
    requires_premium: false,
    featured: 'watchlist',
    rank: 9,
  },
  {
    id: 'zootopia-2',
    title: 'Зверополис 2',
    year: 2025,
    years: 2025,
    rating: 8.1,
    genre: 'Анимация, Комедия',
    description: 'Новый городской конфликт и новые вызовы для героев, которые стремятся изменить правила игры.',
    image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80',
    backdrop: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1400&q=80',
    trailer_url: 'https://www.youtube.com/watch?v=8aPzQ5fV1nY',
    video_url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
    language: 'Русский',
    duration: '111 мин',
    country: 'США',
    requires_premium: false,
    featured: 'new',
    rank: 10,
  },
  {
    id: 'deadpool-rosomaha',
    title: 'Дэдпул и Росомаха',
    year: 2024,
    years: 2024,
    rating: 8.5,
    genre: 'Боевик, Комедия',
    description: 'Мрачная комедия, динамичные перестрелки и неожиданные союзы в одной из самых дерзких лент года.',
    image: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=900&q=80',
    backdrop: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1400&q=80',
    trailer_url: 'https://www.youtube.com/watch?v=3w0F4y0Tk9Q',
    video_url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    language: 'Русский',
    duration: '126 мин',
    country: 'США',
    requires_premium: true,
    featured: 'watchlist',
    rank: 11,
  },
  {
    id: 'inside-out-2',
    title: 'Головоломка 2',
    year: 2024,
    years: 2024,
    rating: 8.0,
    genre: 'Анимация, Комедия',
    description: 'Эмоции снова выходят на новый уровень, когда привычная рутина сталкивается с неожиданной проблемой.',
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=900&q=80',
    backdrop: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1400&q=80',
    trailer_url: 'https://www.youtube.com/watch?v=9v7M6I5K1rc',
    video_url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
    language: 'Русский',
    duration: '96 мин',
    country: 'США',
    requires_premium: false,
    featured: 'watchlist',
    rank: 12,
  },
  {
    id: 'batman-dusk',
    title: 'Бэтмен: Сумерки',
    year: 2025,
    years: 2025,
    rating: 8.4,
    genre: 'Боевик, Драма',
    description: 'Тёмный рыцарь сталкивается с угрозой, способной стереть грань между правдой и мифом.',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=80',
    backdrop: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80',
    trailer_url: 'https://www.youtube.com/watch?v=9wUs_3b9VJg',
    video_url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    language: 'Русский',
    duration: '154 мин',
    country: 'США',
    requires_premium: true,
    featured: 'top10',
    rank: 13,
  },
  {
    id: 'star-wars-galaxy',
    title: 'Звёздные войны: Пределы галактики',
    year: 2025,
    years: 2025,
    rating: 8.7,
    genre: 'Фантастика, Приключения',
    description: 'Новая галактическая одиссея раскрывает древнюю тайну, способную изменить всё вокруг.',
    image: 'https://images.unsplash.com/photo-1460813158188-2d1fce2d3e20?auto=format&fit=crop&w=900&q=80',
    backdrop: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1400&q=80',
    trailer_url: 'https://www.youtube.com/watch?v=Q0CbN8sfihY',
    video_url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
    language: 'Русский',
    duration: '142 мин',
    country: 'США',
    requires_premium: true,
    featured: 'top10',
    rank: 14,
  },
  {
    id: 'captain-america-new-world',
    title: 'Капитан Америка: Новый мир',
    year: 2025,
    years: 2025,
    rating: 8.5,
    genre: 'Фантастика, Боевик',
    description: 'Капитан и его союзники возвращаются в бой, когда мировая карта начинает меняться.',
    image: 'https://images.unsplash.com/photo-1513106580091-1d82408b8cd6?auto=format&fit=crop&w=900&q=80',
    backdrop: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1400&q=80',
    trailer_url: 'https://www.youtube.com/watch?v=khYQ0r-ls2Y',
    video_url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    language: 'Русский',
    duration: '138 мин',
    country: 'США',
    requires_premium: true,
    featured: 'new',
    rank: 15,
  },
  {
    id: 'wolf-time',
    title: 'Время волков',
    year: 2024,
    years: 2024,
    rating: 8.2,
    genre: 'Драма, Триллер',
    description: 'Охотники и преследуемые быстро понимают, что в этой игре нет победителей без потерь.',
    image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=900&q=80',
    backdrop: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80',
    trailer_url: 'https://www.youtube.com/watch?v=1u7m2bO7z-4',
    video_url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
    language: 'Русский',
    duration: '120 мин',
    country: 'США',
    requires_premium: true,
    featured: 'watchlist',
    rank: 16,
  },
  {
    id: 'waiting-last-battle',
    title: 'Ожидание: Последняя битва',
    year: 2025,
    years: 2025,
    rating: 8.1,
    genre: 'Боевик, Триллер',
    description: 'Лишенные времени герои вынуждены сделать выбор между спасением мира и собственными ценностями.',
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=900&q=80',
    backdrop: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1400&q=80',
    trailer_url: 'https://www.youtube.com/watch?v=1sYfY1pdy-E',
    video_url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    language: 'Русский',
    duration: '129 мин',
    country: 'США',
    requires_premium: true,
    featured: 'new',
    rank: 17,
  },
];

export const defaultHeroBanners = [
  {
    id: 'hero-1',
    title: 'Человек-паук: Новый день',
    subtitle: 'Новая главная история в кино',
    description: 'Самые ожидаемые премьеры, масштабные события и острые сюжеты в одном месте.',
    image: defaultMovieCatalog[0]?.backdrop,
  },
  {
    id: 'hero-2',
    title: 'Миссия невыполнима: Финальная расплата',
    subtitle: 'Только лучшие действия',
    description: 'Легендарные боевики, напряжение без остановки и сцены, которые держат в напряжении до последней минуты.',
    image: defaultMovieCatalog[1]?.backdrop,
  },
  {
    id: 'hero-3',
    title: 'Топ-250 русских и мировых релизов',
    subtitle: 'Кино без пауз и тормозов',
    description: 'Смотрите фильмы в лучшем качестве, стабильно и без тормозов.',
    image: 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=1400&q=80',
  },
];

export const getMovieCatalog = () => {
  const raw = safeStorage.get(storageKeys.movies);
  if (!raw) return defaultMovieCatalog;

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : defaultMovieCatalog;
  } catch (error) {
    return defaultMovieCatalog;
  }
};

export const saveMovieCatalog = (movies) => {
  safeStorage.set(storageKeys.movies, JSON.stringify(movies));
};

export const getHeroBanners = () => {
  const raw = safeStorage.get(storageKeys.settings);
  if (!raw) return defaultHeroBanners;

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : defaultHeroBanners;
  } catch (error) {
    return defaultHeroBanners;
  }
};

export const getTopTenMovies = (movies = getMovieCatalog()) =>
  [...movies].sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0)).slice(0, 10);

export const getNewReleases = (movies = getMovieCatalog()) =>
  [...movies].sort((a, b) => (Number(b.year || b.years) || 0) - (Number(a.year || a.years) || 0)).slice(0, 12);

export const getMyListMovies = (movies = getMovieCatalog()) => {
  const raw = safeStorage.get('noexit_watchlist');
  if (!raw) return [];

  try {
    const ids = JSON.parse(raw);
    return Array.isArray(ids)
      ? movies.filter((movie) => ids.includes(movie.id)).slice(0, 12)
      : [];
  } catch (error) {
    return [];
  }
};

export const saveMyListMovies = (movieIds) => {
  safeStorage.set('noexit_watchlist', JSON.stringify(Array.isArray(movieIds) ? movieIds : []));
};

export const localUserStorageKey = 'noexit_user_profile';

export const getCurrentUserProfile = () => {
  try {
    const raw = safeStorage.get(localUserStorageKey);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
};

export const saveCurrentUserProfile = (profile) => {
  safeStorage.set(localUserStorageKey, JSON.stringify(profile));
};

export const isPremiumAccessActive = () => {
  const profile = getCurrentUserProfile();
  if (!profile || !profile.is_premium) return false;
  if (!profile.subscription_expires_at) return true;
  return new Date(profile.subscription_expires_at) > new Date();
};

export const setPremiumAccess = (months = 1) => {
  const profile = getCurrentUserProfile();
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + Number(months || 1));

  const updated = {
    ...profile,
    is_premium: true,
    subscription_expires_at: expiresAt.toISOString(),
  };

  saveCurrentUserProfile(updated);
  return updated;
};

export const clearPremiumAccess = () => {
  const profile = getCurrentUserProfile();
  if (!profile) return null;

  const updated = { ...profile, is_premium: false, subscription_expires_at: null };
  saveCurrentUserProfile(updated);
  return updated;
};
