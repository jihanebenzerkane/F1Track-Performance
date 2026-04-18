import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { getTeamColor, getNatCode } from '../api/images'
import DriverImage from '../components/DriverImage'
import { safeGetStandings } from '../api/f1api'
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine
} from 'recharts'

const BASE = 'http://localhost:8081'
const SEASONS = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007, 2006, 2005, 2004, 2003, 2002, 2001, 2000, 1999, 1998, 1997, 1996, 1995, 1994, 1993, 1992, 1991, 1990, 1989, 1988, 1987, 1986, 1985, 1984, 1983, 1982, 1981, 1980, 1979, 1978, 1977, 1976, 1975, 1974, 1973, 1972, 1971, 1970, 1969, 1968, 1967, 1966, 1965, 1964, 1963, 1962, 1961, 1960, 1959, 1958, 1957, 1956, 1955, 1954, 1953, 1952, 1951, 1950]

function StatMini({ label, value, color = '#fffbfcff', delay = 0 }) {
  return (
    <div style={{
      background: '#0a0a0a', 
      backdropFilter: 'blur(24px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px', padding: '20px 16px', textAlign: 'center',
      opacity: 0,
      transform: 'translateY(10px)',
      animation: 'fadeUp 0.4s ease forwards',
      animationDelay: `${delay}s`
    }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '24px', fontWeight: 900, color }}>{value}</div>
      <div style={{ fontFamily: "'Formula1', sans-serif", fontSize: '9px', color: '#8591a3', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '6px' }}>{label}</div>
    </div>
  )
}

function FormBadge({ rating }) {
  const map = {
    EXCELLENT: { bg: 'rgba(0,212,138,0.12)', border: 'rgba(0,212,138,0.35)', color: '#00d48a' },
    GOOD:      { bg: 'rgba(228, 0, 43, 0.12)', border: 'rgba(228, 0, 43, 0.35)', color: '#E4002B' },
    AVERAGE:   { bg: 'rgba(228, 0, 43, 0.08)',  border: 'rgba(228, 0, 43, 0.3)',  color: '#E4002B' },
    POOR:      { bg: 'rgba(228,0,43,0.1)',    border: 'rgba(228,0,43,0.3)',    color: '#E4002B' },
  }
  const s = map[rating] || map.AVERAGE
  return (
    <span style={{
      padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
      fontFamily: "'Formula1', sans-serif", letterSpacing: '1px',
      background: s.bg, border: `1px solid ${s.border}`, color: s.color,
    }}>{rating || '—'}</span>
  )
}

