import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStandings, getLeaderInfo, getConstructorStandings } from '../api/f1api'
import { getFlag, getTeamColor } from '../api/images'
import DriverImage from '../components/DriverImage'

// ── small reusable components ────────────────────────────────────────

function PageTitle({ children }) {
  return (
    <h1 style={{
      fontFamily: "'Titillium Web', sans-serif",
      fontSize: '36px', fontWeight: 900,
      letterSpacing: '-.04em', marginBottom: '24px',
      color: '#f0f0f8',
    }}>{children}</h1>
  )
}

function Tab({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: active ? 'rgba(232,0,45,0.12)' : 'none',
      border: active ? '1px solid rgba(232,0,45,0.4)' : '1px solid rgba(255,255,255,0.07)',
      color: active ? '#e8002d' : '#6b6b90',
      fontFamily: "'Titillium Web', sans-serif",
      fontSize: '13px', fontWeight: 700,
      padding: '8px 20px', borderRadius: '8px',
      cursor: 'pointer', transition: 'all .15s',
      letterSpacing: '.02em',
    }}>{label}</button>
  )
}

function StatCard({ label, value, sub }) {
  return (
    <div style={{
      background: '#0f0f1a',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '12px', padding: '18px 20px',
    }}>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '10px', letterSpacing: '.1em',
        textTransform: 'uppercase', color: '#6b6b90',
        marginBottom: '6px',
      }}>{label}</div>
      <div style={{
        fontSize: '32px', fontWeight: 900,
        letterSpacing: '-.04em', color: '#f0f0f8',
        fontFamily: "'Titillium Web', sans-serif",
      }}>{value}</div>
      {sub && <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '11px', color: '#6b6b90', marginTop: '4px',
      }}>{sub}</div>}
    </div>
  )
}

// ── main page ────────────────────────────────────────────────────────

