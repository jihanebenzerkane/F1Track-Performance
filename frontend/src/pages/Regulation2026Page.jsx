import React, { useState } from 'react';

const regulations = [
  {
    tag: "Aerodynamics",
    title: "Active Aero replaces DRS",
    body: `Both front and rear wings now have movable flaps that adjust automatically based on where you are on track. In corners, flaps stay closed for grip. On straights, they open flat to cut drag and boost top speed. This is available to every driver, every lap not just when you're within a second of someone.

DRS is gone. What replaces it isn't just a straight-line tool. The aero now interacts with everything: set-up philosophy, tyre management, energy deployment. Teams that figure out the interaction first will be ahead.

Front wing elements are narrower. Rear beam wing is gone. Floors are flatter with extended diffusers. Less downforce overall, higher ride height requirement, which should theoretically open up more set-up variation across the grid.`,
    stats: ["No more rear beam wing", "Front wing: narrower outer elements", "Flatter floor + bigger diffuser opening", "Less total downforce than 2022–2025 era"],
    impact: "Cornering speed deltas and DRS detection logic both change. Baseline telemetry comparisons with pre-2026 data need recalibration."
  },
  {
    tag: "Race Strategy",
    title: "Overtake Mode & the Boost button",
    body: `Overtake Mode activates when you're within one second of the car ahead at a single detection point per lap. It gives you access to extra electrical energy you can deploy to attack. Unlike DRS, it's not automatic. You choose when to use it.

The Boost button is still there, renamed but functionally similar. You can use it anywhere on lap for attack or defence as long as your battery has charge. Spread it thin across the lap or dump it all in one go. That's now a strategic call, not just a driving one.

Battery recharge modes are also driver-controlled. Working with the race engineer, they select how aggressively the car harvests energy under braking and lift-off. Three tools Active Aero, Overtake Mode, Boost all interacting with each other lap by lap.`,
    stats: ["Overtake Mode: triggered within 1 sec of car ahead", "Boost usable anywhere on track", "3 energy tools available simultaneously", "Recharge limit reduced to 7MJ/lap from Miami GP"],
    impact: "Pit strategy models now factor in battery state. Energy deployment patterns visible in telemetry lap-by-lap."
  },
  {
    tag: "Power Unit",
    title: "50/50 hybrid. MGU-H is dead.",
    body: `The 1.6L V6 turbo is still there, but it produces less power than before. The electric motor has tripled its output. Net result: roughly half the power from combustion, half from electric. Total still around 750kW.

MGU-H is gone. It recovered heat energy from the turbo exhaust and was extraordinarily complex and irrelevant to any road car. Removing it cuts weight, cuts cost, and made the power unit attractive enough to bring in Audi, Red Bull Powertrains (with Ford), and get Honda back. Four manufacturers for the first time since 2017.

Energy recovery is now double what it was. The cars now run on Advanced Sustainable Fuels, certified carbon-neutral from sources like municipal waste, carbon capture, and non-food biomass.`,
    stats: ["ICE output: ~400kW (down from ~550kW)", "MGU-K: ~350kW (up from 120kW)", "MGU-H: removed entirely", "Fuel: 100% Advanced Sustainable Fuel", "ERS recovery: 7MJ/lap cap (from Miami)"],
    impact: "RPM ceiling behavior and torque curves visible in telemetry are fundamentally different from 2025 data."
  },
  {
    tag: "Chassis",
    title: "Shorter, lighter, narrower",
    body: `The cars are smaller. Wheelbase cut by 200mm to 3400mm. Overall width down 100mm to 1900mm. Minimum weight drops 30kg to 768kg. Tyres are narrower fronts shrink 25mm, rears 30mm. The arches above the front tyres are gone.

On paper this should produce a more agile car that can actually race on street circuits without a three-point turn. In practice the teams found that lighter + less downforce = harder to drive consistently. Closing speed differentials in the early races led to Bearman's crash at Suzuka and triggered the regulation refinements agreed before Miami.

The survival cell has been strengthened. Roll hoop now takes 23% more load roughly the weight of nine family cars. Front impact structure separates in two stages for better protection in secondary impacts.`,
    stats: ["Wheelbase: 3400mm (-200mm)", "Width: 1900mm (-100mm)", "Weight: 768kg (-30kg)", "Front tyre: 280mm wide (-25mm)", "Rear tyre: 375mm wide (-30mm)"],
    impact: "Lap time baselines shift across all circuits. Sector 2 grip benchmarks particularly affected on high-speed layouts."
  },
  {
    tag: "In-Season Changes",
    title: "Miami refinements already",
    body: `Three races in and the FIA called a meeting. Australia, China, Japan produced data that revealed problems: qualifying wasn't on the limit, closing speeds were dangerous, and race starts were a safety issue.

From Miami: maximum recharge per lap drops from 8MJ to 7MJ. Peak superclip power rises to 350kW from 250kW, which shortens the time the car spends harvesting and reduces driver workload. Maximum superclip duration targeted at 2–4 seconds per lap, down from 10 seconds at Suzuka before Japan's one-off fix.

A low-power start detection system gets tested at Miami. If a car shows abnormally low acceleration off the line, an automatic MGU-K deployment brings it up to minimum acceleration reducing pile-up risk without a sporting advantage. Toto Wolff asked for a scalpel. That's roughly what happened.`,
    stats: ["Recharge cap: 8MJ → 7MJ/lap", "Peak superclip: 250kW → 350kW", "Max superclip duration: ~2–4 sec/lap", "Race start detection system: tested Miami onwards"],
    impact: "Prediction models and telemetry baselines built on rounds 1–3 need adjusting from round 4 onwards."
  }
];

