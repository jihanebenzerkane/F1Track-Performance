import { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { safeGetStandings, safeGetConstructorStandings } from '../api/f1api';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';

function AnimatedCar({ modelPath }) {
  const { scene } = useGLTF(modelPath);
  const group = useRef();


  const [scrollY, setScrollY] = useState(0);


  useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);


    const scale = 0.66 / maxDim;
    scene.scale.setScalar(scale);
    scene.position.copy(center.multiplyScalar(-scale));


    scene.rotation.y = Math.PI / 2;

    scene.traverse((c) => {
      if (c.isMesh) {
        c.castShadow = true;
        c.receiveShadow = true;
      }
    });
  }, [scene]);

  useEffect(() => {
    const handleScroll = () => {
      // Calculate scroll progress from 0 to 1
      const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollMax > 0 ? Math.min(Math.max(window.scrollY / scrollMax, 0), 1) : 0;
      setScrollY(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useFrame(() => {
    if (!group.current) return;
    const targetRotationY = -(Math.PI * 0.75) * scrollY;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetRotationY, 0.1);
  });

  return (
    <group ref={group} position={[0, -1.9, 0]}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload('/models/f1.glb'); //Loading the F1 car

export default function HomePage() {
  const navigate = useNavigate();

  const statsRef = useRef(null);
  const [counted, setCounted] = useState(false);
  const [counts, setCounts] = useState({ teams: 0, races: 0, years: 0 });
  // I built this Data Ticker to mimic the real F1 broadcast experience.
  // It fetches the latest championship stats dynamically from our backend!
  const [tickerData, setTickerData] = useState([]);
  const [dbStats, setDbStats] = useState({ drivers: 915, races: 1171, years: 76 });
  const targets = { teams: 20, races: 24, years: 76 };
  const [constructorStandings, setConstructorStandings] = useState([]);
  const teamColors = {
    ferrari: '#E4002B', mercedes: '#00D2BE', 'red bull': '#3671C6',
    mclaren: '#FF8000', alpine: '#0093CC', 'astonmartin': '#006F62',
  };


  useEffect(() => {
    safeGetConstructorStandings(2025)
      .then(setConstructorStandings);
  }, []);

  useEffect(() => {
    fetch(' /api/leader/2025')
      .then(r => r.json())
      .then(data => {
        setDbStats(prev => ({ ...prev, totalRaces2025: data.totalRaces }));
      }).catch(() => { });
  }, []);

  useEffect(() => {
    Promise.all([
      fetch(' /api/leader/2025').then(r => r.json()),
      safeGetStandings(2025),
      safeGetConstructorStandings(2025),
      fetch(' /api/races').then(r => r.json()),
      fetch(' /api/drivers').then(r => r.json()),
    ]).then(([leader, drivers, constructors, races, allDrivers]) => {
      const today = new Date().toISOString().split('T')[0];
      const sortedRaces = [...(races || [])].sort((a, b) => (a.raceDate || '').localeCompare(b.raceDate || ''));
      const lastRace = sortedRaces.filter(r => r.raceDate && r.raceDate < today).slice(-1)[0];
      const nextRace = sortedRaces.find(r => r.raceDate && r.raceDate >= today);

      const p1Driver = drivers?.[0];
      const p1Constructor = constructors?.[0];

      setDbStats({
        drivers: allDrivers ? allDrivers.length : 850,
        races: races ? races.length : 1100,
        years: 76,
      });

      setTickerData([
        { label: 'CHAMPIONSHIP LEADER', value: `${p1Driver?.name || leader?.worldChampion} | ${p1Driver?.points || 0} PTS` },
        { label: 'CONSTRUCTOR LEADER', value: `${p1Constructor?.name || '—'} | ${p1Constructor?.points || 0} PTS` },
        { label: 'LAST RACE', value: lastRace ? `${lastRace.grandPrix.replace('Sao', 'São')} GP` : '—' },
        { label: 'NEXT RACE', value: nextRace ? `${nextRace.grandPrix.replace('Sao', 'São')} GP | ${nextRace.raceDate}` : '—' },
        { label: 'MOST WINS', value: leader?.mostWinsDriver || '—' },
      ]);
    }).catch(() => { });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !counted) {
        setCounted(true);
        const dynamicTargets = { teams: 20, years: dbStats.years, totalRaces: dbStats.races, totalDrivers: dbStats.drivers };
        Object.entries(dynamicTargets).forEach(([key, target]) => {
          let start = 0;
          const step = target / 40;
          const interval = setInterval(() => {
            start += step;
            if (start >= target) {
              start = target;
              clearInterval(interval);
            }
            setCounts(prev => ({ ...prev, [key]: Math.floor(start) }));
          }, 30);
        });
      }
    }, { threshold: 0.3 });
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [counted, dbStats]);

  return (

    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      backgroundColor: '#08080a',
      backgroundImage: `
        linear-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.07) 1px, transparent 1px)
      `,
      backgroundSize: '40px 40px',
      fontFamily: "var(--font)",
      color: 'var(--text)'
    }}>

      {/* 3D Canvas Fixed Background */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none'
      }}>
        <Canvas
          style={{ width: '100vw', height: '100vh' }}
          camera={{ position: [0, 0, 6.5], fov: 35 }}
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.1
          }}
          onCreated={({ gl }) => {
            gl.setSize(window.innerWidth, window.innerHeight);
          }}
        >
          {/* Environment preset that automatically gives Venice Sunset lighting */}
          <Environment preset="sunset" />

          <directionalLight
            position={[8, 10, 8]}
            intensity={3.5}
            color="#ffe8d6"
          />
          <directionalLight
            position={[-5, 3, -5]}
            intensity={1.0}
            color="#aaccff"
          />
          <ambientLight intensity={0.4} />

          <AnimatedCar modelPath="/models/f1.glb" />
        </Canvas>
      </div>


      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
        background: 'linear-gradient(180deg, rgba(59, 12, 12, 0.1) 0%, transparent 20%, transparent 70%, rgba(10,10,14, 0.9) 100%)'
      }} />


      <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', background: 'linear-gradient(180deg, rgba(255, 7, 7, 0.1) 0%, transparent 20%, transparent 70%, rgba(10,10,14, 0.7) 100%)' }} />
      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '18vh',
        minHeight: '300vh'

      }}>


        <div style={{
          position: 'fixed',
          top: '64px',
          left: 0,
          width: '100%',
          zIndex: 9999,
          backgroundColor: '#000000ff',
          borderTop: '1px solid #ff0000ff',
          overflow: 'hidden',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
        }}>
          <div style={{
            display: 'flex',
            whiteSpace: 'nowrap',
            animation: 'tickerScroll 80s linear infinite',
            willChange: 'transform',
          }}>
            {[...Array(2)].map((_, i) => (
              <span key={i} style={{ display: 'flex', gap: '0' }}>
                {(tickerData.length > 0 ? tickerData : [
                  { label: 'CHAMPIONSHIP LEADER', value: 'Lando Norris — 423 pts' },
                  { label: 'CONSTRUCTOR LEADER', value: 'McLaren — 833 pts' },
                  { label: 'LAST RACE', value: 'Japan GP — Suzuka' },
                  { label: 'NEXT RACE', value: 'Miami GP — May 3' },
                  { label: 'FASTEST LAP RECORD', value: 'Monza — 1:19.119' },
                  { label: 'MOST RACE WINS', value: 'Lewis Hamilton — 105' },
                  { label: 'CLOSEST FINISH', value: 'Monza 1971 — 0.010s' },
                  { label: 'TOTAL RACES IN DB', value: '1,171 across 76 seasons' },
                  { label: 'ACTIVE DRIVERS', value: '20 on the 2026 grid' },
                  { label: '2026 REGULATION', value: 'Active aero — no DRS' },
                ]).map((item, j) => (
                  <span key={j} style={{
                    fontFamily: 'var(--mono)',
                    fontSize: '13px',
                    letterSpacing: '1px',
                    color: '#fff',
                    padding: '0 32px',
                  }}>
                    <span style={{ color: '#E4002B', opacity: 0.9, marginRight: '10px', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '11px' }}>{item.label}</span>
                    <span style={{ fontWeight: 800, textTransform: 'uppercase', color: '#fff', fontSize: '14px' }}>{item.value}</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>

        {/* Hero Typography */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{
            fontSize: '140px',
            fontWeight: 900,
            letterSpacing: '0.02em',
            margin: 0,
            lineHeight: 1,
            textTransform: 'uppercase',
            textShadow: '0 10px 40px rgba(0, 0, 0, 0.6)'
          }}>
            <span style={{ color: '#E4002B' }}>F1</span>
            <span style={{ color: '#FFFFFF' }}>TRACK</span>
          </h1>
          <p style={{
            fontFamily: "var(--mono)",
            fontSize: '18px',
            letterSpacing: '10px',
            textTransform: 'uppercase',
            margin: '10px 0 0 0',
            fontWeight: 400,
            background: 'linear-gradient(90deg, #888888, #FFFFFF, #888888)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent',
          }}>
            F1 PERFORMANCE DATA
          </p>
        </div>



        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginTop: '40px',
          width: '100%',
          maxWidth: '1000px',
          padding: '0 20px',
        }}>
          <button onClick={() => navigate('/standings?season=2025')} className="home-btn" style={{
            padding: '24px', fontSize: '15px ', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px',
            color: '#ffffffff', border: 'none', borderRadius: '12px', background: '#7302025e',
            cursor: 'pointer', transition: 'all 0.2s',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <span>2025 Standings</span>
          </button>

          <button onClick={() => navigate('/Form')} className="home-btn" style={{
            padding: '24px', fontSize: '15px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px',
            color: '#ffffff', background: 'rgba(255, 0, 0, 0.29)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
            backdropFilter: 'blur(10px)', cursor: 'pointer', transition: 'all 0.2s',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#fff'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
            <span>The 2026 Grid</span>
          </button>

          <button onClick={() => navigate('/standings?season=2026')} className="home-btn" style={{
            padding: '24px', fontSize: '15px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px',
            color: '#ffffffff', background: 'rgba(255, 0, 0, 0.29)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
            backdropFilter: 'blur(10px)', cursor: 'pointer', transition: 'all 0.2s',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#fff'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
            <span>2026 Standings</span>
          </button>

          <button onClick={() => navigate('/predictions')} className="home-btn" style={{
            padding: '24px', fontSize: '15px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px',
            color: '#ffffffff', background: '#8e04045e', border: 'none', borderRadius: '12px',
            cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <span>Predictions</span>
          </button>
        </div>

        <div style={{
          marginTop: '40vh',
          width: '100%',
          maxWidth: '900px',
          padding: '0 20px',
        }}>
          <p style={{
            fontFamily: 'var(--bold)',
            fontSize: '15px',
            color: '#ffffffff',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}>Some Features</p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '3fr 3fr',
            gap: '15px',
          }}>
            {[
              {
                tag: 'STANDINGS',
                title: 'Live Standings & Telemetry',
                desc: '75 years of championship data. Every driver, every race, every point, from Fangio to Verstappen. Live-updated through the 2026 grid.',
                link: '/standings?season=2026',
                cta: 'Explore standings'
              },
              {
                tag: '3D VIEWER',
                title: '3D Car Viewer',
                desc: 'Tear down all 6 constructor cars in real time. Rotate, inspect, and compare engine specs, aero packages, and tyre compounds.',
                link: '/cars',
                cta: 'View cars'
              },
              {
                tag: 'Drivers',
                title: 'Drivers',
                desc: 'The 2026 Grid. Every driver, every team, every car. From the rookies to the veterans, see the full lineup for the 2026 season.',
                link: '/Form',
                cta: 'Explore drivers'
              },
              {
                tag: 'PREDICTIONS',
                title: 'Race Predictions',
                desc: 'Feed 75 seasons of race data into a Monte Carlo engine. Win probabilities, optimal pit windows, and driver form scores.',
                link: '/predictions',
                cta: 'Run predictions'
              },
              {
                tag: 'TELEMETRY',
                title: 'Lap Analysis',
                desc: 'Real telemetry from OpenF1. Sector breakdowns, pit lap markers, and car data channels for every driver.',
                link: '/telemetry',
                cta: 'Analyse laps'
              },
              {
                tag: 'H2H',
                title: 'Head to Head',
                desc: 'Compare any two drivers across any season. Points, wins, poles, fastest laps — the full statistical battle.',
                link: '/h2h',
                cta: 'Compare drivers'
              },
            ].map((card, i) => (
              <div
                key={i}
                onClick={() => navigate(card.link)}
                style={{
                  background: 'rgba(10, 10, 14, 0.65)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '32px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(228,0,43,0.6)';
                  e.currentTarget.style.background = 'rgba(228, 0, 43, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.background = 'rgba(10, 10, 14, 0.65)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ fontSize: '28px', marginBottom: '16px' }}>{card.icon}</div>
                <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 800, margin: '0 0 12px 0', letterSpacing: '0.5px' }}>{card.title}</h3>
                <p style={{ color: '#e2e8f0', fontSize: '14px', lineHeight: 1.7, margin: '0 0 20px 0' }}>{card.desc}</p>
                <span style={{ color: '#E4002B', fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>{card.cta} →</span>
              </div>
            ))}
          </div>
        </div>
        {/* STATS NUMBERS */}
        <div ref={statsRef} style={{
          marginTop: '60px',
          width: '100%',
          maxWidth: '960px',
          padding: '48px 32px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '32px',
          background: 'rgba(8, 8, 12, 0.75)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.4)'
        }}>
          {[
            { value: counts.years || 0, suffix: '+', label: 'YEARS OF DATA' },
            { value: (counts.totalRaces || 0).toLocaleString(), suffix: '', label: 'RACES IN DATABASE' },
            { value: (counts.totalDrivers || 0).toLocaleString(), suffix: '+', label: 'DRIVERS TRACKED' },
            { value: counts.teams || 0, suffix: '', label: 'CURRENT & HISTORIC CONSTRUCTORS' },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '52px',
                fontWeight: 900,
                color: i % 2 === 0 ? '#fff' : '#E4002B',
                lineHeight: 1,
                fontFamily: 'var(--font)',
              }}>
                {stat.value}{stat.suffix}
              </div>
              <div style={{
                fontFamily: 'var(--mono)',
                fontSize: '11px',
                color: '#6b7280',
                letterSpacing: '2px',
                marginTop: '8px',
                textTransform: 'uppercase',
              }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Auto-scrolling circuit carousel */}


        {/* DRIVER SPOTLIGHT */}
        <section style={{ padding: '80px 40px', maxWidth: '1200px', margin: '0 auto' }}>

          <div className="section-title">
            <span className="section-title-line" />
            DRIVER SPOTLIGHT
            <span className="section-title-line" />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: '0',
            alignItems: 'stretch',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '16px',
            overflow: 'hidden',
            marginTop: '40px'
          }}>

            {/* Driver A */}
            <div style={{ background: '#0a0a0a', padding: '40px 32px' }}>
              <div style={{
                fontFamily: 'var(--mono)',
                fontSize: '10px',
                color: '#E4002B',
                letterSpacing: '3px',
                marginBottom: '16px'
              }}>DRIVER A</div>
              <div style={{
                fontFamily: 'var(--font)',
                fontSize: '32px',
                fontWeight: 900,
                color: '#fff',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '4px'
              }}>Max Verstappen</div>
              <div style={{
                fontFamily: 'var(--mono)',
                fontSize: '11px',
                color: '#4b5563',
                letterSpacing: '2px',
                marginBottom: '32px'
              }}>RED BULL RACING · #1</div>

              {[
                { label: 'World Titles', value: '4' },
                { label: 'Race Wins', value: '63' },
                { label: 'Pole Positions', value: '40' },
                { label: 'Podiums', value: '112' },
                { label: 'Points', value: '2,586' },
              ].map((stat, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.04)'
                }}>
                  <span style={{
                    fontFamily: 'var(--mono)',
                    fontSize: '11px',
                    color: '#4b5563',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>{stat.label}</span>
                  <span style={{
                    fontFamily: 'var(--font)',
                    fontSize: '16px',
                    fontWeight: 900,
                    color: '#fff'
                  }}>{stat.value}</span>
                </div>
              ))}
            </div>

            {/* VS divider */}
            <div style={{
              background: '#0d0d0d',
              width: '80px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              borderLeft: '1px solid rgba(255,255,255,0.05)',
              borderRight: '1px solid rgba(255,255,255,0.05)',
            }}>
              <div style={{
                fontFamily: 'var(--font)',
                fontSize: '30px',
                fontWeight: 900,
                color: '#E4002B',
                letterSpacing: '2px'
              }}>VS</div>

              <a href="/h2h" style={{
                fontFamily: 'f1wide',
                fontSize: '9px',
                color: '#4b5563',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                textDecoration: 'none',
                writingMode: 'vertical-rl',
                transition: 'color 0.2s'
              }}
                onMouseEnter={e => e.currentTarget.style.color = '#E4002B'}
                onMouseLeave={e => e.currentTarget.style.color = '#4b5563'}
              >Full comparison </a>
            </div>

            {/* Driver B */}
            <div style={{ background: '#0a0a0a', padding: '40px 32px' }}>
              <div style={{
                fontFamily: 'var(--mono)',
                fontSize: '10px',
                color: '#D4AF37',
                letterSpacing: '3px',
                marginBottom: '16px'
              }}>DRIVER B</div>
              <div style={{
                fontFamily: 'var(--font)',
                fontSize: '32px',
                fontWeight: 900,
                color: '#fff',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '4px'
              }}>Lewis Hamilton</div>
              <div style={{
                fontFamily: 'ui-rounded',
                fontSize: '11px',
                color: '#4b5563',
                letterSpacing: '2px',
                marginBottom: '32px'
              }}>FERRARI · #44</div>

              {[
                { label: 'World Titles', value: '7' },
                { label: 'Race Wins', value: '105' },
                { label: 'Pole Positions', value: '104' },
                { label: 'Podiums', value: '201' },
                { label: 'Points', value: '4,639' },
              ].map((stat, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.04)'
                }}>
                  <span style={{
                    fontFamily: 'var(--mono)',
                    fontSize: '11px',
                    color: '#4b5563',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>{stat.label}</span>
                  <span style={{
                    fontFamily: 'var(--font)',
                    fontSize: '16px',
                    fontWeight: 900,
                    color: '#fff'
                  }}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <a href="/h2h" style={{
              fontFamily: 'var(--font)',
              fontSize: '11px',
              fontWeight: 900,
              color: '#ffffffff',
              textTransform: 'uppercase',
              letterSpacing: '3px',
              textDecoration: 'none',
            }}>Compare any two drivers across 76 seasons →</a>
          </div>
        </section>

        <section style={{ padding: '10px 0', overflow: 'hidden' }}>

          <div style={{ padding: '0 40px', marginBottom: '32px' }}>
            <span style={{
              fontFamily: 'var(--font)',
              fontSize: '11px',
              fontWeight: 900,
              color: '#E4002B',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              borderLeft: '2px solid #E4002B',
              paddingLeft: '12px'
            }}>2025 CALENDAR</span>
          </div>

          {/* Fade edges */}
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '120px',
              background: 'linear-gradient(90deg, #050505, transparent)',
              zIndex: 2,
              pointerEvents: 'none'
            }} />
            <div style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: '120px',
              background: 'linear-gradient(270deg, #050505, transparent)',
              zIndex: 2,
              pointerEvents: 'none'
            }} />

            <div style={{ overflow: 'hidden', width: '100%' }}></div>
            <div style={{
              display: 'flex',
              gap: '12px',
              width: 'max-content',
              animation: 'carouselScroll 80s linear infinite',
            }}>
              {/* Duplicate the array for seamless loop */}
              {[...Array(2)].flatMap(() => [
                { round: 'R01', name: 'BAHRAIN', country: 'BHR', laps: 57, type: 'PERMANENT' },
                { round: 'R02', name: 'JEDDAH', country: 'KSA', laps: 50, type: 'STREET' },
                { round: 'R03', name: 'MELBOURNE', country: 'AUS', laps: 58, type: 'STREET' },
                { round: 'R04', name: 'SUZUKA', country: 'JPN', laps: 53, type: 'PERMANENT' },
                { round: 'R05', name: 'SHANGHAI', country: 'CHN', laps: 56, type: 'PERMANENT' },
                { round: 'R06', name: 'MIAMI', country: 'USA', laps: 57, type: 'STREET' },
                { round: 'R07', name: 'IMOLA', country: 'ITA', laps: 63, type: 'PERMANENT' },
                { round: 'R08', name: 'MONACO', country: 'MON', laps: 78, type: 'STREET' },
                { round: 'R09', name: 'MONTREAL', country: 'CAN', laps: 70, type: 'STREET' },
                { round: 'R10', name: 'BARCELONA', country: 'ESP', laps: 66, type: 'PERMANENT' },
                { round: 'R11', name: 'SPIELBERG', country: 'AUT', laps: 71, type: 'PERMANENT' },
                { round: 'R12', name: 'SILVERSTONE', country: 'GBR', laps: 52, type: 'PERMANENT' },
                { round: 'R13', name: 'BUDAPEST', country: 'HUN', laps: 70, type: 'PERMANENT' },
                { round: 'R14', name: 'SPA', country: 'BEL', laps: 44, type: 'PERMANENT' },
                { round: 'R15', name: 'ZANDVOORT', country: 'NLD', laps: 72, type: 'PERMANENT' },
                { round: 'R16', name: 'MONZA', country: 'ITA', laps: 53, type: 'PERMANENT' },
                { round: 'R17', name: 'BAKU', country: 'AZE', laps: 51, type: 'STREET' },
                { round: 'R18', name: 'SINGAPORE', country: 'SGP', laps: 62, type: 'STREET' },
                { round: 'R19', name: 'AUSTIN', country: 'USA', laps: 56, type: 'PERMANENT' },
                { round: 'R20', name: 'MEXICO CITY', country: 'MEX', laps: 71, type: 'PERMANENT' },
                { round: 'R21', name: 'SAO PAULO', country: 'BRA', laps: 71, type: 'PERMANENT' },
                { round: 'R22', name: 'LAS VEGAS', country: 'USA', laps: 50, type: 'STREET' },
                { round: 'R23', name: 'LUSAIL', country: 'QAT', laps: 57, type: 'PERMANENT' },
                { round: 'R24', name: 'ABU DHABI', country: 'UAE', laps: 58, type: 'PERMANENT' },
              ]).map((circuit, i) => (
                <a key={i} href="/circuit" style={{ textDecoration: 'none', flexShrink: 0 }}>
                  <div
                    style={{
                      background: '#0a0a0ada',
                      backgroundImage: `
                conic-gradient(#151515 90deg, #0a0a0a 90deg 180deg, #151515 180deg 270deg, #0a0a0a 270deg)
              `,
                      backgroundSize: '30px 30px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      padding: '24px',
                      width: '200px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#E4002B'
                      e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'
                      e.currentTarget.style.boxShadow = '0 20px 40px rgba(228,0,43,0.15)'
                      e.currentTarget.parentElement.parentElement.style.animationPlayState = 'paused'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                      e.currentTarget.style.transform = 'translateY(0) scale(1)'
                      e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)'
                      e.currentTarget.parentElement.parentElement.style.animationPlayState = 'running'
                    }}
                  >
                    {/* Subtle gloss overlay */}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%)', pointerEvents: 'none' }} />
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{
                        fontFamily: 'var(--mono)',
                        fontSize: '10px',
                        color: '#E4002B',
                        letterSpacing: '2px'
                      }}>{circuit.round}</span>
                      <span style={{
                        fontFamily: 'var(--mono)',
                        fontSize: '9px',
                        color: circuit.type === 'STREET' ? '#D4AF37' : '#4b5563',
                        letterSpacing: '1px',
                        padding: '2px 6px',
                        border: `1px solid ${circuit.type === 'STREET' ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.06)'}`,
                        borderRadius: '4px'
                      }}>{circuit.type}</span>
                    </div>

                    <div style={{
                      fontFamily: 'var(--font)',
                      fontSize: '15px',
                      fontWeight: 900,
                      color: '#fff',
                      letterSpacing: '1px',
                      lineHeight: 1.1
                    }}>{circuit.name}</div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '4px'
                    }}>
                      <span style={{
                        fontFamily: 'var(--mono)',
                        fontSize: '10px',
                        color: '#4b5563',
                        letterSpacing: '1px'
                      }}>{circuit.country}</span>
                      <span style={{
                        fontFamily: 'var(--mono)',
                        fontSize: '10px',
                        color: '#4b5563'
                      }}>{circuit.laps} laps</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        <footer style={{
          marginTop: 'auto',
          width: '100%',
          background: '#0a0a0a5d',
          borderRadius: '12px',
          padding: '40px 40px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px'
        }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                <span style={{ color: '#E4002B', fontFamily: 'var(--font)', fontWeight: 900, fontSize: '24px' }}>F1</span>
                <span style={{ color: '#fff', fontFamily: 'var(--font)', fontWeight: 900, fontSize: '24px' }}>TRACK</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['Java', 'Spring Boot', 'React', 'Open F1 API', 'Three.js', 'CSS'].map(tech => (
                  <span key={tech} style={{
                    padding: '6px 12px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#9ca3af',
                  }}>{tech}</span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap', paddingTop: '8px' }}>
              {['Standings', 'Drivers', '3D Cars', 'Circuits', 'Telemetry'].map(link => (
                <a key={link} href={`/${link.toLowerCase().replace(' ', '-')}`}
                  style={{ color: '#9ca3af', fontSize: '13px', textDecoration: 'none', fontFamily: 'var(--font)' }}>
                  {link}
                </a>
              ))}
            </div>
          </div>

          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            paddingTop: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <span style={{ color: '#555', fontSize: '13px' }}>
              © 2026 F1Track — Jihane Benzerkane
            </span>
            <a href="https://github.com/jihanebenzerkane/F1Track-performance" target="_blank" rel="noreferrer"
              style={{ color: '#E4002B', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              GitHub ↗
            </a>
          </div>
        </footer>

      </div>




    </div>
  );
}
