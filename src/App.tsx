import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
// Keep imports but comment out unused ones for now
/*
import { Home } from './pages/Home';
import { About } from './pages/About';
import { AerialSilks } from './pages/AerialSilks';
*/
import { Eggs } from './pages/Eggs';
import { Donate } from './pages/Donate';
import { DonationSuccess } from './pages/DonationSuccess';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Comment out all routes except Donate and redirect root to /donate */}
              <Route path="/" element={<Donate />} />
              {/*
              <Route path="/about" element={<About />} />
              <Route path="/aerial-silks" element={<AerialSilks />} />
              */}
              <Route path="/eggs" element={<Eggs />} />
              <Route path="/donate" element={<Donate />} />
              <Route path="/donation-success" element={<DonationSuccess />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ErrorBoundary>
  );
}