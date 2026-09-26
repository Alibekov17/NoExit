import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Catalog from './components/Catalog';
import Home from './pages/Home';
import MovieDetail from './pages/MovieDetail';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';
import CheckoutPage from './pages/CheckoutPage';
import MainPage from './pages/MainPage';
import PaymentForm from './pages/PaymentForm';
import AdminPayments from './pages/AdminPayments';
import AdminGate from './components/AdminGate';
import Series from './pages/Series';
import CartoonsPage from './pages/CartoonsPage';
import HorrorPage from './pages/HorrorPage';
import ActionPage from './pages/ActionPage';
import FilmsPage from './pages/FilmsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import './App.css';

function App() {
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setBooting(false), 1600);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <Router>
      {booting && (
        <div className="boot-screen" aria-live="polite">
          <div className="boot-logo-wrap">
            <div className="boot-icon">N</div>
            <div className="boot-title">
              <span className="boot-no">NO</span>
              <span className="boot-exit">EXIT</span>
            </div>
          </div>
          <div className="boot-loader" />
        </div>
      )}

      {!booting && (
        <div className="app-layout">
          <Header />
          <Sidebar />

          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/main" element={<MainPage />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/movie/:id" element={<MovieDetail />} />
              <Route path="/admin" element={<AdminGate><AdminPage /></AdminGate>} />
              <Route path="/admin/payments" element={<AdminGate><AdminPayments /></AdminGate>} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/pay" element={<PaymentForm />} />
              <Route path="/series" element={<Series />} />
              <Route path="/cartoons" element={<CartoonsPage />} />
              <Route path="/horror" element={<HorrorPage />} />
              <Route path="/action" element={<ActionPage />} />
              <Route path="/films" element={<FilmsPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
            </Routes>
          </main>

          <footer className="app-footer">
            <span>© 2026 NO EXIT</span>
            <Link to="/privacy">Политика конфиденциальности</Link>
          </footer>
        </div>
      )}
    </Router>
  );
}

export default App;