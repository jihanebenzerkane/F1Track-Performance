import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Regulation2026Page() {
  const navigate = useNavigate();

  const rules = [
    {
      title: "Active Aerodynamics",
      desc: "Fully movable front and rear wings switch between two modes: 'Straight Mode' (flaps open, low drag) and 'Corner Mode' (flaps closed, high downforce). DRS is gone — this is now standard operation, not just an overtaking gimmick."
    },
    {
      title: "Overtake Mode",
      desc: "Replaces DRS as the driver-activated passing aid. Within one second of the car ahead, drivers get 0.5MJ of extra electrical energy — deployable strategically rather than just in a single zone. Provides full 350kW boost up to 337km/h, compared to standard taper from 290km/h."
    },
    {
      title: "50/50 Power Unit",
      desc: "The complex MGU-H is gone. The MGU-K now produces 350kW (up from 120kW) while the 1.6L V6 drops to 400kW. Total output stays around 750kW, but with a true 50/50 split between combustion and electric. Energy recovery doubles to 8.5MJ per lap. Runs on 100% sustainable fuel — no fossil content."
    },
    {
      title: "Nimble Car Architecture",
      desc: "Minimum weight drops 30kg to 768kg. Wheelbase cut by 200mm to 3400mm. Overall width reduced by 100mm to 1900mm. The goal: cars that can actually race on street circuits without needing a three-point turn."
    },
    {
      title: "Narrower Tyres",
      desc: "Same 18-inch rims from 2022, but the rubber shrinks. Fronts go from 305mm to 280mm wide (-25mm). Rears drop from 405mm to 375mm (-30mm). Less drag, less weight, and hopefully less grip-dependence on perfect tyre temperature windows."
    },
    {
      title: "Safety & Visibility",
      desc: "Reinforced roll hoop, stricter side impact tests, and a two-stage nose that stays attached under lateral loading. Plus: flashing yellow LED lights on the wing mirrors — so you can see a spinning car in the wet before you T-bone it."
    }
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', animation: 'fadeIn 0.5s ease' }}>
      
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{
          fontFamily: "'Formula1', sans-serif",
          fontSize: '46px',
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: '2px',
          color: '#fff',
          margin: '0 0 16px'
        }}>
          FIA 2026 <span style={{ color: '#E4002B' }}>Regulations</span>
        </h1>
        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '14px',
          color: '#8591a3',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: 1.6
        }}>
          The biggest technical overhaul in Formula 1 history. Smaller, lighter, and more agile cars powered by vastly increased electrical power and active aerodynamics.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        padding: '24px 0'
      }}>
        {rules.map((rule, idx) => (
          <div key={idx} style={{
            background: '#0a0a0a',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '32px',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(228, 0, 43, 0.5)';
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 12px 24px rgba(228, 0, 43, 0.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <h3 style={{
              fontFamily: 'var(--bold)',
              fontSize: '18px',
              color: '#fff',
              margin: '0 0 12px',
              letterSpacing: '1px'
            }}>{rule.title}</h3>
            <p style={{
              fontFamily: 'var(--font)',
              fontSize: '14px',
              color: '#a3a3a3',
              lineHeight: 1.7,
              margin: 0
            }}>
              {rule.desc}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
}