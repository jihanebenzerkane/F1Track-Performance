import { useState, useEffect } from 'react'
import { getTeamColor, getFlag } from '../api/images'
import { getCircuits, safeGetStandings, getDbPitStrategy } from '../api/f1api'

/**
 * PitStrategyPage: Historical pit stop analysis.
 */
const API_BASE = 'http://localhost:8085'


function normalizePitDrivers(rows) {
  if (!Array.isArray(rows)) return []
  return rows.map(d => ({
    id: d.id,
    name: d.name,
    team: d.team,
    carNumber: d.carNumber ?? d.number,
  }))
}

const SEASONS = [];
for (let y = 2026; y >= 1950; y--) SEASONS.push(y);

function formatName(id) {
  if (!id) return '—'
  return id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export default function PitStrategyPage() {
  const [season, setSeason] = useState(2025)
  const [circuits, setCircuits] = useState([])
  const [circuitId, setCircuitId] = useState('')
  const [drivers, setDrivers] = useState([])
  const [driverId, setDriverId] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [listLoading, setListLoading] = useState(true)
  const [driverRosterNote, setDriverRosterNote] = useState(null)

  useEffect(() => {
    setListLoading(true)
    const url = season >= 2000
      ? `${API_BASE}/api/races/season/${season}`
      : `${API_BASE}/api/races/circuits`;

    fetch(url)
      .then(res => res.ok ? res.json() : [])
      .then(res => {
        // Map race list to circuit list if coming from /races/season
        const mappedCircuits = Array.isArray(res)
          ? res
            .filter(r => r.circuitSlug)
            .map(r => ({
              id: r.circuitSlug,           // string slug: "bahrain", "monaco", etc.
              name: r.circuit,             // display name from DB
              countryId: r.circuitSlug,    // used for flag lookup
            }))
          : [];

        // Remove duplicates by slug
        const unique = Array.from(new Map(mappedCircuits.map(c => [c.id, c])).values());

        if (unique.length > 0) {
          setCircuits(unique)
          if (!unique.find(c => c.id === circuitId)) {
            setCircuitId(unique[0].id)
          }
        } else {
          // Fallback to all circuits if season list is empty
          getCircuits().then(all => {
            setCircuits(all)
            if (all.length > 0 && !all.find(c => c.id === circuitId)) {
              setCircuitId(all[0].id)
            }
          })
        }
        setListLoading(false)
        setListLoading(false)
      })
      .catch(() => setListLoading(false))
  }, [season])

  useEffect(() => {
    let cancelled = false
    setDriverId('')

    async function loadDrivers() {
      setDriverRosterNote(null)
      let list = await safeGetStandings(season)
      if (cancelled) return
      if (list.length > 0) {
        setDrivers(list)
        return
      }
      try {
        const yRes = await fetch(`${API_BASE}/api/races/latest-season-year`)
        const yJson = yRes.ok ? await yRes.json() : null
        const fallbackYear = yJson && typeof yJson.year === 'number' ? yJson.year : null
        if (fallbackYear != null && fallbackYear !== season) {
          const dRes = await fetch(`${API_BASE}/api/drivers/season/${fallbackYear}`)
          if (dRes.ok) {
            const raw = await dRes.json()
            const mapped = normalizePitDrivers(raw)
            if (!cancelled && mapped.length > 0) {
              setDrivers(mapped)
              setDriverRosterNote(`No ${season} championship data in the local database — showing the ${fallbackYear} driver list (IDs match the database).`)
              return
            }
          }
        }
      } catch {
        /* ignore */
      }
      if (!cancelled) {
        setDrivers([])
        setDriverRosterNote(`No driver standings for ${season} in the database. Pick a year your f1db.db includes, or update the dataset.`)
      }
    }

    loadDrivers()
    return () => { cancelled = true }
  }, [season])

  const loadStrategy = () => {
    if (!driverId || !circuitId) return
    setLoading(true)
    setData(null)
    getDbPitStrategy(circuitId, driverId)
      .then(res => {
        setData(res)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  const selected = circuits.find(c => c.id === circuitId)
  const selectedDriverMeta = drivers.find(d => d.id === driverId)

  return (
    <div>
      {/* Title */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 style={{
          fontFamily: 'var(--font)',
          fontSize: '32px',
          fontWeight: 900,
          textTransform: 'uppercase',
          marginBottom: '8px',
          letterSpacing: '2px',
          color: '#fff'
        }}>
          Pit <span style={{ color: '#E4002B' }}>Strategy</span>
        </h1>
        <p style={{
          color: '#4b5563',
          fontSize: '14px',
          fontFamily: 'var(--mono)',
          letterSpacing: '1px'
        }}>Race-by-race pit counts and finishes at this circuit from the project database (via backend).</p>
      </div>

      {/* Controls */}
      <div style={{
        background: '#0a0a0a',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>

          {/* Season */}
          <div>
            <label style={{
              display: 'block', fontSize: '10px', color: '#4b5563',
              letterSpacing: '2px', textTransform: 'uppercase',
              marginBottom: '8px', fontFamily: 'var(--font)'
            }}>Season</label>
            <select
              value={season}
              onChange={e => setSeason(parseInt(e.target.value))}
              style={{
                background: '#141414', border: '1px solid rgba(255,255,255,0.07)',
                color: '#f4f5f8', padding: '10px 14px', borderRadius: '8px',
                fontFamily: 'var(--font)', fontSize: '13px', cursor: 'pointer', outline: 'none'
              }}
            >
              {SEASONS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          {/* Driver */}
          <div>
            <label style={{
              display: 'block', fontSize: '10px', color: '#4b5563',
              letterSpacing: '2px', textTransform: 'uppercase',
              marginBottom: '8px', fontFamily: 'var(--font)'
            }}>Driver</label>
            {driverRosterNote ? (
              <p style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'var(--mono)', marginBottom: '8px', maxWidth: '520px', lineHeight: 1.45 }}>
                {driverRosterNote}
              </p>
            ) : null}
            <select
              value={driverId}
              onChange={e => setDriverId(e.target.value)}
              style={{
                background: '#141414', border: '1px solid rgba(255,255,255,0.07)',
                color: '#f4f5f8', padding: '10px 14px', borderRadius: '8px',
                fontFamily: 'var(--font)', fontSize: '13px', cursor: 'pointer',
                minWidth: '200px', outline: 'none'
              }}
            >
              <option value="">Select Driver</option>
              {drivers.map(d => (
                <option key={d.id} value={d.id}>
                  #{d.carNumber || d.number || '—'} {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Circuit */}
          <div>
            <label style={{
              display: 'block', fontSize: '10px', color: '#4b5563',
              letterSpacing: '2px', textTransform: 'uppercase',
              marginBottom: '8px', fontFamily: 'var(--font)'
            }}>Circuit</label>
            <select
              value={circuitId}
              onChange={e => setCircuitId(e.target.value)}
              style={{
                background: '#141414', border: '1px solid rgba(255,255,255,0.07)',
                color: '#f4f5f8', padding: '10px 14px', borderRadius: '8px',
                fontFamily: 'var(--font)', fontSize: '13px', cursor: 'pointer',
                minWidth: '200px', outline: 'none'
              }}
            >
              {listLoading
                ? <option>Loading circuits...</option>
                : circuits.map(c => (
                  <option key={c.id} value={c.id}>
                    {getFlag(c.countryId)} {c.name}
                  </option>
                ))
              }
            </select>
          </div>

          <button
            onClick={loadStrategy}
            disabled={!driverId || !circuitId || loading}
            style={{
              padding: '11px 24px',
              background: '#E4002B',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontWeight: 900,
              fontSize: '12px',
              fontFamily: 'var(--font)',
              cursor: !driverId || !circuitId ? 'not-allowed' : 'pointer',
              opacity: !driverId || !circuitId ? 0.4 : 1,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              transition: 'opacity 0.2s'
            }}
          >
            {loading ? 'Processing...' : 'Analyse Strategy'}
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '60px', color: '#4b5563',
          fontFamily: 'var(--mono)', fontSize: '13px', gap: '12px'
        }}>
          <div style={{
            width: '18px', height: '18px',
            border: '2px solid rgba(255,255,255,0.1)',
            borderTopColor: '#E4002B', borderRadius: '50%',
            animation: 'spin .7s linear infinite'
          }} />
          Analysing historical pit data...
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      )}

      {/* Results */}
      {!loading && data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <style>{`
            @keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }
          `}</style>

          {/* Overview */}
          <div style={{
            background: '#0a0a0a',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '16px',
            padding: '24px 28px',
          }}>
            <div style={{
              fontFamily: 'var(--font)', fontSize: '15px', fontWeight: 900,
              textTransform: 'uppercase', color: '#fff', letterSpacing: '1px',
            }}>
              Strategy for {selectedDriverMeta?.name || formatName(data.driver)}
            </div>
            <div style={{
              marginTop: '8px', fontSize: '12px', color: '#E4002B',
              fontFamily: 'var(--mono)', letterSpacing: '1px',
            }}>
              {getFlag(selected?.countryId)} {selected?.name}
              {data.stats?.yearFrom && data.stats?.yearTo ? (
                <span style={{ color: '#6b7280', marginLeft: '12px' }}>
                  · Seasons {data.stats.yearFrom}–{data.stats.yearTo}
                </span>
              ) : null}
            </div>
            {selectedDriverMeta?.team ? (
              <div style={{ marginTop: '6px', fontSize: '11px', color: '#6b7280', fontFamily: 'var(--mono)' }}>
                Team: <span style={{ color: '#9ca3af' }}>{selectedDriverMeta.team}</span>
                {(selectedDriverMeta.carNumber != null || selectedDriverMeta.number) ? ` · #${selectedDriverMeta.carNumber || selectedDriverMeta.number}` : ''}
              </div>
            ) : null}

            {data.stats && data.stats.racesListed > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '14px',
                marginTop: '22px',
              }}>
                {[
                  ['Races at circuit', data.stats.racesListed],
                  ['With pit data', data.stats.racesWithPitData ?? '—'],
                  ['Avg pit stops', data.stats.avgPitStops != null ? data.stats.avgPitStops : '—'],
                  ['Min / max stops', data.stats.minPitStops != null ? `${data.stats.minPitStops} / ${data.stats.maxPitStops}` : '—'],
                  ['Median stops', data.stats.medianPitStops != null ? data.stats.medianPitStops : '—'],
                  ['Avg finish', data.stats.avgFinish != null ? `P${data.stats.avgFinish}` : '—'],
                  ['Best / worst', data.stats.bestFinish != null ? `P${data.stats.bestFinish} / P${data.stats.worstFinish}` : '—'],
                  ['Podiums', data.stats.podiums != null ? data.stats.podiums : '—'],
                  ['Wins', data.stats.wins != null ? data.stats.wins : '—'],
                ].map(([label, val]) => (
                  <div key={label} style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <div style={{ fontSize: '9px', color: '#6b7280', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: '#E4002B', fontFamily: 'var(--font)', marginTop: '6px' }}>{val}</div>
                  </div>
                ))}
              </div>
            ) : null}

            {Array.isArray(data.stats?.pitStopDistribution) && data.stats.pitStopDistribution.length > 0 ? (
              <div style={{ marginTop: '24px' }}>
                <div style={{ fontSize: '10px', color: '#6b7280', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>
                  Pit-stop count distribution
                </div>
                {data.stats.pitStopDistribution.map((row, i) => {
                  const maxRaces = Math.max(...data.stats.pitStopDistribution.map(r => r.races), 1)
                  const pct = Math.round((row.races / maxRaces) * 100)
                  return (
                    <div key={row.stops} style={{ marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--mono)', color: '#9ca3af', marginBottom: '4px' }}>
                        <span>{row.stops} stop{row.stops === 1 ? '' : 's'}</span>
                        <span>{row.races} race{row.races === 1 ? '' : 's'}</span>
                      </div>
                      <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                        <div style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: i % 2 === 0 ? '#E4002B' : '#c40024',
                          borderRadius: '3px',
                          transition: 'width 0.4s ease',
                        }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : null}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

            {/* Strategy recommendations */}
            <div style={{
              background: '#0a0a0a',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <div style={{
                fontFamily: 'var(--font)', fontSize: '13px', fontWeight: 900,
                marginBottom: '20px', textTransform: 'uppercase', color: '#fff', letterSpacing: '2px',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                <span style={{ color: '#E4002B' }}>📊</span> Strategic Insights
              </div>

              {Array.isArray(data.strategy) && data.strategy.length > 0 ? (
                data.strategy.map((rec, i) => (
                  <div key={i} style={{
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '12px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    opacity: 0,
                    transform: 'translateY(10px)',
                    animation: 'fadeUp 0.4s ease forwards',
                    animationDelay: `${i * 0.1}s`
                  }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px',
                    }}>
                      <span style={{
                        fontFamily: 'var(--font)', fontWeight: 700,
                        fontSize: '14px', textTransform: 'uppercase',
                        color: i === 0 ? '#E4002B' : '#fff'
                      }}>
                        {i === 0 ? '🏆 Recommended' : `Option #${rec.stopNumber}`}
                      </span>
                      <span style={{
                        fontSize: '10px', color: '#4b5563',
                        fontFamily: 'var(--mono)', letterSpacing: '1px'
                      }}>
                        Based on {rec.basedOnRaces} races
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                      {rec.recommendedLap > 0 ? (
                        <div style={{
                          fontSize: '40px', fontWeight: 900,
                          color: '#E4002B', fontFamily: 'var(--mono)', lineHeight: 1
                        }}>
                          L{rec.recommendedLap}
                        </div>
                      ) : null}
                      <div style={{
                        fontSize: '12px', color: '#9ca3af',
                        lineHeight: 1.5, maxWidth: '420px',
                        fontFamily: 'var(--mono)',
                      }}>
                        {rec.summary ? rec.summary : 'Optimal stint window from OpenF1-style stint history (when available).'}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{
                  background: '#141414', borderRadius: '10px',
                  padding: '24px', textAlign: 'center',
                  color: '#4b5563', fontFamily: 'var(--mono)', fontSize: '12px'
                }}>
                  {typeof data.strategy === 'string' ? data.strategy : 'No strategy data available.'}
                </div>
              )}
            </div>

            {/* Historical races */}
            <div style={{
              background: '#0a0a0a',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '16px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '520px',
            }}>
              <div style={{
                fontFamily: 'var(--font)', padding: '18px 24px',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                fontSize: '13px', fontWeight: 900,
                textTransform: 'uppercase', color: '#fff'
              }}>
                Race history (pit stops & result)
              </div>

              {!data.historicalStops || data.historicalStops.length === 0 ? (
                <div style={{
                  padding: '40px', textAlign: 'center',
                  color: '#4b5563', fontFamily: 'var(--mono)', fontSize: '12px'
                }}>
                  No historical data available for this combination.
                </div>
              ) : (
                <div style={{ overflow: 'auto', flex: 1 }}>
                  <div style={{
                    display: 'grid', gridTemplateColumns: '72px 1fr 88px 100px',
                    padding: '10px 24px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    fontFamily: 'var(--mono)', fontSize: '10px',
                    color: '#4b5563', textTransform: 'uppercase', letterSpacing: '1px',
                    position: 'sticky', top: 0, background: '#0a0a0a', zIndex: 1,
                  }}>
                    <div>Year</div>
                    <div>Pit stops</div>
                    <div>Stint lap</div>
                    <div style={{ textAlign: 'right' }}>Finish</div>
                  </div>

                  {data.historicalStops.map((stop, i) => (
                    <div
                      key={`${stop.year}-${i}`}
                      style={{
                        display: 'grid', gridTemplateColumns: '72px 1fr 88px 100px',
                        padding: '12px 24px',
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        alignItems: 'center',
                        fontFamily: 'var(--mono)', fontSize: '12px',
                        opacity: 0,
                        transform: 'translateY(6px)',
                        animation: 'fadeUp 0.35s ease forwards',
                        animationDelay: `${Math.min(i, 40) * 0.02}s`,
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                    >
                      <div style={{ color: '#E4002B', fontWeight: 700 }}>{stop.year}</div>
                      <div style={{ color: '#fff', fontWeight: 600 }}>
                        {stop.racePitStops != null ? `${stop.racePitStops} stop${stop.racePitStops === 1 ? '' : 's'}` : '—'}
                        {stop.compound ? <span style={{ color: '#6b7280', fontWeight: 400, marginLeft: '8px' }}>{stop.compound}</span> : null}
                      </div>
                      <div style={{ color: '#9ca3af' }}>
                        {stop.lap != null ? `Lap ${stop.lap}` : '—'}
                      </div>
                      <div style={{ color: '#d1d5db', textAlign: 'right', fontWeight: 700 }}>
                        {stop.finishPosition ? `P${stop.finishPosition}` : '—'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty state — after clicking but no data */}
      {!loading && !data && (
        <div style={{
          textAlign: 'center', padding: '60px',
          color: '#4b5563', fontFamily: 'var(--mono)', fontSize: '13px'
        }}>
          Select a driver and circuit, then click Analyse Strategy (uses local f1db.db via backend).
        </div>
      )}
    </div>
  )
}
