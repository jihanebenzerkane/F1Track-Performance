import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getNatCode, getTeamColor } from '../api/images'
import DriverImage from '../components/DriverImage'
import { safeGetStandings } from '../api/f1api'


const BASE = ' '
const SEASONS = [];
for (let y = 2026; y >= 1950; y--) SEASONS.push(y);

function formatName(id) {
  return id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export default function DriversPage() {
  const navigate = useNavigate()
  const [season, setSeason] = useState(2026)
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [driverForm, setDriverForm] = useState(null)
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    safeGetStandings(season)
      .then(data => { setDrivers(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [season])

  const filtered = drivers.filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.team?.toLowerCase().includes(search.toLowerCase())
  )

  const selectDriver = (driver) => {
    setSelectedDriver(driver)
    setDriverForm(null)
    setFormLoading(true)
    fetch(`${BASE}/api/predictions/form/${driver.id}`)
      .then(r => r.json())
      .then(data => { setDriverForm(data); setFormLoading(false) })
      .catch(() => setFormLoading(false))
  }

  return (
    <div style={{ display: 'flex', gap: '24px' }}>
      {/* Driver List */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontFamily: "'Formula1', sans-serif",
            fontSize: '32px',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}>
            <span style={{ color: '#E4002B' }}>{season}</span> Drivers
          </h1>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              placeholder="Search driver or team..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#f4f5f8', padding: '10px 16px', borderRadius: '8px',
                fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', outline: 'none',
                width: '240px'
              }}
            />
            <select
              value={season}
              onChange={e => setSeason(parseInt(e.target.value))}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#f4f5f8', padding: '10px 14px', borderRadius: '8px',
                fontFamily: "'Formula1', sans-serif", fontSize: '12px', cursor: 'pointer',
                outline: 'none'
              }}
            >
              {SEASONS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#8591a3' }}>Loading drivers...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filtered.map((driver, i) => {
              const teamColor = getTeamColor(driver.team)
              const isSelected = selectedDriver?.id === driver.id
              return (
                <div
                  key={driver.id}
                  onClick={() => selectDriver(driver)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '50px 50px 1fr 160px 100px',
                    padding: '16px 24px',
                    background: isSelected ? 'rgba(228,0,43,0.08)' : '#0a0a0a',
                    backdropFilter: 'blur(24px)',
                    border: `1px solid ${isSelected ? 'rgba(228,0,43,0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                    borderRadius: '16px', alignItems: 'center',
                    cursor: 'pointer', transition: 'all 0.2s',
                    opacity: 0,
                    transform: 'translateY(10px)',
                    animation: 'fadeUp 0.4s ease forwards',
                    animationDelay: `${i * 0.03}s`
                  }}
                  onMouseEnter={e => !isSelected && (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
                  onMouseLeave={e => !isSelected && (e.currentTarget.style.background = '#0a0a0a')}
                >
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: '#8591a3', fontWeight: 600 }}>
                    {driver.position ? `P${driver.position}` : `#${i + 1}`}
                  </div>
                  <DriverImage driverId={driver.id} size={32} />
                  <div>
                    <div style={{ fontFamily: "'Formula1', sans-serif", fontWeight: 700, fontSize: '14px', textTransform: 'uppercase', color: '#fff' }}>{driver.name}</div>
                    <div style={{ fontSize: '11px', color: '#8591a3', fontFamily: "'JetBrains Mono', monospace" }}>
                      #{driver.carNumber || '—'} · {getNatCode(driver.nationality)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: teamColor }} />
                    <span style={{ fontFamily: "'Formula1', sans-serif", fontSize: '11px', color: '#c0c8d8', textTransform: 'uppercase' }}>{driver.team}</span>
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: '16px', textAlign: 'right', color: '#f4f5f8' }}>
                    {driver.points} <span style={{ fontSize: '10px', color: '#8591a3' }}>PTS</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Driver Detail Panel */}
      {selectedDriver && (
        <div style={{
          width: '360px', flexShrink: 0,
          background: '#0a0a0a',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px', padding: '32px', alignSelf: 'flex-start',
          position: 'sticky', top: '100px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          animation: 'fadeUp 0.5s ease forwards'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <DriverImage driverId={selectedDriver.id} size={80} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Formula1', sans-serif", fontSize: '18px', fontWeight: 900, textTransform: 'uppercase', color: '#fff' }}>{selectedDriver.name}</div>
              <div style={{ fontFamily: "'Formula1', sans-serif", color: getTeamColor(selectedDriver.team), fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>{selectedDriver.team}</div>
              <div style={{ color: '#8591a3', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', marginTop: '4px' }}>
                #{selectedDriver.carNumber || '—'} · {getNatCode(selectedDriver.nationality)}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            {[
              { label: 'Points', value: selectedDriver.points },
              { label: 'Position', value: `${selectedDriver.position || '—'}` },
              { label: 'Wins', value: selectedDriver.wins ?? '—' },
              { label: 'Podiums', value: selectedDriver.podiums ?? '—' }
            ].map((stat, i) => (
              <div key={stat.label} style={{
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                textAlign: 'center',
                animation: 'fadeUp 0.4s ease forwards',
                animationDelay: `${0.1 + i * 0.05}s`,
                opacity: 0
              }}>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#E4002B', fontFamily: "'JetBrains Mono', monospace" }}>{stat.value}</div>
                <div style={{ fontFamily: "'Formula1', sans-serif", fontSize: '10px', color: '#8591a3', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Form section */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
            <div style={{ fontSize: '12px', letterSpacing: '2px', color: '#8591a3', textTransform: 'uppercase', marginBottom: '12px' }}>Recent Form</div>
            {formLoading ? (
              <div style={{ textAlign: 'center', color: '#8591a3', fontSize: '12px' }}>Loading form...</div>
            ) : driverForm ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#8591a3' }}>Form Rating</span>
                  <span style={{
                    padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                    background: driverForm.formRating === 'EXCELLENT' ? 'rgba(0,212,138,0.1)' : driverForm.formRating === 'GOOD' ? 'rgba(228,0,43,0.08)' : 'rgba(228,0,43,0.08)',
                    color: driverForm.formRating === 'EXCELLENT' ? '#00d48a' : driverForm.formRating === 'GOOD' ? '#E4002B' : '#E4002B',
                    border: `1px solid ${driverForm.formRating === 'EXCELLENT' ? 'rgba(0,212,138,0.3)' : driverForm.formRating === 'GOOD' ? 'rgba(228,0,43,0.3)' : 'rgba(228,0,43,0.3)'}`,
                  }}>{driverForm.formRating}</span>
                </div>
                {driverForm.last5Races?.map((race, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: '12px', color: '#c0c8d8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>{race.race}</span>
                    <span style={{
                      fontSize: '12px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                      color: race.finish === 'P1' ? '#E4002B' : race.finish === 'DNF' ? '#E4002B' : '#f4f5f8'
                    }}>{race.finish}</span>
                  </div>
                ))}
              </>
            ) : null}
          </div>

          <button
            onClick={() => navigate(`/drivers/${selectedDriver.id}?season=${season}`)}
            style={{
              width: '100%', marginTop: '24px', padding: '14px',
              background: '#E4002B', border: 'none', borderRadius: '10px',
              color: '#fff', fontWeight: 900, fontSize: '12px',
              fontFamily: "'Formula1', sans-serif", cursor: 'pointer',
              transition: 'all 0.2s', textTransform: 'uppercase',
              letterSpacing: '1px',
              boxShadow: '0 4px 15px rgba(228, 0, 43, 0.3)'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            Explore Full Analytical Profile
          </button>
        </div>
      )}
    </div>
  )
}
