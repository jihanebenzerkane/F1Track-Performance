import { useState } from 'react'
import { getDriverImageUrl } from '../api/images'

export default function DriverImage({ driverId, size = 40 }) {
  const [broken, setBroken] = useState(false)
  const src = getDriverImageUrl(driverId)
  const initials = (driverId || 'DR')
    .split('-')
    .map(part => part[0]?.toUpperCase())
    .join('')
    .slice(0, 2)

  if (!src || broken) {
    return (
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          background: '#24243a',
          color: '#a9a9c0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: `${Math.max(10, Math.round(size * 0.3))}px`,
          border: '1px solid rgba(255,255,255,0.08)',
          flexShrink: 0,
        }}
      >
        {initials}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={driverId}
      onError={() => setBroken(true)}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        objectFit: 'cover',
        border: '1px solid rgba(255,255,255,0.08)',
        background: '#101019',
        flexShrink: 0,
      }}
    />
  )
}
