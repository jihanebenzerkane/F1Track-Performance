import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Regulation2026Page() {
  const navigate = useNavigate();

  const rules = [
    {
      title: "Active Aerodynamics",
      desc: "Fully movable front and rear wings switch between two modes: 'Straight Mode' (flaps open, low drag) and 'Corner Mode' (flaps closed, high downforce). DRS is gone — this is now standard operation, not just an overtaking gimmick.",
      impact: "Affects cornering speed deltas tracked in circuit telemetry."
    },
    {
      title: "Overtake Mode",
      desc: "Replaces DRS as the driver-activated passing aid. Within one second of the car ahead, drivers get 0.5MJ of extra electrical energy — deployable strategically rather than just in a single zone. Provides full 350kW boost up to 337km/h, compared to standard taper from 290km/h.",
      impact: "Replaces DRS detection logic in lap comparison data."
    },
    {
      title: "50/50 Power Unit",
      desc: "The complex MGU-H is gone. The MGU-K now produces 350kW (up from 120kW) while the 1.6L V6 drops to 400kW. Total output stays around 750kW, but with a true 50/50 split between combustion and electric. Energy recovery doubles to 8.5MJ per lap. Runs on 100% sustainable fuel — no fossil content.",
      impact: "Changes RPM ceiling behavior visible in telemetry channels."
    },
    {
      title: "Nimble Car Architecture",
      desc: "Minimum weight drops 30kg to 768kg. Wheelbase cut by 200mm to 3400mm. Overall width reduced by 100mm to 1900mm. The goal: cars that can actually race on street circuits without needing a three-point turn.",
      impact: "Shifts lap time baselines used in the prediction model."
    },
    {
      title: "Narrower Tyres",
      desc: "Same 18-inch rims from 2022, but the rubber shrinks. Fronts go from 305mm to 280mm wide (-25mm). Rears drop from 405mm to 375mm (-30mm). Less drag, less weight, and hopefully less grip-dependence on perfect tyre temperature windows.",
      impact: "Shifts sector 2 grip benchmarks on high-speed circuits."
    },
    {
      title: "Safety & Visibility",
      desc: "Reinforced roll hoop, stricter side impact tests, and a two-stage nose that stays attached under lateral loading. Plus: flashing yellow LED lights on the wing mirrors — so you can see a spinning car in the wet before you T-bone it.",
      impact: "New safety car patterns affect pit strategy simulations."
    }
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', animation: 'fadeIn 0.5s ease' }}>

      {/* Header */}
      <div style={{ marginBottom: '48px', borderLeft: '4px solid #E4002B', paddingLeft: '24px' }}>
        <h1 style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '36px',
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: '2px',
          color: '#fff',
          margin: '0 0 16px'
        }}>
          FIA 2026 <span style={{ color: '#E4002B' }}>Regulations</span>
        </h1>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '13px',
          color: '#8591a3',
          maxWidth: '620px',
          lineHeight: 1.8,
          margin: 0
        }}>
          These regulations change everything, the cars,
          the strategy, the data. Every dataset, prediction, 
          and telemetry baseline in this app is calibrated to what's different this year.
        </p>
      </div>

      {/* Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
      }}>
        {rules.map((rule, idx) => (
          <div
            key={idx}
            style={{
              background: '#0a0a0a',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '12px',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              transition: 'all 0.25s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(228,0,43,0.4)';
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <h3 style={{
              fontFamily: "'Formula1', sans-serif",
              fontSize: '15px',
              fontWeight: 900,
              color: '#fff',
              margin: 0,
              letterSpacing: '0.5px'
            }}>
              {rule.title}
            </h3>

            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              color: '#8591a3',
              lineHeight: 1.75,
              margin: 0,
              flexGrow: 1
            }}>
              {rule.desc}
            </p>

            {/* Impact tag */}
            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.05)',
              paddingTop: '12px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px'
            }}>
              <span style={{
                color: '#E4002B',
                fontSize: '12px',
                fontFamily: "'Inter', sans-serif",
                flexShrink: 0,
                marginTop: '1px'
              }}>→</span>
              <span style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '10px',
                color: '#E4002B',
                lineHeight: 1.6
              }}>
                {rule.impact}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Closing line */}
      <div style={{
        marginTop: '48px',
        padding: '24px 28px',
        background: '#0a0a0a',
        border: '1px solid rgba(255,255,255,0.07)',
       
        borderRadius: '12px'
      }}>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '12px',
          color: '#8591a3',
          margin: 0,
          lineHeight: 1.7
        }}>
          These regulations are baked into every datasetb & telemetry
          baseline in F1Track. The 2026 season is where the sport resets and so
          does the data.
        </p>
      </div>

    </div>
  );
}