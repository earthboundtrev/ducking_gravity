import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { AerialSilks } from './pages/AerialSilks';
import { Eggs } from './pages/Eggs';

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/aerial-silks" element={<AerialSilks />} />
            <Route path="/eggs" element={<Eggs />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}