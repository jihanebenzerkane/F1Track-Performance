import React, { useState, useEffect, useCallback } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

const BASE = ' ';
const SEASONS = [];
for (let y = 2026; y >= 2023; y--) SEASONS.push(y);

const CHART_STYLE = {
  background: 'rgba(255,255,255,0.02)',
  backdropFilter: 'blur(40px)',
  border: '1px solid var(--border)',
  borderRadius: '20px',
  padding: '30px',
  marginBottom: '24px',
  transition: 'transform 0.3s ease',
};

const LABEL_STYLE = {
  fontFamily: "var(--mono)",
  fontSize: '11px',
  color: 'var(--muted)',
  letterSpacing: '2px',
  textTransform: 'uppercase',
  marginBottom: '18px',
  fontWeight: 600,
};

const tooltipStyle = {
  contentStyle: {
    background: 'rgba(5, 5, 5, 0.95)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    fontFamily: "var(--mono)",
    fontSize: '12px',
    backdropFilter: 'blur(10px)',
  },
  itemStyle: { color: '#fff' },
  labelStyle: { color: 'var(--muted)', fontSize: '10px', marginBottom: '4px' },
};

const axisProps = {
  tick: { fill: 'var(--muted)', fontFamily: "var(--mono)", fontSize: 10 },
  axisLine: false,
  tickLine: false,
};

