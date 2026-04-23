import { useState, useEffect } from 'react'
import { getTeamColor, getNatCode } from '../api/images'
import DriverImage from '../components/DriverImage'
import { safeGetStandings } from '../api/f1api'
import {
  ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell
} from 'recharts'

const BASE = ' '
const SEASONS = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009]

function formatName(id) {
  if (!id) return '—'
  return id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export default function H2HPage() {
  const [season, setSeason] = useState(2024)
  const [drivers, setDrivers] = useState([])
  const [driver1, setDriver1] = useState('')
  const [driver2, setDriver2] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    safeGetStandings(season)
      .then(res => {
        setDrivers(res);
        setDriver1('');
        setDriver2('');
        setData(null)
      })
  }, [season])

  const compare = () => {
    if (!driver1 || !driver2 || driver1 === driver2) return
    setLoading(true)
    fetch(`${BASE}/api/analysis/h2h/${driver1}/${driver2}/${season}`)
      .then(r => r.json())
      .then(res => { setData(res); setLoading(false) })
      .catch(() => setLoading(false))
  }

  const d1Info = drivers.find(d => d.id === driver1)
  const d2Info = drivers.find(d => d.id === driver2)

  return (
    <div>
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
            Head to <span style={{ color: '#E4002B' }}>Head</span>
          </h1>
          <p style={{
            color: '#8591a3',
            fontSize: '14px',
            fontFamily: "'formula1', 'syne', monospace",
            letterSpacing: '1px'
          }}>Compare performance metrics between any two drivers</p>
        </div>

        {/* Controls */}
        <div style={{
          background: '#0a0a0a',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '32px'
        }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#8591a3', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>Season</label>
              <select value={season} onChange={e => setSeason(parseInt(e.target.value))} style={{ background: '#141414', border: '1px solid var(--border)', color: '#f4f5f8', padding: '10px 14px', borderRadius: '8px', fontFamily: "'Formula1', sans-serif", fontSize: '13px', cursor: 'pointer' }}>
                {SEASONS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '10px', color: '#8591a3', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', fontFamily: "'Formula1', sans-serif" }}>Driver 1</label>
              <select value={driver1} onChange={e => setDriver1(e.target.value)} style={{ background: '#141414', border: `1px solid ${driver1 ? 'rgba(228, 0, 43, 0.4)' : 'var(--border)'}`, color: '#f4f5f8', padding: '10px 14px', borderRadius: '8px', fontFamily: "'Formula1', sans-serif", fontSize: '13px', cursor: 'pointer', minWidth: '200px' }}>
                <option value="">Select Driver 1</option>
                {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div style={{ fontFamily: "'Formula1', sans-serif", fontSize: '18px', fontWeight: 900, color: '#E4002B', paddingBottom: '4px', alignSelf: 'center' }}>VS</div>
            <div>
              <label style={{ display: 'block', fontSize: '10px', color: '#8591a3', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', fontFamily: "'Formula1', sans-serif" }}>Driver 2</label>
              <select value={driver2} onChange={e => setDriver2(e.target.value)} style={{ background: '#141414', border: `1px solid ${driver2 ? 'rgba(163, 163, 163,0.4)' : 'var(--border)'}`, color: '#f4f5f8', padding: '10px 14px', borderRadius: '8px', fontFamily: "'Formula1', sans-serif", fontSize: '13px', cursor: 'pointer', minWidth: '200px' }}>
                <option value="">Select Driver 2</option>
                {drivers.filter(d => d.id !== driver1).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <button onClick={compare} disabled={!driver1 || !driver2 || loading} style={{
              padding: '12px 28px',
              background: '#E4002B',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontWeight: 900,
              fontSize: '12px',
              fontFamily: "'Formula1', sans-serif",
              cursor: 'pointer',
              opacity: (!driver1 || !driver2) ? 0.4 : 1,
              textTransform: 'uppercase',
              boxShadow: '0 4px 20px rgba(228, 0, 43, 0.3)'
            }}>
              {loading ? 'Analysing...' : 'Compare Stats →'}
            </button>
          </div>
        </div>

        {/* Results */}
        {data && (
          <>
            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
              {/* Driver 1 Card */}
              {d1Info && (
                <div style={{
                  background: '#0a0a0a',
                  backdropFilter: 'blur(24px)',
                  borderRadius: '16px', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                  opacity: 0, transform: 'translateX(-20px)', animation: 'fadeUp 0.5s ease forwards'
                }}>
                  <DriverImage driverId={d1Info.id} size={84} />
                  <div style={{ fontFamily: "'Formula1', sans-serif", fontSize: '20px', fontWeight: 900, textAlign: 'center', textTransform: 'uppercase', color: '#fff' }}>{d1Info.name}</div>
                  <div style={{ fontFamily: "'Formula1', sans-serif", color: getTeamColor(d1Info.team), fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>{d1Info.team}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%', marginTop: '12px' }}>
                    <div style={{ textAlign: 'center', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '10px', padding: '16px' }}>
                      <div style={{ fontSize: '28px', fontWeight: 900, color: '#E4002B', fontFamily: "Syne" }}>{data.driver1Wins}</div>
                      <div style={{ fontSize: '10px', color: '#8591a3', textTransform: 'uppercase', letterSpacing: '1px' }}>H2H Wins</div>
                    </div>
                    <div style={{ textAlign: 'center', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '10px', padding: '16px' }}>
                      <div style={{ fontSize: '28px', fontWeight: 900, color: '#fff', fontFamily: "Syne" }}>{data.driver1TotalPoints}</div>
                      <div style={{ fontSize: '10px', color: '#8591a3', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Pts</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Central VS */}
              <div style={{ textAlign: 'center', opacity: 0, animation: 'fadeUp 0.5s ease forwards', animationDelay: '0.2s' }}>
                <div style={{ fontFamily: "'Formula1', sans-serif", fontSize: '48px', fontWeight: 900, color: '#E4002B', textShadow: '0 0 30px rgba(228, 0, 43, 0.3)' }}>VS</div>
                <div style={{ fontFamily: "Syne", fontSize: '11px', color: '#8591a3', marginTop: '8px', textTransform: 'uppercase', letterSpacing: '2px' }}>{data.racesCompared} RACES</div>
              </div>

              {/* Driver 2 Card */}
              {d2Info && (
                <div style={{
                  background: '#0a0a0a',
                  backdropFilter: 'blur(24px)',
                  borderRadius: '16px', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                  opacity: 0, transform: 'translateX(20px)', animation: 'fadeUp 0.5s ease forwards'
                }}>
                  <DriverImage driverId={d2Info.id} size={84} />
                  <div style={{ fontFamily: "'Formula1', sans-serif", fontSize: '20px', fontWeight: 900, textAlign: 'center', textTransform: 'uppercase', color: '#fff' }}>{d2Info.name}</div>
                  <div style={{ fontFamily: "'Formula1', sans-serif", color: getTeamColor(d2Info.team), fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>{d2Info.team}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%', marginTop: '12px' }}>
                    <div style={{ textAlign: 'center', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '10px', padding: '16px' }}>
                      <div style={{ fontSize: '28px', fontWeight: 900, color: '#E4002B', fontFamily: "Syne" }}>{data.driver2Wins}</div>
                      <div style={{ fontSize: '10px', color: '#8591a3', textTransform: 'uppercase', letterSpacing: '1px' }}>H2H Wins</div>
                    </div>
                    <div style={{ textAlign: 'center', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '10px', padding: '16px' }}>
                      <div style={{ fontSize: '28px', fontWeight: 900, color: '#fff', fontFamily: "Syne" }}>{data.driver2TotalPoints}</div>
                      <div style={{ fontSize: '10px', color: '#8591a3', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Pts</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Points Comparison Bar Chart */}
            {(() => {
              const chartData = data.races?.map(race => ({
                race: race.race?.replace(' Grand Prix', '').replace(' GP', '') || race.race,
                [driver1]: race.driver1?.points ?? 0,
                [driver2]: race.driver2?.points ?? 0,
              }));

              const d1Color = d1Info ? (getTeamColor(d1Info.team) || '#E4002B') : '#E4002B';
              const d2Color = d2Info ? (getTeamColor(d2Info.team) || '#8591a3') : '#8591a3';

              const CustomTooltip = ({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div style={{
                    background: '#0d0d14',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    fontFamily: "Syne",
                    fontSize: '12px',
                    minWidth: '180px',
                  }}>
                    <div style={{ fontFamily: "'Formula1', sans-serif", fontSize: '11px', fontWeight: 900, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: '#fff' }}>{label}</div>
                    {payload.map((p, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginBottom: '4px' }}>
                        <span style={{ color: p.fill, fontWeight: 700 }}>{formatName(p.dataKey)}</span>
                        <span style={{ color: '#fff', fontWeight: 700 }}>{p.value} pts</span>
                      </div>
                    ))}
                  </div>
                );
              };

              return (
                <div style={{
                  background: '#0a0a0a',
                  backdropFilter: 'blur(24px)',
                  borderRadius: '16px',
                  padding: '24px',
                  marginBottom: '24px',
                  opacity: 0,
                  animation: 'fadeUp 0.5s ease forwards',
                  animationDelay: '0.3s',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                      <div style={{ fontFamily: "'Formula1', sans-serif", fontSize: '13px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', color: '#fff' }}>
                        Points Scored — Race by Race
                      </div>
                      <div style={{ fontFamily: "Syne", fontSize: '11px', color: '#8591a3', marginTop: '4px' }}>
                        {data.racesCompared} races compared · {season} season
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: d1Color }} />
                        <span style={{ fontFamily: "'Formula1', sans-serif", fontSize: '10px', color: '#c0c8d8', textTransform: 'uppercase' }}>{formatName(driver1)}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: d2Color }} />
                        <span style={{ fontFamily: "'Formula1', sans-serif", fontSize: '10px', color: '#c0c8d8', textTransform: 'uppercase' }}>{formatName(driver2)}</span>
                      </div>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={chartData} barGap={2} margin={{ top: 0, right: 8, left: -8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                      <XAxis
                        dataKey="race"
                        tick={{ fill: '#8591a3', fontFamily: "Syne", fontSize: 9 }}
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                        angle={-35}
                        textAnchor="end"
                        height={48}
                      />
                      <YAxis
                        tick={{ fill: '#8591a3', fontFamily: "Syne", fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={v => `${v}pts`}
                        domain={[0, 26]}
                        ticks={[0, 6, 10, 12, 15, 18, 25]}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                      <Bar dataKey={driver1} fill={d1Color} radius={[3, 3, 0, 0]} maxBarSize={18} />
                      <Bar dataKey={driver2} fill={d2Color} radius={[3, 3, 0, 0]} maxBarSize={18} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              );
            })()}

            {/* Race-by-race breakdown */}
            <div style={{
              background: '#0a0a0a',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              overflow: 'hidden',
              marginTop: '32px'
            }}>
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 100px 100px 100px 100px 1fr',
                padding: '16px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#8591a3', fontSize: '11px', letterSpacing: '2px',
                textTransform: 'uppercase', fontFamily: "'Formula1', sans-serif", textAlign: 'center'
              }}>
                <div style={{ textAlign: 'left' }}>Grand Prix</div>
                <div style={{ textAlign: 'center' }}>P1 Grid</div>
                <div style={{ textAlign: 'center', color: '#E4002B' }}>P1 Fin</div>
                <div style={{ textAlign: 'center', color: '#fff' }}>P2 Fin</div>
                <div style={{ textAlign: 'center' }}>P2 Grid</div>
                <div style={{ textAlign: 'right' }}>H2H Winner</div>
              </div>
              {data.races?.map((race, i) => {
                const d1Won = race.betterFinish === driver1
                const d2Won = race.betterFinish === driver2
                return (
                  <div key={i} style={{
                    display: 'grid', gridTemplateColumns: '1fr 100px 100px 100px 100px 1fr', padding: '14px 24px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)', alignItems: 'center',
                    background: 'transparent',
                    transition: 'background 0.15s',
                    opacity: 0,
                    transform: 'translateY(10px)',
                    animation: 'fadeUp 0.4s ease forwards',
                    animationDelay: `${0.4 + i * 0.03}s`
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{race.race}</div>
                    <div style={{ textAlign: 'center', fontFamily: "Syne", fontSize: '13px', color: '#8591a3' }}>P{race.driver1?.grid || '—'}</div>
                    <div style={{ textAlign: 'center', fontFamily: "Syne", fontWeight: 700, fontSize: '14px', color: d1Won ? '#E4002B' : '#f4f5f8' }}>P{race.driver1?.finish || '—'}</div>
                    <div style={{ textAlign: 'center', fontFamily: "Syne", fontWeight: 700, fontSize: '14px', color: d2Won ? '#fff' : '#f4f5f8' }}>P{race.driver2?.finish || '—'}</div>
                    <div style={{ textAlign: 'center', fontFamily: "Syne", fontSize: '13px', color: '#8591a3' }}>P{race.driver2?.grid || '—'}</div>
                    <div style={{ textAlign: 'right', fontSize: '12px', fontWeight: 900, color: d1Won ? '#E4002B' : d2Won ? '#fff' : '#8591a3', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      {d1Won ? formatName(driver1) : d2Won ? formatName(driver2) : 'Tied'}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