export default function StandingsPage() {
  const navigate = useNavigate()
  const [season, setSeason] = useState(2023)
  const [mode, setMode] = useState('real')
  const [tab, setTab] = useState('drivers')
  const [standings, setStandings] = useState([])
  const [constructorStandings, setConstructorStandings] = useState([])
  const [leader, setLeader] = useState(null)
  const [loading, setLoading] = useState(true)

  // generate years from 1950 to 2026
  const years = []
  for (let y = 2026; y >= 1950; y--) years.push(y)

  useEffect(() => {
    // Force prediction mode for 2026+
    if (season >= 2026) setMode('prediction')
    else if (mode === 'prediction' && season <= 2025) setMode('real')
  }, [season])

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getStandings(season, mode),
      getConstructorStandings(season, mode),
      getLeaderInfo(season)
    ])
      .then(([driverData, constructorData, leaderData]) => {
        setStandings(driverData)
        setConstructorStandings(constructorData)
        setLeader(leaderData)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [season, mode])

  return (
    <div>
      {/* ── Header row ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-end',
        justifyContent: 'space-between', marginBottom: '24px',
        flexWrap: 'wrap', gap: '16px',
      }}>
        <div>
          <PageTitle>
            <span style={{ color: '#e8002d' }}>{season}</span> {mode === 'prediction' ? 'Projected' : 'Historical'} Standings
          </PageTitle>
          {season >= 2026 && (
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px', color: '#ffb020',
              marginTop: '-12px', marginBottom: '10px'
            }}>✨ AI Simulation Mode Active</div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {/* Mode toggle */}
          {season <= 2025 && (
            <div style={{
              display: 'flex', background: '#16162a',
              borderRadius: '8px', padding: '4px',
              border: '1px solid rgba(255,255,255,0.07)'
            }}>
              <button 
                onClick={() => setMode('real')}
                style={{
                  background: mode === 'real' ? '#e8002d' : 'none',
                  border: 'none', color: '#fff', fontSize: '11px',
                  fontFamily: "'JetBrains Mono', monospace",
                  padding: '6px 12px', borderRadius: '5px', cursor: 'pointer'
                }}>REAL</button>
              <button 
                onClick={() => setMode('prediction')}
                style={{
                  background: mode === 'prediction' ? '#e8002d' : 'none',
                  border: 'none', color: '#fff', fontSize: '11px',
                  fontFamily: "'JetBrains Mono', monospace",
                  padding: '6px 12px', borderRadius: '5px', cursor: 'pointer'
                }}>PREDICT</button>
            </div>
          )}

          {/* Season selector */}
          <select
            value={season}
            onChange={e => setSeason(parseInt(e.target.value))}
            style={{
              background: '#16162a',
              border: '1px solid rgba(255,255,255,0.07)',
              color: '#f0f0f8',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '13px', padding: '8px 16px',
              borderRadius: '8px', cursor: 'pointer',
              outline: 'none',
            }}
          >
            {years.map(y => (
              <option key={y} value={y}>{y} Season</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Stat cards ── */}
      {!loading && leader && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px', marginBottom: '24px',
        }}>
          <StatCard
            label="Season Leader"
            value={leader.worldChampion?.split(' ').pop()}
            sub="World Champion"
          />
          <StatCard
            label="Total Races"
            value={leader.totalRaces}
            sub="Grand Prix events"
          />
          <StatCard
            label="Most Wins"
            value={leader.mostWinsDriver?.split(' ').pop() || '—'}
            sub="Win Leader"
          />
          <StatCard
            label="Standing"
            value={standings.length}
            sub="Classified drivers"
          />
        </div>
      )}

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <Tab label="Driver Standings" active={tab === 'drivers'} onClick={() => setTab('drivers')} />
        <Tab label="Constructor Standings" active={tab === 'constructors'} onClick={() => setTab('constructors')} />
        <Tab label="Insights" active={tab === 'awards'} onClick={() => setTab('awards')} />
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '60px', color: '#6b6b90',
          fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', gap: '12px',
        }}>
          <div style={{
            width: '18px', height: '18px',
            border: '2px solid rgba(255,255,255,0.1)',
            borderTopColor: '#e8002d', borderRadius: '50%',
            animation: 'spin .7s linear infinite',
          }} />
          Fetching {season} {mode} data...
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      )}

      {/* ── Driver Standings Tab ── */}
      {!loading && tab === 'drivers' && (
        <div style={{
          background: '#0f0f1a',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '12px', overflow: 'hidden',
        }}>
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '48px 56px 1fr 140px 80px 80px',
            padding: '10px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '10px', letterSpacing: '.1em',
            textTransform: 'uppercase', color: '#6b6b90',
          }}>
            <div>Pos</div>
            <div></div>
            <div>Driver</div>
            <div>Team</div>
            <div style={{ textAlign: 'right' }}>Pts</div>
            <div style={{ textAlign: 'right' }}>Wins</div>
          </div>

          {/* Table rows */}
          {standings.map((driver, i) => {
            const teamColor = getTeamColor(driver.team)
            return (
              <div
                key={driver.id}
                onClick={() => navigate(`/drivers/${driver.id}?season=${season}`)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '48px 56px 1fr 140px 80px 80px',
                  padding: '12px 20px',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  alignItems: 'center', cursor: 'pointer',
                  transition: 'background .15s',
                  borderLeft: `3px solid ${i < 3 ? teamColor : 'transparent'}`,
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#16162a'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '14px', fontWeight: 500,
                  color: i < 3 ? '#ffb020' : '#6b6b90',
                }}>
                  {i === 0 ? '🏆' : `#${i + 1}`}
                </div>

                <DriverImage driverId={driver.id} size={40} />

                <div>
                  <div style={{
                    fontFamily: "'Titillium Web', sans-serif",
                    fontSize: '15px', fontWeight: 700,
                    color: '#f0f0f8',
                  }}>
                    {getFlag(driver.nationality)} {driver.name}
                  </div>
                  <div style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '10px', color: '#6b6b90',
                  }}>#{driver.carNumber || '—'}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: teamColor, flexShrink: 0,
                  }} />
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '11px', color: '#9090b0',
                  }}>{driver.team}</span>
                </div>

                <div style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '16px', fontWeight: 700,
                  color: '#f0f0f8', textAlign: 'right',
                }}>
                  {driver.points}
                </div>

                <div style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '12px', color: '#6b6b90', textAlign: 'right',
                }}>
                  {driver.wins}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Constructor Standings Tab ── */}
      {!loading && tab === 'constructors' && (
        <div style={{
          background: '#0f0f1a',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '12px', overflow: 'hidden',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '48px 1fr 1fr 100px',
            padding: '10px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '10px', letterSpacing: '.1em',
            textTransform: 'uppercase', color: '#6b6b90',
          }}>
            <div>Pos</div><div>Team</div><div>Drivers</div>
            <div style={{ textAlign: 'right' }}>Points</div>
          </div>
          {constructorStandings.map((c, i) => {
            const color = getTeamColor(c.name)
            const maxPts = constructorStandings[0].points || 1
            return (
              <div key={c.id} style={{
                display: 'grid',
                gridTemplateColumns: '48px 1fr 1fr 100px',
                padding: '14px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                alignItems: 'center',
                borderLeft: `3px solid ${i < 3 ? color : 'transparent'}`,
              }}>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '14px', fontWeight: 500,
                  color: i < 3 ? '#ffb020' : '#6b6b90',
                }}>#{i + 1}</div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '12px', height: '12px',
                      borderRadius: '3px', background: color,
                    }} />
                    <span style={{
                      fontFamily: "'Titillium Web', sans-serif",
                      fontSize: '15px', fontWeight: 700, color: '#f0f0f8',
                    }}>{c.name}</span>
                  </div>
                  <div style={{
                    height: '3px', background: 'rgba(255,255,255,0.07)',
                    borderRadius: '2px', marginTop: '8px', width: '80%',
                  }}>
                    <div style={{
                      height: '100%', borderRadius: '2px',
                      background: color,
                      width: `${(c.points / maxPts) * 100}%`,
                      transition: 'width .6s ease',
                    }} />
                  </div>
                </div>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '11px', color: '#6b6b90',
                }}>
                  {c.drivers?.join(' · ') || 'No data'}
                </div>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '18px', fontWeight: 700,
                  color: '#f0f0f8', textAlign: 'right',
                }}>{c.points}</div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Insights/Awards Tab ── */}
      {!loading && tab === 'awards' && leader && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {[
            { label: 'World Champion', value: leader.worldChampion, icon: '🏆', desc: 'Driver of the Season' },
            { label: 'Total Races', value: leader.totalRaces, icon: '🏁', desc: 'Events held' },
            { label: 'Most Wins', value: leader.mostWinsDriver, icon: '🥇', desc: 'DHL Fastest Win Award' },
            { label: 'Most Podiums', value: leader.mostPodiumsDriver || leader.worldChampion, icon: '🥂', desc: 'Podium Excellence Award' },
          ].map(award => (
            <div key={award.label} style={{
              background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '12px', padding: '24px', position: 'relative'
            }}>
              <div style={{ opacity: 0.1, fontSize: '40px', position: 'absolute', right: '20px', top: '15px' }}>{award.icon}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#e8002d', marginBottom: '8px' }}>{award.desc}</div>
              <div style={{ fontFamily: "'Titillium Web', sans-serif", fontSize: '14px', color: '#6b6b90' }}>{award.label}</div>
              <div style={{ fontFamily: "'Titillium Web', sans-serif", fontSize: '24px', fontWeight: 900, color: '#f0f0f8', marginTop: '4px' }}>
                {award.value || 'N/A'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}