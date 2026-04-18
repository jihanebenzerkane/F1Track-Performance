import { useState, useEffect, useRef } from 'react';
import CarViewer from '../components/CarViewer';
import CarInfoPanel from '../components/CarInfoPanel';
import { teams, teamCarFiles } from '../data/carData';
import { useNavigate } from 'react-router-dom';
import { safeGetConstructorStandings } from '../api/f1api';

export default function CarsPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPart, setSelectedPart] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const [dbTeams, setDbTeams] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    safeGetConstructorStandings(2025)
      .then(setDbTeams);
  }, []);

  const dbIdMap = {
    mercedes: 'mercedes',
    redbull: 'red-bull',
    ferrari: 'ferrari',
    mclaren: 'mclaren',
    alpine: 'alpine',
    aston: 'aston-martin'
  };

  const selectedTeam = teams[currentIndex];
  // Match frontend generic ID to F1db ID
  const selectedTeamDbStats = dbTeams.find(t => t.id === dbIdMap[selectedTeam.id]);

  const goTo = (index) => {
    if (transitioning || index === currentIndex) return;
    setTransitioning(true);
    setSelectedPart(null);
    setTimeout(() => {
      setCurrentIndex(index);
      setTransitioning(false);
    }, 400);
  };

  const prev = () => goTo((currentIndex - 1 + teams.length) % teams.length);
  const next = () => goTo((currentIndex + 1) % teams.length);

  const handlePartClick = (partKey) => {
    if (!partKey || partKey === selectedPart) {
      setSelectedPart(null);
    } else {
      setSelectedPart(partKey);
    }
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#060606',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      left: 0,
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px',
        height: '80px',
        background: '#0a0a0a',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        flexShrink: 0,
        position: 'relative',
        zIndex: 20,
      }}>
        {/* Back + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#fff',
              padding: '8px 18px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: "'Formula1', sans-serif",
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '1px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#E4002B';
              e.currentTarget.style.background = 'rgba(228, 0, 43, 0.08)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            }}
          >
            ← BACK
          </button>
          <div style={{
            width: '2px',
            height: '32px',
            background: '#E4002B',
            transition: 'background 0.4s',
          }} />
          <span style={{
            fontFamily: "'Formula1', sans-serif",
            fontWeight: 900,
            fontSize: '24px',
            color: '#fff',
            textTransform: 'uppercase',
            letterSpacing: '3px',
          }}>
            Technical <span style={{ color: '#E4002B' }}>Studio</span>
          </span>
        </div>

        {/* Carousel selector */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}>
          {/* Prev arrow */}
          <button
            onClick={prev}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#fff',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#E4002B';
              e.currentTarget.style.background = 'rgba(228, 0, 43, 0.08)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            }}
          >
            ‹
          </button>

          {/* Team display */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: '160px',
          }}>
            <div style={{
              fontFamily: "'Formula1', sans-serif",
              fontWeight: 900,
              fontSize: '28px',
              color: '#fff',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              transition: 'all 0.4s',
              opacity: transitioning ? 0 : 1,
              transform: transitioning ? 'scale(0.95)' : 'scale(1)',
            }}>
              {selectedTeam.name}
            </div>
            {/* Dots indicator */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
              {teams.map((_, i) => (
                <div
                  key={i}
                  onClick={() => goTo(i)}
                  style={{
                    width: i === currentIndex ? '20px' : '6px',
                    height: '6px',
                    borderRadius: '3px',
                    background: i === currentIndex ? selectedTeam.color : '#222',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Next arrow */}
          <button
            onClick={next}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#fff',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#E4002B';
              e.currentTarget.style.background = 'rgba(228, 0, 43, 0.08)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            }}
          >
            ›
          </button>

          {/* Season badge */}
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '11px',
            fontWeight: 700,
            color: '#E4002B',
            letterSpacing: '3px',
            borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
            paddingLeft: '24px',
            marginLeft: '16px',
          }}>
            2026 REGULATION
          </div>
        </div>
      </div>

      {/* Main viewport */}
      <div style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        opacity: transitioning ? 0 : 1,
        transition: 'opacity 0.3s',
      }}>
        <CarViewer
          key={selectedTeam.id}
          modelPath={teamCarFiles[selectedTeam.id]}
          teamColor={selectedTeam.color}
          onPartClick={handlePartClick}
          selectedPart={selectedPart}
        />

        <CarInfoPanel
          selectedPart={selectedPart}
          teamId={selectedTeam.id}
          teamColor={selectedTeam.color}
          dbStats={selectedTeamDbStats}
          onClose={() => setSelectedPart(null)}
        />
      </div>
    </div>
  );
}