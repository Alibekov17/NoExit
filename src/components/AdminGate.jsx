import { useEffect, useState } from 'react';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { supabase } from '../supabaseClient';
import './AdminGate.css';

const ADMIN_EMAIL_DOMAIN = '@noexit.local';

export default function AdminGate({ children }) {
  const [checkingSession, setCheckingSession] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isActive = true;
    const checkSession = async () => {
      const { data } = await supabase.auth.getUser();
      if (!isActive) return;

      if (data.user?.app_metadata?.role === 'admin') {
        setIsAdmin(true);
      }
      setCheckingSession(false);
    };

    void checkSession();
    return () => {
      isActive = false;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    const normalizedUsername = username.trim().toLowerCase();
    const email = `${normalizedUsername}${ADMIN_EMAIL_DOMAIN}`;

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError || data.user?.app_metadata?.role !== 'admin') {
        if (data.user) await supabase.auth.signOut();
        throw new Error('Неверный логин или пароль.');
      }

      setIsAdmin(true);
      setPassword('');
    } catch {
      setError('Неверный логин или пароль.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (checkingSession) {
    return <div className="admin-gate-status">Проверка доступа...</div>;
  }

  if (isAdmin) return children;

  return (
    <section className="admin-gate">
      <form className="admin-gate-form" onSubmit={handleSubmit}>
        <ShieldCheck className="admin-gate-icon" size={34} aria-hidden="true" />
        <h1>Вход администратора</h1>
        <label>
          Логин
          <span className="admin-gate-input">
            <LockKeyhole size={17} aria-hidden="true" />
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </span>
        </label>
        <label>
          Пароль
          <span className="admin-gate-input">
            <LockKeyhole size={17} aria-hidden="true" />
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </span>
        </label>
        {error && <p className="admin-gate-error" role="alert">{error}</p>}
        <button className="admin-gate-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Проверка...' : 'Войти'}
        </button>
      </form>
    </section>
  );
}