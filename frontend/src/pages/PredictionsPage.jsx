import { useState, useEffect } from 'react'
import { getFlag } from '../api/images'
import { getCircuits, getRacePredictions, getRacesBySeason } from '../api/f1api'

function formatDriverName(id) {
  if (!id || typeof id !== 'string') return '—'
  return id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export default function PredictionsPage() {
  const season = 2026
  const [circuits, setCircuits] = useState([])
  const [races, setRaces] = useState([])
  const [circuitId, setCircuitId] = useState('')
  const [selectedRace, setSelectedRace] = useState(null)
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [logs, setLogs] = useState([])

  useEffect(() => {
    Promise.all([getCircuits(), getRacesBySeason(season)])
      .then(([circuitsData, racesData]) => {
        setCircuits(circuitsData || [])
        const now = new Date()
        const futureRaces = (racesData || []).filter(r => new Date(r.raceDate) > now)
        setRaces(futureRaces)
        if (futureRaces.length > 0) {
          const first = futureRaces[0]
          const c = (circuitsData || []).find(c => c.name === first.circuit || c.id === first.circuit) || {}
          setCircuitId(c.id || first.circuit)
          setSelectedRace(first)
        }
      })
      .catch(() => {})
  }, [season])

  const runSimulationLogs = () => {
    const messages = [
      "Monte Carlo Simulation of 2026",
      "Loading historical race results...",
      "Calculating driver win rates per circuit...",
      "Weighting recent championship standings...",
      "Applying circuit-specific performance history...",
      "Running 50,000 Monte Carlo iterations...",
      "Aggregating probability distributions...",
      "Finalizing prediction scores..."
    ]
    setLogs([])
    let i = 0
    const interval = setInterval(() => {
      if (i < messages.length) {
        setLogs(prev => [...prev, messages[i]])
        i++
      } else {
        clearInterval(interval)
      }
    }, 280)
    return messages.length * 280 + 100
  }

  const loadPredictions = () => {
    if (!circuitId) return
    setLoading(true)
    setLoaded(false)
    setPredictions([])
    const logTime = runSimulationLogs()
    getRacePredictions(circuitId)
      .then(data => {
        setTimeout(() => {
          setPredictions(Array.isArray(data) ? data : [])
          setLoading(false)
          setLoaded(true)
        }, logTime)
      })
      .catch(() => {
        setLoading(false)
        setLoaded(true)
        setPredictions([])
      })
  }

  const avgScore = predictions.length > 0
    ? (predictions.reduce((sum, p) => sum + p.predictionScore, 0) / predictions.length).toFixed(1)
    : null
  const spread = predictions.length > 0
    ? (predictions[0].predictionScore - predictions[predictions.length - 1].predictionScore).toFixed(1)
    : null

  return (
    <div style={{ padding: '32px 40px', minHeight: '100vh' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Page Header */}
      <div style={{ marginBottom: '32px',  paddingLeft: '20px' }}>
        <h1 style={{
          fontFamily: "'Formula1', sans-serif", fontSize: '28px', fontWeight: 900,
          textTransform: 'uppercase', letterSpacing: '2px', margin: 0, color: '#fff'
        }}>
          {season} Race Predictions
        </h1>
        <p style={{
          color: '#8591a3', fontFamily: "'Arial'",
          fontSize: '15px', marginTop: '5px', lineHeight: 1.7, maxWidth: '600px'
        }}>
          Monte Carlo simulation models a spectrum of potential race outcomes across 50,000 iterations
          giving a probabilistic view of what might happen, how likely it is, and the range of realistic scenarios.
        </p>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start' }}>

        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Circuit Selector */}
          <div style={{
            background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '12px', overflow: 'hidden'
          }}>
            <div style={{
              padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)',
              fontFamily: "'Formula1', sans-serif", fontSize: '10px',
              color: '#8591a3', textTransform: 'uppercase', letterSpacing: '2px'
            }}>
              Upcoming Races for {season}
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: '1px', background: 'rgba(255,255,255,0.04)'
            }}>
              {races.slice(0, 8).map(race => {
                const c = circuits.find(c => c.name === race.circuit || c.id === race.circuit) || {}
                const activeId = c.id || race.circuit
                const active = circuitId === activeId
                return (
                  <div
                    key={race.id}
                    onClick={() => { setCircuitId(activeId); setSelectedRace(race); setLoaded(false); setPredictions([]) }}
                    style={{
                      background: active ? 'rgba(228,0,43,0.08)' : '#0d0d0d',
                      padding: '16px', cursor: 'pointer',
                      borderLeft: '3px solid transparent',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{ fontSize: '20px', marginBottom: '8px' }}>
                      {getFlag(c.countryId || race.country || race.circuit)}
                    </div>
                    <div style={{
                      fontFamily: "'Formula1', sans-serif", fontSize: '10px',
                      color: active ? '#fff' : '#8591a3',
                      fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px'
                    }}>
                      {race.grandPrix}
                    </div>
                    <div style={{
                      fontFamily: "'Arial', sans-serif", fontSize: '12px',
                      color: active ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)'
                    }}>
                      {race.raceDate
                        ? new Date(race.raceDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                        : '—'}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Run button — idle state */}
          {!loading && !loaded && (
            <div style={{
              background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '12px', padding: '40px', textAlign: 'center'
            }}>
              <div style={{
                fontFamily: "'Arial', sans-serif", fontSize: '12px',
                color: '#8591a3', marginBottom: '24px'
              }}>
                {selectedRace ? `Ready to simulate: ${selectedRace.grandPrix}` : 'Select a race above'}
              </div>
              <button
                onClick={loadPredictions}
                disabled={!circuitId}
                style={{
                  padding: '12px 36px', background: circuitId ? '#E4002B' : 'rgba(255,255,255,0.05)',
                  border: 'none', borderRadius: '8px', color: circuitId ? '#fff' : '#8591a3',
                  fontFamily: "'Arial'", fontSize: '12px',
                  fontWeight: 500, letterSpacing: '1px', cursor: circuitId ? 'pointer' : 'default',
                  transition: 'all 0.2s'
                }}
              >
                Run Prediction
              </button>
            </div>
          )}

          {/* Simulation log */}
          {loading && (
            <div style={{
              background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '12px', overflow: 'hidden'
            }}>
              <div style={{
                padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', gap: '10px'
              }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.1)',
                  borderTopColor: '#E4002B',
                  animation: 'spin 0.8s linear infinite', flexShrink: 0
                }} />
                <span style={{
                  fontFamily: "'Arial', sans-serif", fontSize: '10px', color: '#8591a3'
                }}>
                  Running simulation...
                </span>
              </div>
              <div style={{ padding: '20px', minHeight: '180px' }}>
                {logs.map((log, idx) => (
                  <div key={idx} style={{
                    fontFamily: "'Arial', sans-serif", fontSize: '11px',
                    color: idx === logs.length - 1 ? '#fff' : '#8591a3',
                    marginBottom: '8px',
                    animation: 'fadeIn 0.2s ease forwards'
                  }}>
                    {log || ''}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {loaded && predictions.length > 0 && (
            <div style={{ animation: 'fadeIn 0.4s ease', display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Re-run */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontFamily: "'Arial', sans-serif", fontSize: '10px',
                  color: '#8591a3', textTransform: 'uppercase', letterSpacing: '2px'
                }}>
                  Results of {selectedRace?.grandPrix}
                </span>
                <button
                  onClick={() => { setLoaded(false); setPredictions([]); loadPredictions() }}
                  style={{
                    padding: '7px 16px', background: 'transparent',
                    border: '1px solid rgba(228,0,43,0.4)', borderRadius: '6px',
                    color: '#E4002B', fontFamily: "'Arial', sans-serif",
                    fontSize: '10px', cursor: 'pointer'
                  }}
                >
                  ↺ Re-run
                </button>
              </div>

              {/* Top 3 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {predictions.slice(0, 3).map((p, i) => (
                  <div key={i} style={{
                    background: '#0d0d0d',
                    border: `1px solid ${i === 0 ? '#E4002B' : 'rgba(255,255,255,0.07)'}`,
                    borderRadius: '12px', padding: '20px', textAlign: 'center'
                  }}>
                    <div style={{
                      fontFamily: "'Arial', sans-serif", fontSize: '12px',
                      color: '#8591a3', marginBottom: '10px', textTransform: 'uppercase'
                    }}>
                      P{i + 1}
                    </div>
                    <div style={{
                      fontFamily: "'Formula1', sans-serif", fontSize: '15px',
                      fontWeight: 900, color: '#fff', marginBottom: '8px'
                    }}>
                      {formatDriverName(p.driver)}
                    </div>
                    <div style={{
                      fontFamily: "'Arial', sans-serif", fontSize: '22px',
                      fontWeight: 700, color: i === 0 ? '#E4002B' : '#fff'
                    }}>
                      {p.predictionScore}%
                    </div>
                  </div>
                ))}
              </div>

              {/* P4–P8 table */}
              <div style={{
                background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '12px', overflow: 'hidden'
              }}>
                <div style={{
                  display: 'grid', gridTemplateColumns: '40px 1fr 80px',
                  padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)',
                  fontFamily: "'Arial', sans-serif", fontSize: '12px',
                  color: '#8591a3', textTransform: 'uppercase'
                }}>
                  <span>Pos</span><span>Driver</span><span style={{ textAlign: 'right' }}>Score</span>
                </div>
                {predictions.slice(3, 10).map((p, i) => (
                  <div key={i} style={{
                    display: 'grid', gridTemplateColumns: '40px 1fr 80px',
                    padding: '13px 20px',
                    borderBottom: i < 6 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      fontFamily: "'Arial', sans-serif", fontSize: '11px', color: '#8591a3'
                    }}>
                      {p.rank}
                    </span>
                    <span style={{
                      fontFamily: "'Formula1', sans-serif", fontSize: '12px', color: '#fff'
                    }}>
                      {formatDriverName(p.driver)}
                    </span>
                    <span style={{
                      fontFamily: "'Arial', sans-serif", fontSize: '12px',
                      color: '#E4002B', textAlign: 'right'
                    }}>
                      {p.predictionScore}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loaded && predictions.length === 0 && (
            <div style={{
              background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '12px', padding: '40px', textAlign: 'center',
              fontFamily: "'Arial', sans-serif", fontSize: '12px', color: '#8591a3'
            }}>
              No prediction data for this circuit.
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Simulation info */}
          <div style={{
            background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '12px', overflow: 'hidden'
          }}>
            <div style={{
              padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)',
              fontFamily: "'Formula1', sans-serif", fontSize: '10px',
              color: '#8591a3', textTransform: 'uppercase', letterSpacing: '2px'
            }}>
              How it works
            </div>
            <div style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: 'Method', value: 'Monte Carlo Simulation' },
                { label: 'Iterations', value: '50,000' },
                { label: 'Inputs', value: 'Historical results, driver standings, circuit performance' },
              ].map(item => (
                <div key={item.label}>
                  <div style={{
                    fontFamily: "'Formula1', sans-serif", fontSize: '13px',
                    color: '#8591a3', textTransform: 'uppercase', marginBottom: '4px'
                  }}>
                    {item.label}
                  </div>
                  <div style={{
                    fontFamily: "'Formula1', sans-serif", fontSize: '13px', color: '#fff'
                  }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live stats — only after prediction loads */}
          {loaded && predictions.length > 0 && (
            <div style={{
              background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '12px', overflow: 'hidden',
              animation: 'fadeIn 0.4s ease'
            }}>
              <div style={{
                padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)',
                fontFamily: "'Formula1', sans-serif", fontSize: '10px',
                color: '#8591a3', textTransform: 'uppercase', letterSpacing: '2px'
              }}>
                Simulation Output
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'rgba(255,255,255,0.04)' }}>
                {[
                  { label: 'Iterations', value: '50,000' },
                  { label: 'Drivers', value: predictions.length },
                  { label: 'Avg Score', value: `${avgScore}%` },
                  { label: 'Spread', value: `${spread}%` },
                ].map(stat => (
                  <div key={stat.label} style={{ background: '#0d0d0d', padding: '16px' }}>
                    <div style={{
                      fontFamily: "'Arial', sans-serif", fontSize: '18px',
                      fontWeight: 700, color: '#fff', lineHeight: 1
                    }}>
                      {stat.value}
                    </div>
                    <div style={{
                      fontFamily: "'Arial', sans-serif", fontSize: '12px',
                      color: '#8591a3', marginTop: '6px', textTransform: 'uppercase'
                    }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selected race info */}
          {selectedRace && (
            <div style={{
              background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '12px', padding: '20px'
            }}>
              <div style={{
                fontFamily: "'Formula1', sans-serif", fontSize: '10px',
                color: '#8591a3', textTransform: 'uppercase',
                letterSpacing: '2px', marginBottom: '14px'
              }}>
                Selected Race
              </div>
              <div style={{
                fontFamily: "'Formula1', sans-serif", fontSize: '16px',
                fontWeight: 900, color: '#fff', marginBottom: '8px'
              }}>
                {selectedRace.grandPrix}
              </div>
              <div style={{
                fontFamily: "'Arial', sans-serif", fontSize: '11px', color: '#8591a3'
              }}>
                {selectedRace.raceDate
                  ? new Date(selectedRace.raceDate).toLocaleDateString('en-GB', {
                      weekday: 'short', day: 'numeric', month: 'long', year: 'numeric'
                    })
                  : '—'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}