export default function TelemetryPage() {
  const [selectedSeason, setSelectedSeason] = useState(2026);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [hoverIndex, setHoverIndex] = useState(null);

  // Data channels
  const [lapData, setLapData] = useState([]);
  const [carTelemetry, setCarTelemetry] = useState([]);

  const [loadingLaps, setLoadingLaps] = useState(false);
  const [loadingTelemetry, setLoadingTelemetry] = useState(false);
  const [activeTab, setActiveTab] = useState('laps'); // 'laps' | 'telemetry'
  const [driversLoading, setDriversLoading] = useState(false);

  const [diagnostics, setDiagnostics] = useState({ latency: 0, throughput: 0, engine: 'V3.2.1-STABLE' });
  useEffect(() => {
    const timer = setInterval(() => {
      setDiagnostics({
        latency: 40 + Math.floor(Math.random() * 15),
        throughput: (1.2 + Math.random() * 0.4).toFixed(2),
        engine: 'V3.2.1-STABLE'
      });
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setSessions([]);
    setSelectedSession('');
    setDrivers([]);
    setSelectedDriver('');
    setLapData([]);
    setCarTelemetry([]);

    fetch(`${BASE}/api/telemetry/sessions/${selectedSeason}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const arr = Array.isArray(data) ? data : [];
        setSessions(arr);
        if (arr.length === 0) return;
        return fetch(`${BASE}/api/telemetry/sessions/${selectedSeason}/default-session-key`)
          .then(r => (r.ok ? r.json() : {}))
          .then(def => {
            const key = def && def.session_key ? String(def.session_key) : '';
            if (key && arr.some(s => String(s.session_key) === key)) {
              setSelectedSession(key);
            } else {
              setSelectedSession(String(arr[0].session_key));
            }
          })
          .catch(() => setSelectedSession(String(arr[0].session_key)));
      })
      .catch(() => { });
  }, [selectedSeason]);

  useEffect(() => {
    if (!selectedSession) return;
    setDrivers([]);
    setSelectedDriver('');
    setLapData([]);
    setCarTelemetry([]);
    setDriversLoading(true);

    fetch(`${BASE}/api/telemetry/drivers?session_key=${encodeURIComponent(selectedSession)}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const driverList = (Array.isArray(data) ? data : [])
          .filter(d => d.driver_number != null && d.driver_number !== '')
          .sort((a, b) => Number(a.driver_number) - Number(b.driver_number));
        setDrivers(driverList);
        if (driverList.length > 0) {
          const pref = driverList.find(d => Number(d.driver_number) === 1 || Number(d.driver_number) === 44) || driverList[0];
          setSelectedDriver(String(pref.driver_number));
        }
      })
      .catch(err => {
        console.error("Failed to fetch drivers:", err);
        setDrivers([]);
      })
      .finally(() => setDriversLoading(false));
  }, [selectedSession]);

  useEffect(() => {
    if (!selectedSession || !selectedDriver) return;
    setLoadingLaps(true);
    setLapData([]);

    fetch(`${BASE}/api/telemetry/laps/${selectedSession}?driverNumber=${encodeURIComponent(selectedDriver)}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const clean = (Array.isArray(data) ? data : [])
          .filter(l => l.lap_duration && l.lap_duration < 300 && l.lap_duration > 0)
          .map(l => ({
            lap: l.lap_number,
            duration: parseFloat(l.lap_duration?.toFixed(3)),
            s1: l.duration_sector_1 && l.duration_sector_1 < 100 ? parseFloat(l.duration_sector_1.toFixed(3)) : null,
            s2: l.duration_sector_2 && l.duration_sector_2 < 100 ? parseFloat(l.duration_sector_2.toFixed(3)) : null,
            s3: l.duration_sector_3 && l.duration_sector_3 < 100 ? parseFloat(l.duration_sector_3.toFixed(3)) : null,
          }));
        setLapData(clean);
        setLoadingLaps(false);
      })
      .catch(() => setLoadingLaps(false));
  }, [selectedSession, selectedDriver]);

  const fetchTelemetry = useCallback(() => {
    if (!selectedSession || !selectedDriver) return;
    setLoadingTelemetry(true);
    setCarTelemetry([]);

    fetch(`${BASE}/api/telemetry/car_data/${selectedSession}?driverNumber=${encodeURIComponent(selectedDriver)}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const safeData = Array.isArray(data) ? data : [];
        const SAMPLE = Math.max(1, Math.floor(safeData.length / 800));
        const sampled = safeData
          .filter((_, i) => i % SAMPLE === 0)
          .map((d, i) => ({
            t: i,
            speed: d.speed ?? null,
            rpm: d.rpm ?? null,
            gear: d.n_gear ?? d.gear ?? null,
            throttle: d.throttle ?? null,
            brake: d.brake ? 100 : 0,
            drs: d.drs ?? null,
          }));
        setCarTelemetry(sampled);
        setLoadingTelemetry(false);
      })
      .catch(() => setLoadingTelemetry(false));
  }, [selectedSession, selectedDriver]);

  useEffect(() => {
    if (activeTab !== 'telemetry' || !selectedSession || !selectedDriver) return;
    if (carTelemetry.length === 0) fetchTelemetry();
  }, [activeTab, selectedSession, selectedDriver, fetchTelemetry, carTelemetry.length]);

  const activeTelemetryPoint = hoverIndex !== null ? carTelemetry[hoverIndex] : (carTelemetry[0] || null);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px', minHeight: '100vh' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', borderBottom: '1px solid var(--border)', paddingBottom: '32px' }}>
        <div style={{ paddingLeft: '24px' }}>
          <h1 style={{
            fontFamily: "var(--font)", fontSize: '32px', fontWeight: 900,
            textTransform: 'uppercase', letterSpacing: '2px', margin: 0, color: '#fff'
          }}>
            Telemetry <span style={{ color: 'var(--rb-red)' }}>Cockpit</span>
          </h1>
          <p style={{ color: 'var(--muted)', fontFamily: "var(--mono)", fontSize: '10px', letterSpacing: '1px', marginTop: '4px' }}>
            SIMULATED DATA STREAM
          </p>
        </div>

        <div style={{ display: 'flex', gap: '32px', background: 'rgba(255,255,255,0.02)', padding: '12px 24px', borderRadius: '12px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 900, color: '#fff', fontFamily: "var(--mono)" }}>{diagnostics.latency}ms</div>
            <div style={{ fontSize: '8px', color: 'var(--muted)', textTransform: 'uppercase' }}>Lat</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 900, color: '#fff', fontFamily: "var(--mono)" }}>{diagnostics.throughput}MB/s</div>
            <div style={{ fontSize: '8px', color: 'var(--muted)', textTransform: 'uppercase' }}>Flow</div>
          </div>
        </div>
      </div>

      <div style={{
        background: '#0a0a0a',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={{
              display: 'block', fontSize: '10px', color: '#4b5563',
              letterSpacing: '2px', textTransform: 'uppercase',
              marginBottom: '8px', fontFamily: 'var(--font)'
            }}>Season</label>
            <select
              value={selectedSeason}
              onChange={e => setSelectedSeason(Number(e.target.value))}
              style={{
                background: '#141414', border: '1px solid rgba(255,255,255,0.07)',
                color: '#f4f5f8', padding: '10px 14px', borderRadius: '8px',
                fontFamily: 'var(--font)', fontSize: '13px', cursor: 'pointer', outline: 'none'
              }}
            >
              {SEASONS.map(s => <option key={s} value={s}>{s} Season</option>)}
            </select>
          </div>

          <div>
            <label style={{
              display: 'block', fontSize: '10px', color: '#4b5563',
              letterSpacing: '2px', textTransform: 'uppercase',
              marginBottom: '8px', fontFamily: 'var(--font)'
            }}>Event</label>
            <select
              value={selectedSession}
              onChange={e => setSelectedSession(e.target.value)}
              style={{
                background: '#141414', border: '1px solid rgba(255,255,255,0.07)',
                color: '#f4f5f8', padding: '10px 14px', borderRadius: '8px',
                fontFamily: 'var(--font)', fontSize: '13px', cursor: 'pointer',
                minWidth: '200px', outline: 'none'
              }}
            >
              <option value="">Select Session</option>
              {sessions.map(s => (
                <option key={s.session_key} value={s.session_key}>
                  {s.circuit_short_name || 'Circuit'} - {s.session_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{
              display: 'block', fontSize: '10px', color: '#4b5563',
              letterSpacing: '2px', textTransform: 'uppercase',
              marginBottom: '8px', fontFamily: 'var(--font)'
            }}>Driver</label>
            <select
              value={selectedDriver}
              onChange={e => setSelectedDriver(e.target.value)}
              style={{
                background: '#141414', border: '1px solid rgba(255,255,255,0.07)',
                color: '#f4f5f8', padding: '10px 14px', borderRadius: '8px',
                fontFamily: 'var(--font)', fontSize: '13px', cursor: 'pointer',
                minWidth: '200px', outline: 'none'
              }}
            >
              <option value="">Select Driver</option>
              {drivers.map(d => (
                <option key={d.driver_number} value={String(d.driver_number)}>
                  #{d.driver_number} {d.name_acronym || 'DRV'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div style={{
        background: '#0a0a0a', border: '1px solid var(--border)', borderRadius: '24px', padding: '40px',
        boxShadow: '0 30px 60px rgba(0,0,0,0.6)', marginBottom: '48px', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '20px 20px', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '40px', alignItems: 'center' }}>

          {/* Throttle/Brake */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr', gap: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ height: '80px', width: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', margin: '0 auto 12px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', bottom: 0, width: '100%', height: `${activeTelemetryPoint?.throttle || 0}%`, background: '#00d48a', transition: 'height 0.1s' }} />
              </div>
              <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: "var(--mono)" }}>THR</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ height: '80px', width: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', margin: '0 auto 12px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', bottom: 0, width: '100%', height: `${activeTelemetryPoint?.brake || 0}%`, background: '#ff4b4b', transition: 'height 0.1s' }} />
              </div>
              <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: "var(--mono)" }}>BRK</div>
            </div>
          </div>

          {/* Core Speed/Gear */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '120px', height: '120px', border: '4px solid #141414', borderRadius: '50%',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)'
            }}>
              <div style={{ fontSize: '42px', fontWeight: 900, color: '#fff', fontFamily: "var(--mono)", lineHeight: 1.2 }}>
                {activeTelemetryPoint?.speed || '0'}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--rb-red)', fontWeight: 900, letterSpacing: '2px' }}>KM/H</div>
            </div>
            <div style={{
              marginTop: '16px', fontSize: '24px', fontWeight: 900, color: '#fff', fontFamily: "var(--mono)",
              background: 'rgba(255,255,255,0.05)', padding: '4px 20px', borderRadius: '8px', display: 'inline-block'
            }}>
              GEAR {activeTelemetryPoint?.gear || 'N'}
            </div>
          </div>

          {/* RPM & DRS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--muted)', marginBottom: '8px', fontFamily: "var(--mono)" }}>
                <span>RPM</span>
                <span style={{ color: '#fff' }}>{(activeTelemetryPoint?.rpm || 0).toLocaleString()}</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(100, (activeTelemetryPoint?.rpm || 0) / 15000 * 100)}%`,
                  background: (activeTelemetryPoint?.rpm || 0) > 11500 ? 'var(--rb-red)' : '#3B82F6',
                  transition: 'width 0.1s'
                }} />
              </div>
            </div>
            <div style={{
              background: activeTelemetryPoint?.drs === 1 ? '#00d48a' : 'rgba(255,255,255,0.03)',
              color: activeTelemetryPoint?.drs === 1 ? '#000' : 'rgba(255,255,255,0.2)',
              fontSize: '10px', fontWeight: 900, textAlign: 'center', padding: '8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)'
            }}>
              DRS {activeTelemetryPoint?.drs === 1 ? 'AVAILABLE' : 'CLOSED'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', gap: '4px', marginBottom: '32px', justifyContent: 'center' }}>
          {[{ id: 'laps', label: 'Consistency Matrix' }, { id: 'telemetry', label: 'Car Telemetry Channels' }].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '14px 28px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
                fontFamily: "var(--mono)", fontSize: '11px', fontWeight: 700,
                background: activeTab === tab.id ? '#fff' : 'transparent',
                color: activeTab === tab.id ? '#000' : 'var(--muted)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                textTransform: 'uppercase', letterSpacing: '1px'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'laps' && (
          <div className="animate-fade-up">
            {loadingLaps ? <Spinner label="Reconstructing lap stream..." /> : (
              <div style={{ ...CHART_STYLE, padding: '40px' }}>
                <p style={LABEL_STYLE}>Lap Consistency Map</p>
                <ResponsiveContainer width="100%" height={340}>
                  <AreaChart data={lapData} syncId="f1_telemetry" onMouseMove={e => e.activeTooltipIndex !== undefined && setHoverIndex(e.activeTooltipIndex)}>
                    <defs>
                      <linearGradient id="lapGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--rb-red)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="var(--rb-red)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="lap" {...axisProps} />
                    <YAxis {...axisProps} />
                    <Tooltip {...tooltipStyle} />
                    <Area type="monotone" dataKey="duration" stroke="var(--rb-red)" fill="url(#lapGrad)" strokeWidth={3} activeDot={{ r: 8, strokeWidth: 0, fill: '#fff' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {activeTab === 'telemetry' && (
          <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {loadingTelemetry ? <Spinner label="Streaming telemetry packets..." /> : (
              carTelemetry.length > 0 ? (
                <>
                  <TelemetryChart data={carTelemetry} dataKey="speed" label="VELOCITY CHANNEL (KM/H)" color="#E4002B" unit="km/h" syncId="f1_telemetry" onHover={setHoverIndex} />
                  <TelemetryChart data={carTelemetry} dataKey="rpm" label="ENGINE RPM (X1000)" color="#3B82F6" unit="" syncId="f1_telemetry" onHover={setHoverIndex} />
                  <TelemetryChart data={carTelemetry} dataKey="throttle" label="THROTTLE & BRAKE INPUT MATRIX" color="#10B981" unit="%" syncId="f1_telemetry" onHover={setHoverIndex} secDataKey="brake" secColor="#ff4b4b" />
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '100px', color: 'var(--muted)', fontFamily: "var(--mono)", fontSize: '12px' }}>
                  No telemetry stream detected for this session/driver sequence.
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TelemetryChart({ data, dataKey, label, color, unit, syncId, onHover, secDataKey, secColor }) {
  return (
    <div style={{ ...CHART_STYLE, padding: '24px' }}>
      <div style={{ ...LABEL_STYLE, fontSize: '10px', marginBottom: '16px' }}>{label}</div>
      <ResponsiveContainer width="100%" height={120}>
        <AreaChart data={data} syncId={syncId} onMouseMove={e => e.activeTooltipIndex !== undefined && onHover(e.activeTooltipIndex)} margin={{ left: -30 }}>
          <defs>
            <linearGradient id={`grad_${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.2} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
            {secDataKey && (
              <linearGradient id={`grad_${secDataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={secColor} stopOpacity={0.2} />
                <stop offset="95%" stopColor={secColor} stopOpacity={0} />
              </linearGradient>
            )}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
          <XAxis dataKey="t" hide />
          <YAxis {...axisProps} />
          <Tooltip {...tooltipStyle} formatter={v => [`${v}${unit}`, label]} />
          <Area type="monotone" dataKey={dataKey} stroke={color} fill={`url(#grad_${dataKey})`} strokeWidth={1.5} dot={false} isAnimationActive={false} />
          {secDataKey && <Area type="monotone" dataKey={secDataKey} stroke={secColor} fill={`url(#grad_${secDataKey})`} strokeWidth={1.5} dot={false} isAnimationActive={false} />}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function Spinner({ label }) {
  return (
    <div style={{ textAlign: 'center', padding: '100px 20px', borderRadius: '20px', border: '1px solid var(--border)' }}>
      <div style={{
        width: 40, height: 40, border: '3px solid rgba(255,255,255,0.05)',
        borderTopColor: 'var(--rb-red)', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite', margin: '0 auto 20px',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: 'var(--muted)', fontFamily: "var(--mono)", fontSize: '11px', textTransform: 'uppercase' }}>{label}</p>
    </div>
  );
}


