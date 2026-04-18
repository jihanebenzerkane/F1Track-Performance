import { useState, useEffect } from 'react'
import { getTeamColor, getFlag } from '../api/images'
import { getCircuits, getCircuitHistory } from '../api/f1api'

function formatName(id) {
  if (!id) return '—'
  return id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export default function CircuitPage() {
  const [circuits, setCircuits] = useState([])
  const [circuitId, setCircuitId] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [listLoading, setListLoading] = useState(true)

  useEffect(() => {
    setListLoading(true)
    getCircuits()
      .then(res => {
        setCircuits(res)
        if (res.length > 0) setCircuitId(res[0].id)
        setListLoading(false)
      })
      .catch(() => setListLoading(false))
  }, [])

  const loadHistory = () => {
    if (!circuitId) return
    setLoading(true)
    getCircuitHistory(circuitId)
      .then(res => { setData(res); setLoading(false) })
      .catch(() => setLoading(false))
  }

  const selected = circuits.find(c => c.id === circuitId)

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: "'Formula1', sans-serif", fontSize: '28px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '6px' }}>
          Circuit <span style={{ color: '#E4002B' }}>History</span>
        </h1>
        <p style={{ color: '#8591a3', fontSize: '14px' }}>Historical winners and records for every Grand Prix circuit</p>
      </div>

      {/* Circuit Selector */}
      <div style={{ background: '#0a0a0a', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ fontFamily: "'Formula1', sans-serif", fontSize: '11px', letterSpacing: '2px', color: '#8591a3', textTransform: 'uppercase', marginBottom: '16px' }}>
          Select Circuit
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
          {circuits.map(c => (
            <button
              key={c.id}
              onClick={() => setCircuitId(c.id)}
              style={{
                padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
                fontFamily: "'Formula1', sans-serif", fontSize: '12px', fontWeight: 700,
                border: `1px solid ${circuitId === c.id ? 'rgba(228,0,43,0.6)' : 'rgba(255,255,255,0.07)'}`,
                background: circuitId === c.id ? 'rgba(228,0,43,0.12)' : '#141414',
                color: circuitId === c.id ? '#fff' : '#8591a3',
                transition: 'all 0.2s',
              }}
            >
              {getFlag(c.countryId)} {c.name}
            </button>
          ))}
        </div>
        <button
          onClick={loadHistory}
          disabled={loading || !circuitId}
          style={{
            padding: '12px 28px', background: '#E4002B', border: 'none', borderRadius: '8px',
            color: '#fff', fontWeight: 700, fontSize: '14px',
            fontFamily: "'Formula1', sans-serif", cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(228,0,43,0.3)',
            opacity: (loading || !circuitId) ? 0.7 : 1,
            textTransform: 'uppercase'
          }}
        >
          {loading ? 'Loading...' : `Load ${selected?.name || ''} History`}
        </button>
      </div>

      {/* Results */}
      {data && (
        <>
          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: '#0a0a0a', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: 900, color: '#E4002B', fontFamily: "'JetBrains Mono', monospace" }}>{data.totalRaces}</div>
              <div style={{ fontFamily: "'Formula1', sans-serif", fontSize: '10px', color: '#8591a3', letterSpacing: '2px', textTransform: 'uppercase' }}>Total Races</div>
            </div>
            <div style={{ background: '#0a0a0a', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Formula1', sans-serif", fontSize: '15px', fontWeight: 900, color: '#E4002B', textTransform: 'uppercase' }}>
                {Object.keys(data.winsByDriver || {})[0] ? formatName(Object.keys(data.winsByDriver)[0]) : '—'}
              </div>
              <div style={{ fontFamily: "'Formula1', sans-serif", fontSize: '10px', color: '#8591a3', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '4px' }}>Record Holder</div>
            </div>
            <div style={{ background: '#0a0a0a', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: 900, color: '#E4002B', fontFamily: "'JetBrains Mono', monospace" }}>
                {data.winsByDriver ? Object.values(data.winsByDriver)[0] : 0}
              </div>
              <div style={{ fontFamily: "'Formula1', sans-serif", fontSize: '10px', color: '#8591a3', letterSpacing: '2px', textTransform: 'uppercase' }}>Record Wins</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Top winners */}
            <div style={{ background: '#0a0a0a', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
              <div style={{ fontFamily: "'Formula1', sans-serif", padding: '18px 20px', borderBottom: '1px solid var(--border)', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase' }}>Most Wins at {selected?.name}</div>
              {Object.entries(data.winsByDriver || {}).slice(0, 10).map(([driver, wins], i) => (
                <div key={driver} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 20px', borderBottom: '1px solid var(--border)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#141414'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#8591a3', width: '20px' }}>#{i + 1}</span>
                    <span style={{ fontSize: '14px', fontWeight: 700 }}>{formatName(driver)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: i === 0 ? '#E4002B' : '#f4f5f8', fontSize: '18px' }}>{wins}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent history */}
            <div style={{ background: '#0a0a0a', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
              <div style={{ fontFamily: "'Formula1', sans-serif", padding: '18px 20px', borderBottom: '1px solid var(--border)', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase' }}>Recent Winners</div>
              {data.history?.slice(0, 12).map((race, i) => {
                const constructorColor = getTeamColor(race.constructor)
                return (
                  <div key={i} style={{
                    display: 'grid', gridTemplateColumns: '50px 1fr auto',
                    padding: '11px 20px', borderBottom: '1px solid var(--border)', alignItems: 'center',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#141414'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: '#E4002B' }}>{race.year}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14px' }}>{formatName(race.winner)}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: constructorColor }} />
                        <span style={{ fontSize: '11px', color: '#8591a3', textTransform: 'uppercase', fontFamily: "'Formula1', sans-serif" }}>{formatName(race.constructor)}</span>
                      </div>
                    </div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#8591a3', textAlign: 'right' }}>
                      P{race.gridPosition}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}