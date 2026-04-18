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

const BASE = 'http://localhost:8081';
const SEASONS = [];
for (let y = 2026; y >= 2000; y--) SEASONS.push(y);

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

  // Data channels
  const [lapData, setLapData] = useState([]);
  const [carTelemetry, setCarTelemetry] = useState([]);

  const [loadingLaps, setLoadingLaps] = useState(false);
  const [loadingTelemetry, setLoadingTelemetry] = useState(false);
  const [activeTab, setActiveTab] = useState('laps'); // 'laps' | 'telemetry'
  const [driversLoading, setDriversLoading] = useState(false);

  // 1. Load sessions when season changes (OpenF1)
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

  // 2. Load driver list (OpenF1 session roster; backend fills gaps via meeting_key + laps/stints)
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

  // 3. Load laps for selected session + driver
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

  // 4. Load car telemetry (OpenF1)
  const fetchTelemetry = useCallback(() => {
    if (!selectedSession || !selectedDriver) return;
    setLoadingTelemetry(true);
    setCarTelemetry([]);

    fetch(`${BASE}/api/telemetry/car_data/${selectedSession}?driverNumber=${encodeURIComponent(selectedDriver)}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const safeData = Array.isArray(data) ? data : [];
        const SAMPLE = Math.max(1, Math.floor(safeData.length / 600));
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

  return (
    <div style={{ padding: '40px 48px', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ marginBottom: '40px', borderLeft: '4px solid var(--rb-red)', paddingLeft: '24px' }}>
        <h1 style={{
          fontFamily: "var(--font)",
          fontSize: '32px',
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: '2px',
          margin: 0,
          lineHeight: 1.1,
          color: '#fff'
        }}>
          Live <span style={{ color: 'var(--rb-red)' }}>Telemetry</span> Insight
        </h1>
        <p style={{ color: 'var(--muted)', fontFamily: "var(--mono)", fontSize: '11px', letterSpacing: '1px', marginTop: '8px', maxWidth: '800px' }}>
          Real-time integration with OpenF1 API. Data is proxied through our high-performance backend.
          Analyze lap times, sector performance, and live car telemetry channels directly from the track.
        </p>
      </div>

      {/* Controls */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '30px',
        marginBottom: '40px',
        display: 'flex',
        gap: '32px',
        flexWrap: 'wrap',
        alignItems: 'flex-end',
        backdropFilter: 'blur(20px)',
      }}>
        {[
          {
            label: 'Season',
            content: (
              <select
                id="season-select"
                value={selectedSeason}
                onChange={e => setSelectedSeason(Number(e.target.value))}
                style={selectStyle}
              >
                {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            )
          },
          {
            label: 'Session',
            content: (
              <select
                id="session-select"
                value={selectedSession}
                onChange={e => setSelectedSession(e.target.value)}
                style={selectStyle}
              >
                {sessions.length > 0
                  ? sessions.map(s => (
                    <option key={s.session_key} value={s.session_key}>
                      {s.circuit_short_name ? `${s.circuit_short_name} - ` : ''}{s.session_name}
                    </option>
                  ))
                  : <option value="">No sessions found</option>}
              </select>
            )
          },
          {
            label: 'Driver',
            content: (
              <select
                id="driver-select"
                value={selectedDriver}
                onChange={e => setSelectedDriver(e.target.value)}
                style={{
                  ...selectStyle,
                  borderColor: driversLoading ? 'var(--rb-red)' : 'rgba(255,255,255,0.1)',
                  transition: 'border-color 0.3s'
                }}
              >
                {driversLoading ? (
                  <option value="">Syncing Roster…</option>
                ) : drivers.length > 0 ? (
                  drivers.map(d => {
                    const label = d.full_name || [d.first_name, d.last_name].filter(Boolean).join(' ') || d.name_acronym || d.broadcast_name || 'Driver';
                    const team = d.team_name ? ` · ${d.team_name}` : '';
                    return (
                      <option
                        key={d.driver_number}
                        value={String(d.driver_number)}
                      >
                        #{d.driver_number} {label}{team}
                      </option>
                    );
                  })
                ) : (
                  <option value="">No active drivers in roster</option>
                )}
              </select>
            )
          }
        ].map(({ label, content }) => (
          <div key={label} style={{ flex: '1', minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '10px', color: 'var(--muted)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px', fontFamily: "var(--mono)", fontWeight: 600 }}>
              {label}
            </label>
            {content}
          </div>
        ))}
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px' }}>
        {[
          { id: 'laps', label: 'Lap Time Analysis' },
          { id: 'telemetry', label: 'Car Telemetry Channels' },
        ].map(tab => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 24px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              fontFamily: "var(--mono)",
              fontSize: '11px',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              fontWeight: 700,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              background: activeTab === tab.id ? 'var(--rb-red)' : 'rgba(255,255,255,0.05)',
              color: activeTab === tab.id ? '#fff' : 'var(--muted)',
              boxShadow: activeTab === tab.id ? '0 4px 20px rgba(228, 0, 43, 0.3)' : 'none',
            }}
          >
            {tab.label}
          </button>
        ))}
        {activeTab === 'telemetry' && carTelemetry.length === 0 && !loadingTelemetry && selectedSession && selectedDriver && (
          <button
            id="load-telemetry-btn"
            onClick={fetchTelemetry}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '1px solid rgba(228, 0, 43, 0.5)',
              cursor: 'pointer',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              fontWeight: 700,
              background: 'transparent',
              color: '#E4002B',
              marginLeft: '8px',
            }}
          >
            ↻ Load Channels
          </button>
        )}
      </div>

      {/* ── LAP TIMES TAB ── */}
      {activeTab === 'laps' && (
        <>
          {loadingLaps ? (
            <Spinner label="Fetching lap data from OpenF1…" />
          ) : (() => {
            const currentSession = sessions.find(s => String(s.session_key) === String(selectedSession));
            if (currentSession?.isFuture) {
              return (
                <EmptyState
                  message={(
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '10px', color: '#E4002B', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px' }}>Upcoming Session</span>
                      <div style={{ fontSize: '20px', color: '#fff' }}>{currentSession.circuit_short_name} - {currentSession.session_name}</div>
                      <div style={{ color: 'var(--muted)', fontSize: '12px' }}>
                        Scheduled for: {new Date(currentSession.date_start || currentSession.date).toLocaleString()}
                      </div>
                      <div style={{ marginTop: '16px', fontSize: '11px', color: '#4b5563' }}>Telemetry data will be available once the session starts.</div>
                    </div>
                  )}
                />
              );
            }
            if (lapData.length === 0) {
              return <EmptyState message={selectedSession && selectedDriver ? 'No lap data found for this driver in this session.' : 'Select a session and driver to begin.'} />;
            }
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={CHART_STYLE}>
                  <div style={{ ...LABEL_STYLE, display: 'flex', justifyContent: 'space-between' }}>
                    <span>Lap Time Consistency</span>
                    <span style={{ fontSize: '9px', color: 'var(--rb-red)', opacity: 0.8 }}>LIVE TELEMETRY</span>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={lapData} margin={{ top: 4, right: 20, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--rb-red)" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="var(--rb-red)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="lap" {...axisProps} label={{ value: 'LAP', position: 'insideRight', offset: -4, fill: 'var(--muted)', fontSize: 10, fontFamily: "var(--mono)" }} />
                      <YAxis {...axisProps} domain={['dataMin - 0.5', 'dataMax + 0.5']} />
                      <Tooltip {...tooltipStyle} formatter={v => [`${v}s`, 'Time']} />
                      <Area connectNulls={true} type="monotone" dataKey="duration" stroke="var(--rb-red)" strokeWidth={3} fill="url(#goldGrad)" dot={false} activeDot={{ r: 6, fill: 'var(--rb-red)', stroke: '#fff', strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Sector Breakdown */}
                {lapData.some(l => l.s1) && (
                  <div style={CHART_STYLE}>
                    <p style={LABEL_STYLE}>Sector Times (s)</p>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={lapData} margin={{ top: 4, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                        <XAxis dataKey="lap" {...axisProps} />
                        <YAxis {...axisProps} domain={['dataMin - 0.2', 'dataMax + 0.2']} />
                        <Tooltip {...tooltipStyle} />
                        <Line connectNulls={true} type="monotone" dataKey="s1" stroke="var(--rb-red)" strokeWidth={1.5} dot={false} name="Sector 1" />
                        <Line connectNulls={true} type="monotone" dataKey="s2" stroke="#3B82F6" strokeWidth={1.5} dot={false} name="Sector 2" />
                        <Line connectNulls={true} type="monotone" dataKey="s3" stroke="#10B981" strokeWidth={1.5} dot={false} name="Sector 3" />
                      </LineChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', gap: '24px', marginTop: '20px', justifyContent: 'center' }}>
                      {[['S1', 'var(--rb-red)'], ['S2', '#3B82F6'], ['S3', '#10B981']].map(([label, color]) => (
                        <span key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "var(--mono)", fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>
                          <span style={{ width: 12, height: 12, borderRadius: 2, background: color, display: 'inline-block' }} />
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '8px' }}>
                  {(() => {
                    const withDur = lapData.filter(l => l.duration != null && l.duration > 0);
                    const withPos = lapData.filter(l => l.position > 0);
                    return [
                      withDur.length > 0
                        ? { label: 'Best (shortest time)', value: `${Math.min(...withDur.map(l => l.duration)).toFixed(3)}s` }
                        : { label: 'Best lap', value: withPos.length ? `P${Math.min(...withPos.map(l => l.position))}` : '—' },
                      withDur.length > 0
                        ? { label: 'Slowest time', value: `${Math.max(...withDur.map(l => l.duration)).toFixed(3)}s` }
                        : { label: 'Worst lap', value: withPos.length ? `P${Math.max(...withPos.map(l => l.position))}` : '—' },
                      { label: 'Laps Completed', value: lapData.length },
                    ];
                  })().map(stat => (
                    <div key={stat.label} style={{ ...CHART_STYLE, marginBottom: 0, textAlign: 'center', padding: '30px', flex: 1 }}>
                      <div style={{ fontFamily: "var(--font)", fontSize: '32px', fontWeight: 900, color: 'var(--rb-red)', letterSpacing: '-1px' }}>{stat.value}</div>
                      <div style={{ ...LABEL_STYLE, marginBottom: 0, marginTop: '8px', fontSize: '10px' }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </>
      )}

      {/* ── CAR TELEMETRY TAB ── */}
      {activeTab === 'telemetry' && (
        <>
          {loadingTelemetry ? (
            <Spinner label="Streaming car telemetry from OpenF1…" />
          ) : null}
          {!loadingTelemetry && carTelemetry.length > 0 ? (
            <>
              {/* Speed */}
              <TelemetryChart
                data={carTelemetry}
                dataKey="speed"
                label="Speed (km/h)"
                color="#E4002B"
                gradientId="speedGrad"
                unit=" km/h"
                chartType="area"
              />
              {/* RPM */}
              <TelemetryChart
                data={carTelemetry}
                dataKey="rpm"
                label="Engine RPM"
                color="#E4002B"
                gradientId="rpmGrad"
                unit=" RPM"
                chartType="area"
              />
              {/* Gear */}
              <TelemetryChart
                data={carTelemetry}
                dataKey="gear"
                label="Gear"
                color="#3B82F6"
                gradientId="gearGrad"
                unit=""
                chartType="bar"
              />
              {/* Throttle / Brake */}
              <div style={CHART_STYLE}>
                <p style={LABEL_STYLE}>Throttle (%) & Brake (%)</p>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={carTelemetry} margin={{ top: 4, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="t" hide />
                    <YAxis {...axisProps} domain={[0, 100]} />
                    <Tooltip {...tooltipStyle} formatter={(v, name) => [`${v}%`, name === 'throttle' ? 'Throttle' : 'Brake']} />
                    <Line type="monotone" dataKey="throttle" stroke="#10B981" strokeWidth={1.2} dot={false} name="throttle" />
                    <Line type="monotone" dataKey="brake" stroke="#F97316" strokeWidth={1.2} dot={false} name="brake" />
                  </LineChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                  {[['Throttle', '#10B981'], ['Brake', '#F97316']].map(([label, color]) => (
                    <span key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#6b7280' }}>
                      <span style={{ width: 16, height: 2, background: color, display: 'inline-block', borderRadius: 1 }} />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </>
          ) : null}
          {!loadingTelemetry && carTelemetry.length === 0 ? (
            <EmptyState message={
              !selectedSession || !selectedDriver
                ? 'Select a session and driver to load telemetry.'
                : 'Click "↻ Load Channels" to stream car data from OpenF1.'
            } />
          ) : null}
        </>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TelemetryChart({ data, dataKey, label, color, gradientId, unit, chartType }) {
  return (
    <div style={CHART_STYLE}>
      <p style={LABEL_STYLE}>{label}</p>
      <ResponsiveContainer width="100%" height={160}>
        {chartType === 'bar' ? (
          <BarChart data={data} margin={{ top: 2, right: 20, left: 0, bottom: 0 }} barSize={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="t" hide />
            <YAxis {...axisProps} domain={[0, 8]} ticks={[1, 2, 3, 4, 5, 6, 7, 8]} />
            <Tooltip {...tooltipStyle} formatter={v => [`${v}`, label]} />
            <Bar dataKey={dataKey} fill={color} radius={[1, 1, 0, 0]}>
              {data.map((entry, idx) => (
                <Cell key={idx} fill={`hsl(${210 + entry[dataKey] * 14}, 80%, 60%)`} />
              ))}
            </Bar>
          </BarChart>
        ) : (
          <AreaChart data={data} margin={{ top: 2, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="t" hide />
            <YAxis {...axisProps} />
            <Tooltip {...tooltipStyle} formatter={v => [`${v}${unit}`, label]} />
            <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={1.5} fill={`url(#${gradientId})`} dot={false} />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

function Spinner({ label }) {
  return (
    <div style={{ textAlign: 'center', padding: '100px 20px', background: 'rgba(255,255,255,0.01)', borderRadius: '20px', border: '1px solid var(--border)' }}>
      <div style={{
        width: 48, height: 48, border: '4px solid rgba(255,255,255,0.05)',
        borderTopColor: 'var(--rb-red)', borderRadius: '50%',
        animation: 'spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite', margin: '0 auto 24px',
        boxShadow: '0 0 20px rgba(228, 0, 43, 0.2)',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: 'var(--muted)', fontFamily: "var(--mono)", fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>{label}</p>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '100px 20px',
      background: 'rgba(255,255,255,0.01)',
      borderRadius: '20px',
      border: '1px solid var(--border)',
      color: 'var(--muted)',
      fontFamily: "var(--mono)",
      fontSize: '13px',
      letterSpacing: '1px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px'
    }}>
      <div style={{ fontSize: '24px', opacity: 0.5 }}>📊</div>
      {message}
    </div>
  );
}

const selectStyle = {
  background: 'rgba(10, 10, 14, 0.8)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#f4f5f8',
  padding: '12px 18px',
  borderRadius: '10px',
  fontFamily: "var(--mono)",
  fontSize: '13px',
  outline: 'none',
  cursor: 'pointer',
  width: '100%',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 16px center',
  backgroundSize: '16px',
  transition: 'all 0.2s ease',
};
