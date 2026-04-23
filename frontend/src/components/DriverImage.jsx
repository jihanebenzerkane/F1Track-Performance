import { useState, useEffect } from 'react'
import { getDriverImageUrl } from '../api/images'

export default function DriverImage({ driverId, driverNumber, size = 40 }) {
  const [broken, setBroken] = useState(false)
  const [openF1Url, setOpenF1Url] = useState(null)
  const [loading, setLoading] = useState(true)
  const fallbackSrc = getDriverImageUrl(driverId)

  useEffect(() => {
    setBroken(false)
    setOpenF1Url(null)
    setLoading(true)

    if (driverNumber) {

      fetch(` /api/telemetry/drivers?session_key=latest`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            // Find driver by number AND verify name to prevent mismatches (e.g. Lando as #1 in test sessions)
            const driver = data.find(d => {
              const numMatch = String(d.driver_number) === String(driverNumber);
              const lastName = (driverId || '').split('-').pop()?.toUpperCase();
              const nameMatch = d.full_name?.toUpperCase().includes(lastName || 'EMPTY_NAME');
              return numMatch && nameMatch;
            })
            if (driver?.headshot_url) {
              setOpenF1Url(driver.headshot_url.replace('http:', 'https:'))
            }
          }
          setLoading(false)
        })
        .catch(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [driverNumber])

  const src = openF1Url || (!loading ? fallbackSrc : null)
  const initials = (driverId || 'DR')
    .split('-')
    .map(part => part[0]?.toUpperCase())
    .join('')
    .slice(0, 2)

  const content = (!src || broken) ? (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      background: '#0a0a0a',
      color: '#4b5563',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--mono)',
      fontSize: `${Math.max(10, Math.round(size * 0.3))}px`,
      fontWeight: 700,
      border: '1px solid rgba(255,255,255,0.08)',
      flexShrink: 0,
      letterSpacing: '1px'
    }}>
      {initials}
    </div>
  ) : (
    <img
      src={src}
      alt={driverId}
      onError={() => {
        if (src === openF1Url && fallbackSrc) {
          setOpenF1Url(null)
          setBroken(false)
        } else {
          setBroken(true)
        }
      }}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        objectFit: 'cover',
        objectPosition: 'top',
        border: '1px solid rgba(255,255,255,0.08)',
        background: '#0a0a0a',
        flexShrink: 0,
        display: 'block'
      }}
    />
  )

  return (
    <div style={{ position: 'relative', width: `${size}px`, height: `${size}px`, flexShrink: 0 }}>
      {content}
      {driverNumber && (
        <div style={{
          position: 'absolute',
          bottom: '-2px',
          right: '-4px',
          background: '#E4002B',
          color: '#fff',
          fontFamily: 'var(--mono)',
          fontSize: `${Math.max(8, Math.round(size * 0.22))}px`,
          fontWeight: 700,
          lineHeight: 1,
          padding: '2px 4px',
          borderRadius: '4px',
          border: '1px solid #050505',
          letterSpacing: '0',
          minWidth: `${Math.round(size * 0.35)}px`,
          textAlign: 'center'
        }}>
          {driverNumber}
        </div>
      )}
    </div>
  )
}
