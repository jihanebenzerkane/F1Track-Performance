import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { safeGetStandings, getLeaderInfo, safeGetConstructorStandings, getRacesBySeason, getRaceResults } from '../api/f1api'
import { getFlag, getNatCode, getTeamColor, getConstructorImageUrl } from '../api/images'
import DriverImage from '../components/DriverImage'


function PageTitle({ children }) {
  return (
    <h1 style={{
      fontFamily: 'var(--font)',
      fontSize: '28px',
      fontWeight: 900,
      letterSpacing: '0.02em',
      marginBottom: '24px',
      color: '#f4f5f8',
      textTransform: 'uppercase'
    }}>{children}</h1>
  )
}

function Tab({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: active ? 'rgba(228,0,43,0.1)' : 'none',
      border: active ? '1px solid rgba(228,0,43,0.5)' : '1px solid rgba(255,255,255,0.07)',
      color: active ? '#E4002B' : '#4b5563',
      fontFamily: 'var(--font)',
      fontSize: '11px',
      fontWeight: 700,
      padding: '8px 20px',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all .15s',
      letterSpacing: '.1em',
      textTransform: 'uppercase'
    }}>{label}</button>
  )
}

function StatCard({ label, value, sub }) {
  return (
    <div style={{
      background: '#0a0a0a',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '12px',
      padding: '18px 20px',
    }}>
      <div style={{
        fontFamily: 'var(--mono)',
        fontSize: '10px',
        letterSpacing: '.1em',
        textTransform: 'uppercase',
        color: '#4b5563',
        marginBottom: '6px',
      }}>{label}</div>
      <div style={{
        fontSize: '32px',
        fontWeight: 900,
        letterSpacing: '-.01em',
        color: '#f4f5f8',
        fontFamily: 'var(--font)',
      }}>{value}</div>
      {sub && <div style={{
        fontFamily: 'var(--mono)',
        fontSize: '11px',
        color: '#4b5563',
        marginTop: '4px',
      }}>{sub}</div>}
    </div>
  )
}

// Main Page Component

