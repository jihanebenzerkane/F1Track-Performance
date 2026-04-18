import { useState, useEffect } from 'react'
import { getTeamColor, getFlag } from '../api/images'
import { getCircuits, getRacePredictions, getRacesBySeason } from '../api/f1api'

function formatDriverName(id) {
  if (!id) return '—'
  return id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export default function PredictionsPage() {
  const season = 2026;
  const [circuits, setCircuits] = useState([])
  const [races, setRaces] = useState([])
  const [circuitId, setCircuitId] = useState('')
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(false)
  const [listLoading, setListLoading] = useState(true)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setListLoading(true)
    Promise.all([
      getCircuits(),
      getRacesBySeason(season)
    ]).then(([circuitsData, racesData]) => {
      setCircuits(circuitsData)
      
      const now = new Date()
      const futureRaces = (racesData || []).filter(race => new Date(race.raceDate) > now)
      setRaces(futureRaces)

      if (futureRaces && futureRaces.length > 0) {
        const firstRace = futureRaces[0];
        const c = circuitsData.find(c => c.name === firstRace.circuit || c.id === firstRace.circuit) || {};
        setCircuitId(c.id || firstRace.circuit);
      } else if (circuitsData.length > 0) {
        setCircuitId(circuitsData[0].id)
      }
      setListLoading(false)
    }).catch(() => setListLoading(false))
  }, [season])

  const loadPredictions = () => {
    if (!circuitId) return
    setLoading(true)
    setLoaded(false)
    getRacePredictions(circuitId)
      .then(data => { 
        setPredictions(data)
        setLoading(false)
        setLoaded(true) 
      })
      .catch(() => setLoading(false))
  }

  const selected = circuits.find(c => c.id === circuitId)

  return (
    <div>
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 style={{ 
          fontFamily: "'Formula1', sans-serif", 
          fontSize: '32px', 
          fontWeight: 900, 
          textTransform: 'uppercase', 
          marginBottom: '8px',
          letterSpacing: '2px'
        }}>
          Race <span style={{ color: '#E4002B' }}>Predictions</span>
        </h1>
        <p style={{ 
          color: '#8591a3', 
          fontSize: '14px',
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: '1px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }}>
          Monte Carlo simulation algorithm calculating win probability
          <span style={{
            background: 'rgba(228, 0, 43, 0.08)',
            border: '1px solid rgba(228, 0, 43, 0.3)',
            borderRadius: '4px',
            color: '#E4002B',
            fontSize: '9px',
            padding: '2px 8px',
            fontWeight: 700,
            letterSpacing: '1px'
          }}>2026 REGULATION ACTIVE</span>
        </p>
      </div>

      {/* Circuit Selector */}
      <div style={{ 
        background: '#0a0a0a', 
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.1)', 
        borderRadius: '16px', 
        padding: '32px', 
        marginBottom: '32px' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ fontFamily: "'Formula1', sans-serif", fontSize: '11px', letterSpacing: '2px', color: '#E4002B', textTransform: 'uppercase' }}>
            Upcoming 2026 Races
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
          {races.map(race => {
            const c = circuits.find(circuit => circuit.name === race.circuit || circuit.id === race.circuit) || {};
            const activeId = c.id || race.circuit;
            const dateStr = new Date(race.raceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            return (
              <button
                key={race.id}
                onClick={() => setCircuitId(activeId)}
                style={{
                  padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
                  fontFamily: "'Formula1', sans-serif", fontSize: '11px', fontWeight: 700,
                  border: `1px solid ${circuitId === activeId ? 'rgba(228,0,43,0.6)' : 'rgba(255,255,255,0.07)'}`,
                  background: circuitId === activeId ? 'rgba(228,0,43,0.12)' : '#141414',
                  color: circuitId === activeId ? '#fff' : '#8591a3',
                  transition: 'all 0.2s',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
                }}
              >
                <div>{getFlag(c.countryId)} {race.grandPrix}</div>
                <div style={{ fontSize: '9px', fontWeight: 400, color: circuitId === activeId ? '#E4002B' : '#555866' }}>
                  {dateStr}
                </div>
              </button>
            );
          })}
        </div>
        <button
          onClick={loadPredictions}
          disabled={loading || !circuitId}
          style={{
            padding: '12px 28px', background: '#E4002B', border: 'none', borderRadius: '8px',
            color: '#fff', fontWeight: 700, fontSize: '14px',
            fontFamily: "'Formula1', sans-serif", cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(228, 0, 43, 0.3)',
            opacity: (loading || !circuitId) ? 0.7 : 1,
            textTransform: 'uppercase'
          }}
        >
          {loading ? 'Processing...' : `Predict ${selected?.name || ''} Winner`}
        </button>
      </div>

      {/* Results */}
      {loaded && predictions.length > 0 && (
        <div>
          <div style={{ fontFamily: "'Formula1', sans-serif", fontSize: '11px', letterSpacing: '2px', color: '#8591a3', textTransform: 'uppercase', marginBottom: '16px' }}>
            Prediction Results — {getFlag(selected?.countryId)} {selected?.name}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            {predictions?.slice(0, 3).map((p, i) => {
              const medalsColor = ['#E4002B', '#C0C0C0', '#CD7F32']
              const teamColor = getTeamColor(p.team)
              return (
                <div key={p.driver || i} style={{
                  background: '#0a0a0a', 
                  backdropFilter: 'blur(24px)',
                  border: `1px solid ${i === 0 ? 'rgba(228, 0, 43, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                  borderRadius: '16px', 
                  padding: '32px', 
                  textAlign: 'center',
                  boxShadow: i === 0 ? '0 0 50px rgba(228, 0, 43, 0.12)' : 'none',
                  opacity: 0,
                  transform: 'translateY(20px)',
                  animation: 'fadeUp 0.5s ease forwards',
                  animationDelay: `${i * 0.15}s`
                }}>
                  <div style={{ fontSize: '36px', marginBottom: '8px', fontFamily: "'Formula1', sans-serif", fontWeight: 900, color: medalsColor[i] }}>{i + 1}</div>
                  <div style={{ fontFamily: "'Formula1', sans-serif", fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>{formatDriverName(p.driver)}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '16px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: teamColor }} />
                    <span style={{ fontSize: '12px', color: '#8591a3' }}>{p.team}</span>
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 900, color: medalsColor[i], fontFamily: "'JetBrains Mono', monospace" }}>
                    {p.predictionScore}%
                  </div>
                  <div style={{ fontSize: '11px', color: '#8591a3', marginTop: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Win Probability</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '16px' }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', padding: '10px', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#E4002B', fontFamily: "'JetBrains Mono', monospace" }}>{p.circuitWinRate}</div>
                      <div style={{ fontSize: '9px', color: '#8591a3', textTransform: 'uppercase', letterSpacing: '1px' }}>History</div>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', padding: '10px', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', fontFamily: "'JetBrains Mono', monospace" }}>{p.recentFormScore}</div>
                      <div style={{ fontSize: '9px', color: '#8591a3', textTransform: 'uppercase' }}>Recent Form</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Full table */}
          <div style={{ 
            background: '#0a0a0a', 
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.1)', 
            borderRadius: '16px', 
            overflow: 'hidden' 
          }}>
            <div style={{ 
              display: 'grid', gridTemplateColumns: '60px 2fr 1.5fr 120px 120px 100px', 
              padding: '16px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', 
              color: '#8591a3', fontSize: '10px', letterSpacing: '2px', 
              textTransform: 'uppercase', fontFamily: "'Formula1', sans-serif" 
            }}>
              <div>Rank</div><div>Driver</div><div>Team</div><div>Circuit Rate</div><div>Recent Form</div><div style={{ textAlign: 'right' }}>Score</div>
            </div>
            {predictions?.map((p, i) => {
              const teamColor = getTeamColor(p.team)
              return (
                <div key={p.driver || i} style={{
                  display: 'grid', gridTemplateColumns: '60px 2fr 1.5fr 120px 120px 100px',
                  padding: '16px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  alignItems: 'center', background: 'transparent',
                  transition: 'background 0.15s',
                  opacity: 0,
                  transform: 'translateY(10px)',
                  animation: 'fadeUp 0.4s ease forwards',
                  animationDelay: `${0.5 + i * 0.05}s`
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: i < 3 ? '#E4002B' : '#8591a3' }}>{p.rank}</div>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>{formatDriverName(p.driver)}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: teamColor }} />
                    <span style={{ fontSize: '13px', color: '#c0c8d8' }}>{p.team}</span>
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", color: '#E4002B', fontSize: '13px' }}>{p.circuitWinRate}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", color: '#a3a3a3', fontSize: '13px' }}>{p.recentFormScore}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, textAlign: 'right', color: i === 0 ? '#E4002B' : '#f4f5f8' }}>{p.predictionScore}%</div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}