export default function DriverPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const urlSeason = parseInt(searchParams.get('season'))
  const [season, setSeason] = useState(!isNaN(urlSeason) ? urlSeason : 2026)

  const [races, setRaces] = useState([])
  const [form, setForm] = useState(null)
  const [standings, setStandings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Format driver ID → display name
  const driverName = id
    ? id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : '—'

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(false)

    Promise.allSettled([
      fetch(`${BASE}/api/analysis/driver/${id}/${season}`).then(r => {
        if (!r.ok) throw new Error('analysis failed')
        return r.json()
      }),
      fetch(`${BASE}/api/predictions/form/${id}`).then(r => {
        if (!r.ok) throw new Error('form failed')
        return r.json()
      }),
      safeGetStandings(season),
    ])
      .then((results) => {
        const raceData = results[0].status === 'fulfilled' ? results[0].value : []
        const formData = results[1].status === 'fulfilled' ? results[1].value : null
        const standingsData = results[2].status === 'fulfilled' ? results[2].value : []

        setRaces(raceData)
        setForm(formData)
        
        const driverStanding = standingsData.find(d => d.id === id)
        setStandings(driverStanding || null)

        // Only set error if we couldn't even get the basic standings/race data
        if (results[2].status === 'rejected' && raceData.length === 0) {
          setError(true)
        }
        
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [id, season])

  // Compute aggregated stats from race data
  const wins     = races.filter(r => r.finishPosition === 1).length
  const podiums  = races.filter(r => r.finishPosition >= 1 && r.finishPosition <= 3).length
  const dnfs     = races.filter(r => r.dnfReason).length
  const totalPts = races.reduce((acc, r) => acc + (r.points || 0), 0)
  const avgFinish = races.length > 0
    ? (races.filter(r => r.finishPosition > 0).reduce((a, r) => a + r.finishPosition, 0) /
       (races.filter(r => r.finishPosition > 0).length || 1)).toFixed(1)
    : '—'
  const fastestLaps = races.filter(r => r.fastestLap).length

  const teamColor = getTeamColor(standings?.team)

  return (
    <div>
      {/* back button */}
      <button
        onClick={() => navigate(-1)}
        style={{
          background: 'none', border: '1px solid rgba(255,255,255,0.1)',
          color: '#8591a3', padding: '7px 16px', borderRadius: '8px',
          fontFamily: "'Formula1', sans-serif", fontSize: '11px', cursor: 'pointer',
          marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '6px',
          transition: 'all .15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(228, 0, 43, 0.4)'; e.currentTarget.style.color = '#E4002B' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#8591a3' }}
      >
        ← Back
      </button>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px', color: '#6b6b90', gap: '12px' }}>
          <div style={{
            width: '18px', height: '18px',
            border: '2px solid rgba(255,255,255,0.1)',
            borderTopColor: '#E4002B', borderRadius: '50%',
            animation: 'spin .7s linear infinite',
          }} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px' }}>
            Loading {driverName}…
          </span>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      )}

      {error && !loading && (
        <div style={{
          background: 'rgba(228,0,43,0.08)', border: '1px solid rgba(228,0,43,0.25)',
          borderRadius: '12px', padding: '32px', textAlign: 'center', color: '#E4002B',
          fontFamily: "'Formula1', sans-serif", fontSize: '14px',
        }}>
          Could not load driver data — make sure the backend is running on port 8081.
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Hero Banner */}
          <div style={{
            background: '#0a0a0a', 
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px', padding: '40px',
            marginBottom: '32px',
            borderLeft: `6px solid ${teamColor || '#E4002B'}`,
            display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap',
            opacity: 0, transform: 'translateY(10px)', animation: 'fadeUp 0.5s ease forwards'
          }}>
            <DriverImage driverId={id} driverNumber={standings?.carNumber || standings?.number} size={96} />

            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: "'Formula1', sans-serif", fontSize: '32px',
                fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px',
              }}>{driverName}</div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px', flexWrap: 'wrap' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: teamColor }} />
                <span style={{ fontFamily: "'Formula1', sans-serif", color: teamColor, fontSize: '13px', fontWeight: 700, textTransform: 'uppercase' }}>
                  {standings?.team || '—'}
                </span>
                <span style={{ color: '#8591a3', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}>
                  #{standings?.carNumber || '—'} · {getNatCode(standings?.nationality)}
                </span>
              </div>

              {form && (
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontFamily: "'Formula1', sans-serif", fontSize: '11px', color: '#6b6b90', textTransform: 'uppercase' }}>Form:</span>
                  <FormBadge rating={form.formRating} />
                </div>
              )}
            </div>

            {/* Season selector */}
            <select
              value={season}
              onChange={e => setSeason(parseInt(e.target.value))}
              style={{
                background: 'rgba(255, 255, 255, 0.05)', 
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#f4f5f8', padding: '12px 18px', borderRadius: '10px',
                fontFamily: "'Formula1', sans-serif", fontSize: '12px', cursor: 'pointer',
                outline: 'none'
              }}
            >
              {SEASONS.map(y => <option key={y} value={y}>{y} SEASON</option>)}
            </select>
          </div>

          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            <StatMini label="Points" value={standings?.points ?? totalPts} color="#E4002B" delay={0.1} />
            <StatMini label="Grid Position" value={standings?.position || '—'} color="#fff" delay={0.15} />
            <StatMini label="Grand Prix Wins" value={wins} color="#E4002B" delay={0.2} />
            <StatMini label="Podium Finishes" value={podiums} color="#fff" delay={0.25} />
            <StatMini label="DNF Count" value={dnfs} color="#ff4d4d" delay={0.3} />
            <StatMini label="Average Finish" value={avgFinish} color="#A3A3A3" delay={0.35} />
            <StatMini label="Fastest Laps" value={fastestLaps} color="#E4002B" delay={0.4} />
          </div>

          {/* Points Trajectory Chart */}
          {races.length > 0 && (() => {
            let running = 0;
            const chartData = races.map(r => {
              running += (r.points || 0);
              return {
                race: r.race?.replace(' Grand Prix', '').replace(' GP', '') || r.race,
                pointsThisRace: r.points || 0,
                cumulative: running,
              };
            });

            const CustomTooltip = ({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div style={{
                  background: '#0d0d14',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '12px',
                  color: '#f4f5f8',
                  minWidth: '160px',
                }}>
                  <div style={{ fontFamily: "'Formula1', sans-serif", fontSize: '11px', fontWeight: 900, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', color: '#fff' }}>{label}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '4px' }}>
                    <span style={{ color: '#8591a3' }}>This Race</span>
                    <span style={{ fontWeight: 700, color: teamColor || '#E4002B' }}>+{payload[1]?.value ?? 0} pts</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                    <span style={{ color: '#8591a3' }}>Season Total</span>
                    <span style={{ fontWeight: 700, color: '#fff' }}>{payload[0]?.value ?? 0} pts</span>
                  </div>
                </div>
              );
            };

            return (
              <div style={{
                background: '#0a0a0a',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '20px',
                padding: '24px',
                marginBottom: '24px',
                opacity: 0,
                animation: 'fadeUp 0.5s ease forwards',
                animationDelay: '0.42s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <div style={{ fontFamily: "'Formula1', sans-serif", fontSize: '13px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', color: '#fff' }}>
                      Points Trajectory
                    </div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#8591a3', marginTop: '4px' }}>
                      Cumulative points — {season} season · {races.length} races
                    </div>
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '28px', fontWeight: 900, color: teamColor || '#E4002B' }}>
                    {running} <span style={{ fontSize: '13px', color: '#8591a3', fontWeight: 400 }}>pts</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={chartData} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis
                      dataKey="race"
                      tick={{ fill: '#8591a3', fontFamily: "'JetBrains Mono', monospace", fontSize: 9 }}
                      axisLine={false}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fill: '#8591a3', fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={v => `${v}pts`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="cumulative"
                      stroke={teamColor || '#E4002B'}
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: teamColor || '#E4002B', strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: '#fff', stroke: teamColor || '#E4002B', strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="pointsThisRace"
                      stroke="rgba(255,255,255,0.25)"
                      strokeWidth={1}
                      strokeDasharray="4 4"
                      dot={false}
                      activeDot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', gap: '24px', marginTop: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '16px', height: '2px', background: teamColor || '#E4002B', borderRadius: '2px' }} />
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#8591a3' }}>Cumulative Points</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '16px', height: '2px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px', borderTop: '1px dashed rgba(255,255,255,0.3)' }} />
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#8591a3' }}>Points This Race</span>
                  </div>
                </div>
              </div>
            );
          })()}

          <div style={{ display: 'grid', gridTemplateColumns: races.length > 0 ? '1fr 280px' : '1fr', gap: '24px', alignItems: 'start' }}>
            {/* Race-by-Race Table */}
            <div style={{ 
              background: '#0a0a0a', 
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.1)', 
              borderRadius: '20px', 
              overflow: 'hidden',
              opacity: 0, transform: 'translateY(10px)', animation: 'fadeUp 0.5s ease forwards', animationDelay: '0.45s'
            }}>
              <div style={{
                padding: '20px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                fontFamily: "'Formula1', sans-serif", fontSize: '13px', fontWeight: 900,
                textTransform: 'uppercase', letterSpacing: '2px', color: '#fff'
              }}>
                {season} Performance Analysis
                <span style={{ marginLeft: '12px', fontSize: '11px', color: '#8591a3', letterSpacing: '1px' }}>({races.length} RACES)</span>
              </div>

              {races.length === 0 ? (
                <div style={{ padding: '48px', textAlign: 'center', color: '#6b6b90', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px' }}>
                  No race data found for {driverName} in {season}.
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 60px 60px 60px 60px 60px',
                    padding: '12px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    fontFamily: "'Formula1', sans-serif", fontSize: '10px',
                    color: '#8591a3', textTransform: 'uppercase', letterSpacing: '1px',
                  }}>
                    <div>Grand Prix</div>
                    <div style={{ textAlign: 'center' }}>Grid</div>
                    <div style={{ textAlign: 'center' }}>Fin</div>
                    <div style={{ textAlign: 'center' }}>+/-</div>
                    <div style={{ textAlign: 'center' }}>Pts</div>
                    <div style={{ textAlign: 'center' }}>FL</div>
                  </div>

                  {races.map((race, i) => {
                    const gained = race.positionsGained
                    const isDNF = !!race.dnfReason
                    const finishColor = race.finishPosition === 1 ? '#E4002B'
                      : race.finishPosition <= 3 ? '#E4002B'
                      : isDNF ? '#E4002B'
                      : '#f4f5f8'

                    return (
                      <div key={i} style={{
                        display: 'grid', gridTemplateColumns: '1fr 60px 60px 60px 60px 60px',
                        padding: '16px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                        alignItems: 'center', transition: 'background .15s',
                        background: 'transparent',
                        opacity: 0, transform: 'translateY(10px)', animation: 'fadeUp 0.4s ease forwards',
                        animationDelay: `${0.6 + i * 0.03}s`
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div>
                          <div style={{ fontFamily: "'Formula1', sans-serif", fontSize: '14px', fontWeight: 700 }}>{race.race}</div>
                          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#6b6b90', marginTop: '2px' }}>{race.date}</div>
                        </div>
                        <div style={{ textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: '#8591a3' }}>
                          P{race.gridPosition || '—'}
                        </div>
                        <div style={{ textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: '14px', fontWeight: 700, color: finishColor }}>
                          {isDNF ? 'DNF' : race.finishPosition > 0 ? `P${race.finishPosition}` : '—'}
                        </div>
                        <div style={{ textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px',
                          color: gained > 0 ? '#00d48a' : gained < 0 ? '#E4002B' : '#8591a3' }}>
                          {gained > 0 ? `+${gained}` : gained < 0 ? `${gained}` : '='}
                        </div>
                        <div style={{ textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', fontWeight: 700, color: '#E4002B' }}>
                          {race.points || 0}
                        </div>
                        <div style={{ textAlign: 'center', fontSize: '14px' }}>
                          {race.fastestLap ? 'FL' : ''}
                        </div>
                      </div>
                    )
                  })}
                </>
              )}
            </div>

            {/* Form Sidebar */}
            {form && (
              <div style={{ 
                background: '#0a0a0a', 
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.1)', 
                borderRadius: '20px', padding: '24px', 
                position: 'sticky', top: '100px',
                opacity: 0, transform: 'translateX(20px)', animation: 'fadeUp 0.5s ease forwards', animationDelay: '0.5s'
              }}>
                <div style={{ fontFamily: "'Formula1', sans-serif", fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px', color: '#E4002B' }}>
                  Momentum Analysis
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '32px', fontWeight: 900, color: '#E4002B' }}>
                    {form.formScore}
                  </span>
                  <FormBadge rating={form.formRating} />
                </div>

                {/* Score bar */}
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '4px', height: '4px', marginBottom: '20px' }}>
                  <div style={{
                    height: '100%', borderRadius: '4px',
                    background: form.formRating === 'EXCELLENT' ? '#00d48a' : form.formRating === 'GOOD' ? '#E4002B' : '#E4002B',
                    width: `${Math.min(100, form.formScore * 100)}%`,
                    transition: 'width .6s ease',
                  }} />
                </div>

                <div style={{ fontFamily: "'Formula1', sans-serif", fontSize: '10px', color: '#6b6b90', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                  Last 5 Races
                </div>

                {form.last5Races?.map((race, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#c0c8d8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                        {race.race}
                      </div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#6b6b90' }}>{race.year}</div>
                    </div>
                    <div style={{ display: 'flex', flex: 'column', alignItems: 'flex-end', gap: '2px' }}>
                      <span style={{
                        fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', fontWeight: 700,
                        color: race.finish === 'P1' ? '#E4002B' : race.finish === 'DNF' ? '#E4002B' : '#f4f5f8',
                      }}>{race.finish}</span>
                      {race.fastestLap && <span style={{ fontSize: '10px', color: '#E4002B', fontWeight: 700 }}>FL</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
