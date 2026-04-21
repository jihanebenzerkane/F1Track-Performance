import { carParts, teamSpecificInfo } from '../data/carData';

export default function CarInfoPanel({ selectedPart, teamId, teamColor, dbStats, onClose }) {
  const part = selectedPart ? carParts[selectedPart] : null;
  const team = teamId ? teamSpecificInfo[teamId] : null;

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '440px',
      height: '100%',
      background: '#080808',
      borderRight: `3px solid ${teamColor}`,
      transform: part ? 'translateX(0)' : 'translateX(-100%)',
      transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      overflowY: 'auto',
      zIndex: 10,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {part && team && (
        <>
          {/* Color band at very top */}
          <div style={{
            height: '4px',
            background: `linear-gradient(90deg, ${teamColor}, transparent)`,
            flexShrink: 0,
          }} />

          {/* Header */}
          <div style={{
            padding: '28px 32px 24px',
            borderBottom: `1px solid #141414`,
            position: 'sticky',
            top: 0,
            background: '#080808',
            zIndex: 1,
          }}>
            {/* Team + close */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '9px',
                color: teamColor,
                letterSpacing: '4px',
                textTransform: 'uppercase',
              }}>
                {team.car} · {team.fullName.split(' ')[0]}
              </div>
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: `1px solid #1a1a1a`,
                  color: '#333',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  fontFamily: 'sans-serif',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = teamColor;
                  e.currentTarget.style.color = teamColor;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#1a1a1a';
                  e.currentTarget.style.color = '#333';
                }}
              >
                ✕
              </button>
            </div>

            {/* Part icon + title */}
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '32px',
              marginBottom: '8px',
            }}>
              {part.icon}
            </div>
            <h2 style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900,
              fontSize: '52px',
              color: '#f0e8e0',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              margin: '0 0 6px',
              lineHeight: 0.9,
            }}>
              {part.content.title}
            </h2>
            <div style={{
              fontFamily: "'Barlow', sans-serif",
              fontSize: '14px',
              color: teamColor,
              marginTop: '10px',
              opacity: 0.8,
            }}>
              {part.content.subtitle}
            </div>
          </div>

          <div style={{
            padding: '28px 32px',
            borderBottom: '1px solid #0f0f0f',
            background: '#050505',
          }}>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900,
              fontSize: '80px',
              color: teamColor,
              lineHeight: 1,
              letterSpacing: '-2px',
            }}>
              {part.content.specs[0].value}
            </div>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '10px',
              color: '#333',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              marginTop: '8px',
            }}>
              {part.content.specs[0].label}
            </div>
          </div>

          {/* Specs grid */}
          <div style={{ padding: '24px 32px', borderBottom: '1px solid #0f0f0f' }}>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '9px',
              color: '#2a2a2a',
              letterSpacing: '4px',
              textTransform: 'uppercase',
              marginBottom: '18px',
            }}>
              Full Specifications
            </div>
            {part.content.specs.slice(1).map((spec, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                padding: '12px 0',
                borderBottom: '1px solid #0c0c0c',
              }}>
                <span style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontSize: '11px',
                  color: '#2e2e2e',
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                }}>
                  {spec.label}
                </span>
                <span style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '13px',
                  color: '#c0b8b0',
                  textAlign: 'right',
                  maxWidth: '55%',
                }}>
                  {spec.value}
                </span>
              </div>
            ))}
          </div>

          {/* How it works */}
          <div style={{ padding: '28px 32px', borderBottom: '1px solid #0f0f0f' }}>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '9px',
              color: '#2a2a2a',
              letterSpacing: '4px',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}>
              How It Works
            </div>
            <p style={{
              fontFamily: "'Barlow', sans-serif",
              fontSize: '16px',
              color: '#888',
              lineHeight: '1.8',
              margin: 0,
            }}>
              {part.content.explanation}
            </p>
          </div>

          {/* Did you know */}
          <div style={{
            margin: '0',
            padding: '32px',
            background: `linear-gradient(135deg, #0a0a0a, #050505)`,
            borderTop: `1px solid ${teamColor}22`,
            borderBottom: `1px solid ${teamColor}22`,
          }}>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '9px',
              color: teamColor,
              letterSpacing: '4px',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}>
              ★ Did You Know
            </div>
            <p style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: '22px',
              color: '#f0e8e0',
              lineHeight: '1.4',
              margin: 0,
              letterSpacing: '0.5px',
            }}>
              {part.content.funFact}
            </p>
          </div>

          {/* 2026 Regulations */}
          <div style={{
            padding: '28px 32px',
            borderBottom: '1px solid #0f0f0f',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '16px',
            }}>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '9px',
                color: '#333',
                letterSpacing: '4px',
                textTransform: 'uppercase',
              }}>
                2026 Regulation Changes
              </div>
              <div style={{
                padding: '2px 8px',
                background: '#111',
                border: '1px solid #222',
                fontFamily: "'Space Mono', monospace",
                fontSize: '8px',
                color: '#444',
                letterSpacing: '2px',
              }}>
                INCOMING
              </div>
            </div>
            <p style={{
              fontFamily: "'Barlow', sans-serif",
              fontSize: '15px',
              color: '#555',
              lineHeight: '1.7',
              margin: 0,
            }}>
              {part.content.changeIn2026}
            </p>
          </div>

          {/* Team-specific highlights */}
          {/* Team-specific highlights from DB */}
          <div style={{ padding: '28px 32px 40px' }}>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '9px',
              color: '#2a2a2a',
              letterSpacing: '4px',
              textTransform: 'uppercase',
              marginBottom: '20px',
            }}>
              {team.car} — 2025 Season Stats
            </div>
            
            {dbStats ? (
              <>
                <div style={{ display: 'flex', gap: '14px', marginBottom: '14px', alignItems: 'center' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: teamColor, flexShrink: 0 }} />
                  <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '14px', color: '#666' }}>
                    <strong>Position:</strong> P{dbStats.position}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '14px', marginBottom: '14px', alignItems: 'center' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: teamColor, flexShrink: 0 }} />
                  <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '14px', color: '#666' }}>
                    <strong>Points:</strong> {dbStats.points} pts
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '14px', marginBottom: '14px', alignItems: 'center' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: teamColor, flexShrink: 0 }} />
                  <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '14px', color: '#666' }}>
                    <strong>Wins:</strong> {dbStats.wins}
                  </span>
                </div>
              </>
            ) : (
              team.highlights.map((h, i) => (
                <div key={i} style={{ display: 'flex', gap: '14px', marginBottom: '14px', alignItems: 'flex-start' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: teamColor, flexShrink: 0, marginTop: '6px' }} />
                  <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
                    {h}
                  </span>
                </div>
              ))
            )}

            {/* Drivers */}
            <div style={{
              marginTop: '24px',
              padding: '16px',
              background: '#050505',
              borderLeft: `3px solid ${teamColor}`,
            }}>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '9px',
                color: '#333',
                letterSpacing: '3px',
                marginBottom: '10px',
              }}>
                2025 DRIVERS
              </div>
              {(dbStats ? dbStats.drivers : team.drivers).map((d, i) => (
                <div key={i} style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: '20px',
                  color: '#e8e0d8',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                }}>
                  {d}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
