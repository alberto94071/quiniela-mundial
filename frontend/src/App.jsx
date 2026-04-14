import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './lib/AuthContext';
import { ToastProvider } from './lib/ToastContext';
import { keepAlive } from './lib/api';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Matches from './pages/Matches';
import Leaderboard from './pages/Leaderboard';
import MyPredictions from './pages/MyPredictions';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';
import './styles/global.css';

export default function App() {
  useEffect(() => {
    const cleanup = keepAlive();
    return cleanup;
  }, []);

  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Register />} />
            <Route path="/partidos" element={<Matches />} />
            <Route path="/tabla" element={<Leaderboard />} />
            <Route path="/mis-pronosticos" element={<MyPredictions />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