export default function Regulation2026Page() {
  const [expanded, setExpanded] = useState(null);

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', paddingBottom: '100px', color: '#fff' }}>

      {/* Header */}
      <div style={{ paddingTop: '10px', marginBottom: '72px' }}>
        <p style={{
          fontFamily: "'formula one racing'",
          fontSize: '15px',
          color: '#fff',
          paddingBottom: '20px',
          letterSpacing: '1px',
          marginBottom: '16px',
          textTransform: 'uppercase'
        }}>
          <span style={{ color: '#fff200ff' }}>FIA Technical Regs</span> - Season 2026
        </p>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0', marginBottom: '24px' }}>
          <h1 style={{
            fontFamily: "'formula one racing'",
            fontSize: 'clamp(38px, 6vw, 68px)',
            fontWeight: 900,
            lineHeight: 0.95,
            margin: 0,
            color: '#fff',
            letterSpacing: '0px'
          }}>
            <span style={{ color: '#fff200ff' }}>What</span><br />changed
          </h1>
          <span style={{
            fontFamily: "'formula one racing'",
            fontSize: 'clamp(38px, 6vw, 68px)',
            fontWeight: 900,
            color: '#fff200ff',
            marginLeft: '16px',
            letterSpacing: '-2px',
            lineHeight: 0.95
          }}></span>
        </div>

        <p style={{
          fontFamily: "'formula one racing'",
          fontSize: '18px',
          color: '#6b7280',
          lineHeight: 1.8,
          maxWidth: '480px',
          margin: 0
        }}>
          The biggest rules overhaul since 2022. Every prediction, telemetry baseline,
          and lap time comparison in this app accounts for what's below.
        </p>
      </div>

      {/* Entries */}
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute',
          left: '22px',
          top: '8px',
          bottom: '60px',
          width: '1px',
          background: 'linear-gradient(to bottom, #e4e400ff 0%, rgba(228, 201, 0, 0.1) 100%)',
        }} />

        {regulations.map((reg, idx) => {
          const isOpen = expanded === idx;
          return (
            <div key={idx} style={{
              display: 'flex',
              gap: '36px',
              paddingBottom: '48px',
              position: 'relative'
            }}>
              {/* Left */}
              <div style={{
                flexShrink: 0,
                width: '44px',
                paddingTop: '3px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: isOpen ? '#fff200ff' : '#2d2d2d',
                  border: isOpen ? '2px solid rgba(255, 251, 3, 0.3)' : '2px solid #1a1a1a',
                  outline: isOpen ? '1px solid #fff200ff' : 'none',
                  transition: 'all 0.2s',
                  zIndex: 1,
                  marginLeft: '2px'
                }} />
                <span style={{
                  fontFamily: "'formula one racing'",
                  fontSize: '28px',
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.04)',
                  lineHeight: 1,
                  userSelect: 'none'
                }}>{reg.number}</span>
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{
                  fontFamily: "'formula one racing'",
                  fontSize: '10px',
                  color: '#4b5563',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '7px'
                }}>{reg.tag}</span>

                <h2
                  onClick={() => setExpanded(isOpen ? null : idx)}
                  style={{
                    fontFamily: "'formula one racing'",
                    fontSize: '20px',
                    fontWeight: 800,
                    color: isOpen ? '#fff' : '#c9d1d9',
                    margin: '0 0 16px',
                    cursor: 'pointer',
                    letterSpacing: '-0.3px',
                    transition: 'color 0.15s',
                    lineHeight: 1.2
                  }}
                >
                  {reg.title}
                  <span style={{
                    marginLeft: '20px',
                    fontSize: '12px',
                    color: '#fff200ff',
                    fontWeight: 400,
                    fontFamily: "'formula one racing'"
                  }}>{isOpen ? '-' : '+'}</span>
                </h2>

                <p style={{
                  fontFamily: "'formula one racing'",
                  fontSize: '18px',
                  color: '#6b7280',
                  lineHeight: 1.85,
                  margin: '0 0 16px',
                  maxWidth: '600px'
                }}>
                  {reg.body.split('\n\n')[0]}
                </p>

                {isOpen && (
                  <div>
                    {reg.body.split('\n\n').slice(1).map((para, i) => (
                      <p key={i} style={{
                        fontFamily: "'formula one racing'",
                        fontSize: '18px',
                        color: '#6b7280',
                        lineHeight: 1.85,
                        margin: '0 0 16px',
                        maxWidth: '600px'
                      }}>{para}</p>
                    ))}

                    <div style={{
                      margin: '20px 0',
                      paddingLeft: '16px',
                      borderLeft: '2px solid #1f2937'
                    }}>
                      {reg.stats.map((s, i) => (
                        <div key={i} style={{
                          fontFamily: "'formula one racing'",
                          fontSize: '12px',
                          color: '#9ca3af',
                          marginBottom: '6px',
                          lineHeight: 1.5
                        }}>{s}</div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginTop: '8px' }}>
                      <span style={{ color: '#e4d100ff', fontSize: '12px', flexShrink: 0, marginTop: '2px' }}>↳</span>
                      <span style={{
                        fontFamily: "'formula one racing'",
                        fontSize: '12px',
                        color: '#fff200ff',
                        fontStyle: 'italic',
                        lineHeight: 1.6
                      }}>{reg.impact}</span>
                    </div>
                  </div>
                )}

                <div style={{ marginTop: '32px', height: '1px', background: 'rgba(255,255,255,0.04)' }} />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ paddingLeft: '80px', paddingTop: '8px' }}>
        <p style={{
          fontFamily: "'formula one racing'",
          fontSize: '11px',
          color: '#2d2d2d',
          margin: 0,
          lineHeight: 1.7
        }}>
          Sources: formula1.com, fia.com, motorsport.com  April 2026<br />
          In-season adjustments from Miami GP onward reflected above.
        </p>
      </div>

    </div>
  );
}