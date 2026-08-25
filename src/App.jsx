import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Catalog from './components/Catalog';
import HomeBanner from './components/HomeBanner';
import Home from './pages/Home';
import MovieCatalog from './pages/MovieCatalog';
import MovieDetail from './pages/MovieDetail';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';
import CheckoutPage from './pages/CheckoutPage';
import MainPage from './pages/MainPage';
import PaymentForm from './pages/PaymentForm';
import AdminPayments from './pages/AdminPayments';
import Series from './pages/Series';
import CartoonsPage from './pages/CartoonsPage';
import HorrorPage from './pages/HorrorPage';
import ActionPage from './pages/ActionPage';
import FilmsPage from './pages/FilmsPage';
import './App.css';



function App() {
  return (
    <Router>
      <div className="app-layout">
        <Header />
        <Sidebar />
       
        <main className="main-content">
          <Routes>
            {/* Главная страница (если нужно выводить несколько элементов на главной, лучше объединить их в компонент Home) */}
            <Route path="/" element={<Home />} />
            <Route path="/main" element={<MainPage />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/movie/:id" element={<MovieDetail />} />
            
            {/* Админ-панель (объединили логику страниц админки, либо вы можете сделать подмаршруты) */}
            
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/payments" element={<AdminPayments />} />

            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/pay" element={<PaymentForm />} />
            <Route path="/series" element={<Series />} />
            <Route path="/cartoons" element={<CartoonsPage />} />
            <Route path="/horror" element={<HorrorPage />} />
            <Route path="/action" element={<ActionPage />} />
            <Route path="/films" element={<FilmsPage />} />
          </Routes>
        </main>
        
      
      </div>
    </Router>
  );
}

export default App;