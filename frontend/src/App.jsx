import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import StandingsPage from './pages/StandingsPage'
import FormPage from './pages/FormPage'
import PredictionsPage from './pages/PredictionsPage.jsx'
import H2HPage from './pages/H2HPage'
import CircuitPage from './pages/CircuitPage'
import PitStrategyPage from './pages/PitStrategyPage'
import DriverPage from './pages/DriverPage'

const navStyle = {
  display: 'flex', alignItems: 'center', gap: '4px'
}

const linkStyle = ({ isActive }) => ({
  background: 'none',
  border: 'none',
  color: isActive ? '#e8002d' : '#6b6b90',
  fontFamily: "'Titillium Web', sans-serif",
  fontSize: '13px',
  fontWeight: '700',
  padding: '6px 14px',
  borderRadius: '6px',
  cursor: 'pointer',
  textDecoration: 'none',
  backgroundColor: isActive ? 'rgba(232,0,45,0.1)' : 'transparent',
  letterSpacing: '.02em',
  transition: 'all .15s',
})

export default function App() {
  return (
    <BrowserRouter>
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(8,8,15,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '0 32px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: '60px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px', height: '32px',
            background: '#e8002d',
            clipPath: 'polygon(0 0, 85% 0, 100% 50%, 85% 100%, 0 100%, 15% 50%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: '900', color: '#fff',
          }}>F1</div>
          <span style={{
            fontSize: '20px', fontWeight: '900',
            letterSpacing: '-.03em', fontFamily: "'Titillium Web', sans-serif",
          }}>
            F1<span style={{ color: '#e8002d' }}>Track</span>
          </span>
        </div>

        <nav style={navStyle}>
          <NavLink to="/" end style={linkStyle}>Standings</NavLink>
          <NavLink to="/form" style={linkStyle}>Driver Form</NavLink>
          <NavLink to="/predictions" style={linkStyle}>Predictions</NavLink>
          <NavLink to="/h2h" style={linkStyle}>Head to Head</NavLink>
          <NavLink to="/circuit" style={linkStyle}>Circuit History</NavLink>
          <NavLink to="/pitstrategy" style={linkStyle}>Pit Strategy</NavLink>
        </nav>

        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '11px', color: '#6b6b90',
          padding: '4px 10px', borderRadius: '6px',
          border: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(15,15,26,0.8)',
        }}>
          API: localhost:8081
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px' }}>
        <Routes>
          <Route path="/drivers/:id" element={<DriverPage />} />
          <Route path="/" element={<StandingsPage />} />
          <Route path="/form" element={<FormPage />} />
          <Route path="/predictions" element={<PredictionsPage />} />
          <Route path="/h2h" element={<H2HPage />} />
          <Route path="/circuit" element={<CircuitPage />} />
          <Route path="/pitstrategy" element={<PitStrategyPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}