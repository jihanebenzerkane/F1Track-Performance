import { useRef, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, NavLink, useLocation, Navigate, Link } from 'react-router-dom'
import HomePage from './pages/HomePage'
import StandingsPage from './pages/StandingsPage'
import FormPage from './pages/FormPage'
import PredictionsPage from './pages/PredictionsPage.jsx'
import H2HPage from './pages/H2HPage'
import CircuitPage from './pages/CircuitPage'
import PitStrategyPage from './pages/PitStrategyPage'
import DriverPage from './pages/DriverPage'
import CarsPage from './pages/CarsPage';
import TelemetryPage from './pages/TelemetryPage';
import Regulation2026Page from './pages/Regulation2026Page';
import RaceResultsPage from './pages/RaceResultsPage';

const linkStyle = ({ isActive }) => ({
  background: 'none',
  border: 'none',
  color: isActive ? '#FFFFFF' : '#a3a3a3',
  fontFamily: "'Formula1', sans-serif",
  fontSize: '11px',
  fontWeight: '700',
  padding: '6px 12px',
  borderRadius: '6px',
  cursor: 'pointer',
  textDecoration: 'none',
  backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
  letterSpacing: '.1em',
  transition: 'all .15s',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
  flexShrink: 0,
})

function Layout({ children }) {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <>
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(5,5,5,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
        padding: '0 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '64px',
        padding: '0 24px',
        gap: '20px',
        minWidth: 0,
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, textDecoration: 'none' }}>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/3/33/F1.svg"
            alt="F1 Logo"
            style={{ width: '44px', height: 'auto', display: 'block' }}
          />
          <span style={{
            fontSize: '16px', fontWeight: '900',
            letterSpacing: '2px', fontFamily: "'Formula1', sans-serif",
            textTransform: 'uppercase', color: '#fff',
          }}>Track</span>
        </Link>

        <nav style={{
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '4px',
          overflowX: 'auto', 
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          minWidth: 0,
          flex: 1,
          padding: '0 10px'
        }}>
          <NavLink to="/" end style={linkStyle}>Home</NavLink>
          <NavLink to="/standings" style={linkStyle}>Standings</NavLink>
          <NavLink to="/form" style={linkStyle}>Drivers</NavLink>
          <NavLink to="/predictions" style={linkStyle}>Predictions</NavLink>
          <NavLink to="/telemetry" style={linkStyle}>Telemetry</NavLink>
          <NavLink to="/pitstrategy" style={linkStyle}>Pit Strategy</NavLink>
          <NavLink to="/h2h" style={linkStyle}>H2H</NavLink>
          <NavLink to="/circuit" style={linkStyle}>Circuits</NavLink>
          <NavLink to="/cars" style={linkStyle}>Cars</NavLink>
        </nav>

        <Link to="/regulations" style={{
          fontFamily: "'Formula1', sans-serif",
          fontSize: '9px', color: '#801917ff',
          fontWeight: 900,
          padding: '8px 16px', borderRadius: '8px',
          border: '1px solid #E4002B',
          background: 'rgba(0, 0, 0, 0.1)',
          flexShrink: 0, whiteSpace: 'nowrap',
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          textDecoration: 'none',
          transition: 'all 0.2s',
          boxShadow: '0 0 10px rgba(228, 0, 43, 0.2)',
        }} onMouseEnter={e => {
  e.currentTarget.style.background = '#E4002B';
  e.currentTarget.style.color = '#FFFFFF';
  e.currentTarget.style.boxShadow = '0 0 12px rgba(228, 0, 43, 0.5)';
}} 
onMouseLeave={e => {
  e.currentTarget.style.background = 'rgba(228, 0, 43, 0.08)';
  e.currentTarget.style.color = '#E4002B';
  e.currentTarget.style.boxShadow = 'none';
        }}>
          REGULATIONS
        </Link>
      </header>

      {isHome ? (
        <div style={{ paddingTop: '60px' }}>{children}</div>
      ) : (
        <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '84px 28px 40px' }}>
          {children}
        </main>
      )}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/cars" element={<CarsPage />} />
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/standings" element={<Layout><StandingsPage /></Layout>} />
        <Route path="/drivers/:id" element={<Layout><DriverPage /></Layout>} />
        <Route path="/form" element={<Layout><FormPage /></Layout>} />
        <Route path="/predictions" element={<Layout><PredictionsPage /></Layout>} />
        <Route path="/h2h" element={<Layout><H2HPage /></Layout>} />
        <Route path="/circuit" element={<Layout><CircuitPage /></Layout>} />
        <Route path="/pitstrategy" element={<Layout><PitStrategyPage /></Layout>} />
        <Route path="/telemetry" element={<Layout><TelemetryPage /></Layout>} />
        <Route path="/regulations" element={<Layout><Regulation2026Page /></Layout>} />
        <Route path="/race-results/:raceId" element={<Layout><RaceResultsPage /></Layout>} />
        <Route path="/DriverStandings" element={<Navigate to="/standings" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