export default function StandingsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const urlSeason = parseInt(searchParams.get('season'))
  const [season, setSeason] = useState(!isNaN(urlSeason) ? urlSeason : 2026)

  // Sync URL params with local state
  useEffect(() => {
    if (!isNaN(urlSeason) && urlSeason !== season) {
      setSeason(urlSeason)
    }
  }, [urlSeason])

  const [mode, setMode] = useState('real')
  const [tab, setTab] = useState('drivers')
  const [standings, setStandings] = useState([])
  const [constructorStandings, setConstructorStandings] = useState([])
  const [leader, setLeader] = useState(null)
  const [loading, setLoading] = useState(true)
  const [raceLoading, setRaceLoading] = useState(false)

  // Race results state
  const [activeRaceId, setActiveRaceId] = useState(null)
  const [seasonRaces, setSeasonRaces] = useState([])
  const [targetRaceResults, setTargetRaceResults] = useState([])

  const years = []
  for (let y = 2026; y >= 1950; y--) years.push(y)

  useEffect(() => {
    if (season >= 2026) setMode('prediction')
    else if (mode === 'prediction' && season <= 2025) setMode('real')
  }, [season])

  useEffect(() => {
    setLoading(true)
    Promise.all([
      safeGetStandings(season, mode),
      safeGetConstructorStandings(season, mode),
      getLeaderInfo(season),
      getRacesBySeason(season)
    ])
      .then(([driverData, constructorData, leaderData, raceData]) => {
        setStandings(driverData)
        setConstructorStandings(constructorData)
        setLeader(leaderData)
        setSeasonRaces(raceData)

        if (raceData && raceData.length > 0) {
          const finishedRaces = raceData.filter(r => new Date(r.date) < new Date());
          const latest = finishedRaces.length > 0 ? finishedRaces[finishedRaces.length - 1] : raceData[0];
          setActiveRaceId(latest.id);
        }

        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [season, mode])

  useEffect(() => {
    if (activeRaceId && tab === 'race_results') {
      setRaceLoading(true)
      getRaceResults(activeRaceId)
        .then(data => {
          setTargetRaceResults(data.results || [])
          setRaceLoading(false)
        })
        .catch(err => {
          console.error(err)
          setRaceLoading(false)
        })
    }
  }, [activeRaceId, tab])

  return (
    <div>
      {/* Header Row */}
      <div style={{
        display: 'flex', alignItems: 'flex-end',
        justifyContent: 'space-between', marginBottom: '24px',
        flexWrap: 'wrap', gap: '16px',
      }}>
        <div>
          <PageTitle>
            <span style={{ color: '#E4002B' }}>{season}</span> Standings
          </PageTitle>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>


          <select
            value={season}
            onChange={e => setSeason(parseInt(e.target.value))}
            style={{
              background: '#0a0a0a',
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

      {/* Season Stats */}
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

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <Tab label="Driver Standings" active={tab === 'drivers'} onClick={() => setTab('drivers')} />
        <Tab label="Constructor Standings" active={tab === 'constructors'} onClick={() => setTab('constructors')} />
        <Tab label="Race Results" active={tab === 'race_results'} onClick={() => setTab('race_results')} />
        <Tab label="Awards & Insights" active={tab === 'awards'} onClick={() => setTab('awards')} />
      </div>

      {loading && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '60px', color: '#6b6b90',
          fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', gap: '12px',
        }}>
          <div style={{
            width: '18px', height: '18px',
            border: '2px solid rgba(255,255,255,0.1)',
            borderTopColor: '#E4002B', borderRadius: '50%',
            animation: 'spin .7s linear infinite',
          }} />
          Fetching {season} {mode} data...
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      )}

      {/* Driver Standings Tab */}
      {!loading && tab === 'drivers' && (
        <div style={{
          background: '#0f0f1a',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '12px', overflow: 'hidden',
        }}>
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '60px 2fr 1.5fr 2fr 100px 60px',
            padding: '16px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            fontFamily: "'Formula1', sans-serif",
            fontSize: '10px', fontWeight: 700,
            textTransform: 'uppercase', color: '#888899',
            letterSpacing: '0.1em'
          }}>
            <div>Pos.</div>
            <div>Driver</div>
            <div>Nationality</div>
            <div>Team</div>
            <div style={{ textAlign: 'center' }}>W / P</div>
            <div style={{ textAlign: 'right' }}>Pts.</div>
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
                  gridTemplateColumns: '60px 2fr 1.5fr 2fr 100px 60px',
                  padding: '14px 24px',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  alignItems: 'center', cursor: 'pointer',
                  transition: 'background .15s',
                  background: '#08080f',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#101019'}
                onMouseLeave={e => e.currentTarget.style.background = '#08080f'}
              >
                <div style={{
                  fontFamily: "'Formula1', sans-serif",
                  fontSize: '14px', fontWeight: 700,
                  color: '#ffffff',
                }}>
                  {i + 1}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <DriverImage driverId={driver.id} driverNumber={driver.carNumber || driver.number} size={28} />
                  <div style={{
                    fontFamily: "'Formula1', sans-serif",
                    fontSize: '14px', fontWeight: 700,
                    color: '#f0f0f8',
                  }}>
                    {driver.name}
                  </div>
                </div>

                <div style={{
                  fontFamily: "'Formula1', sans-serif",
                  fontSize: '12px', fontWeight: 700, color: '#f0f0f8',
                }}>
                  {getNatCode(driver.nationality)}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '10px', height: '10px', borderRadius: '50%',
                    background: teamColor, flexShrink: 0,
                  }} />
                  {getConstructorImageUrl(driver.team) && (
                    <img
                      src={getConstructorImageUrl(driver.team)}
                      alt="car"
                      style={{ height: '16px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}
                    />
                  )}
                  <span style={{
                    fontFamily: "'Formula1', sans-serif",
                    fontSize: '13px', color: '#f0f0f8', fontWeight: 700,
                  }}>
                    {driver.team === 'Red Bull' ? 'Red Bull Racing' : driver.team === 'AlphaTauri' ? 'Racing Bulls' : driver.team === 'Haas' ? 'Haas F1 Team' : driver.team}
                  </span>
                </div>

                <div style={{
                  textAlign: 'center',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '12px',
                  color: '#8591a3',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <span style={{ color: driver.wins > 0 ? '#ffc400ff' : 'inherit', fontWeight: driver.wins > 0 ? 700 : 400 }}>{driver.wins}W</span>
                  <span style={{ color: driver.podiums > 0 ? '#ffc400ff' : 'inherit' }}>{driver.podiums}P</span>
                </div>

                <div style={{
                  fontFamily: "'Formula1', sans-serif",
                  fontSize: '14px', fontWeight: 900,
                  color: '#ffffff', textAlign: 'right',
                }}>
                  {driver.points}
                </div>
              </div>
            )
          })}
        </div>
      )}
      {/* Constructor Standings Tab */}
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
                    {getConstructorImageUrl(c.name) && (
                      <img
                        src={getConstructorImageUrl(c.name)}
                        alt="car"
                        style={{ height: '24px', objectFit: 'contain', margin: '0 4px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}
                      />
                    )}
                    <span style={{
                      fontFamily: "'Formula1', sans-serif",
                      fontSize: '14px', fontWeight: 700, color: '#f0f0f8',
                      textTransform: 'uppercase', letterSpacing: '0.05em'
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

      {/* Race Results Tab */}
      {!loading && tab === 'race_results' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Race selection dropdown */}
          <div style={{
            background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px'
          }}>
            <span style={{ fontFamily: "'Formula1', sans-serif", fontSize: '12px', color: '#6b6b90', textTransform: 'uppercase' }}>Select Round:</span>
            <select
              value={activeRaceId}
              onChange={e => setActiveRaceId(parseInt(e.target.value))}
              style={{
                background: '#0a0a0a', border: '1px solid rgba(255, 0, 0, 0.2)',
                color: '#fff', padding: '8px 16px', borderRadius: '8px',
                fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', flex: 1, outline: 'none'
              }}
            >
              {seasonRaces.map(r => (
                <option key={r.id} value={r.id}>Round {r.round}: {r.grandPrix}</option>
              ))}
            </select>
          </div>

          {/* Classification table */}
          {raceLoading ? (
            <div style={{ textAlign: 'center', padding: '80px', color: '#6b6b90', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px' }}>
              Loading results classification...
            </div>
          ) : targetRaceResults.length === 0 ? (
            <div className="empty-state" style={{ background: '#0f0f1a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.07)' }}>
              No results found for this race yet.
            </div>
          ) : (
            <div style={{
              background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '12px', overflow: 'hidden'
            }}>
              <div style={{
                display: 'grid', gridTemplateColumns: '60px 2fr 2fr 80px 100px 60px',
                padding: '16px 24px', background: 'rgba(255,255,255,0.02)',
                fontFamily: "'Formula1', sans-serif", fontSize: '10px', color: '#6b6b90',
                textTransform: 'uppercase', letterSpacing: '2px', borderBottom: '1px solid rgba(255,255,255,0.07)'
              }}>
                <div>Pos</div><div>Driver</div><div>Constructor</div><div>Grid</div><div>Time/Gap</div><div>Pts</div>
              </div>

              {targetRaceResults.map((r, i) => (
                <div key={r.driverId} style={{
                  display: 'grid', gridTemplateColumns: '60px 2fr 2fr 80px 100px 60px',
                  padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)',
                  alignItems: 'center', background: i < 3 ? '#0a0a0a' : 'transparent'
                }}>
                  <div style={{ fontFamily: "'Formula1', sans-serif", fontSize: '16px', fontWeight: 900, color: i === 0 ? '#ffffffff' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : '#f0f0f8' }}>
                    {r.position}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <DriverImage driverId={r.driverId} size={24} />
                    <span style={{ fontFamily: "'Formula1', sans-serif", fontSize: '14px', fontWeight: 700 }}>{r.driver}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getTeamColor(r.team) }} />
                    <span style={{ fontSize: '13px', color: '#f0f0f8' }}>{r.team}</span>
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: '#6b6b90' }}>P{r.grid}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: r.dnfReason ? '#f8f8f8ff' : '#f0f0f8' }}>
                    {r.dnfReason ? r.dnfReason : r.time || '--'}
                  </div>
                  <div style={{ fontFamily: "'Formula1', sans-serif", fontSize: '14px', fontWeight: 900, color: '#ffffffff' }}>{r.points}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Insights/Awards Tab */}
      {!loading && tab === 'awards' && leader && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {[
            { label: 'World Champion', value: leader.worldChampion, desc: 'Driver of the Season' },
            { label: 'Total Races', value: leader.totalRaces, desc: 'Events held' },
            { label: 'Most Wins', value: leader.mostWinsDriver, desc: 'DHL Fastest Win Award' },
            { label: 'Most Podiums', value: leader.mostPodiumsDriver || leader.worldChampion, desc: 'Podium Excellence Award' },
          ].map(award => (
            <div key={award.label} style={{
              background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '12px', padding: '24px', position: 'relative'
            }}>

              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#ffbb00ff', marginBottom: '8px' }}>{award.desc}</div>
              <div style={{ fontFamily: "'Formula1', sans-serif", fontSize: '13px', color: '#ff0000ff', textTransform: 'uppercase', letterSpacing: '1px' }}>{award.label}</div>
              <div style={{ fontFamily: "'Formula1', sans-serif", fontSize: '24px', fontWeight: 900, color: '#f0f0f8', marginTop: '4px' }}>
                {award.value || 'N/A'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
