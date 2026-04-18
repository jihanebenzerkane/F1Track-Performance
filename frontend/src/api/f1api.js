const BASE = 'http://localhost:8081';

// Safety Wrapper for Standings
export async function safeGetStandings(season) {
  try {
    const res = await fetch(`${BASE}/api/standings/${season}`)
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch (err) {
    console.warn("Standings fetch failed:", err)
    return []
  }
}

export async function safeGetConstructorStandings(season) {
  try {
    const res = await fetch(`${BASE}/api/standings/${season}/constructors`)
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch (err) {
    console.warn("Constructor standings fetch failed:", err)
    return []
  }
}

// Standings
export const getStandings = (year, mode = 'real') =>
  fetch(`${BASE}/api/standings/${year}?mode=${mode}`).then(r => r.json());
//race Standings
export const getRaceResults = (raceId) => 
  fetch(`${BASE}/api/analysis/race/${raceId}/results`).then(r => r.json());

export const getConstructorStandings = (year, mode = 'real') =>
  fetch(`${BASE}/api/standings/${year}/constructors?mode=${mode}`).then(r => r.json());

export const getRacesBySeason = (year) =>
  fetch(`${BASE}/api/races/season/${year}`).then(r => r.json());

export const getLeaderInfo = (year) =>
  fetch(`${BASE}/api/leader/${year}`).then(r => r.json());

// Driver analysis
export const getDriverPerformance = (driverId, year) =>
  fetch(`${BASE}/api/analysis/driver/${driverId}/${year}`).then(r => r.json());

// Driver form
export const getDriverForm = (driverId) =>
  fetch(`${BASE}/api/predictions/form/${driverId}`).then(r => r.json());

// Predictions
export const getRacePredictions = (circuitId) =>
  fetch(`${BASE}/api/predictions/race/${circuitId}`).then(r => r.json());

export const getPitStrategy = (circuitKey, driverNumber) =>
  fetch(`${BASE}/api/telemetry/pit-strategy/${circuitKey}?driverNumber=${driverNumber}`)
    .then(res => res.json());

/** Pit strategy from local f1db.db (driver slug e.g. max-verstappen). */
export const getDbPitStrategy = (circuitId, driverId) =>
  fetch(`${BASE}/api/telemetry/db/pit-strategy/${encodeURIComponent(circuitId)}?driverId=${encodeURIComponent(driverId)}`)
    .then(res => res.json());

export const getDbTelemetrySessions = (year) =>
  fetch(`${BASE}/api/telemetry/db/sessions/${year}`).then(r => r.json());

export const getDbSeasonLaps = (year, driverId) =>
  fetch(`${BASE}/api/telemetry/db/season/${year}/laps?driverId=${encodeURIComponent(driverId)}`)
    .then(r => r.json());

export const getDbRaceSummary = (raceId, driverId) =>
  fetch(`${BASE}/api/telemetry/db/race/${raceId}/summary?driverId=${encodeURIComponent(driverId)}`)
    .then(r => r.json());


// Analysis
export const getH2H = (d1, d2, year) =>
  fetch(`${BASE}/api/analysis/h2h/${d1}/${d2}/${year}`).then(r => r.json());

export const getCircuitHistory = (circuitId) =>
  fetch(`${BASE}/api/analysis/circuit/${circuitId}/history`).then(r => r.json());

export const getConstructorPerformance = (constructorId, year) =>
  fetch(`${BASE}/api/analysis/constructor/${constructorId}/${year}`).then(r => r.json());

export const getRaceQualifying = (raceId) =>
  fetch(`${BASE}/api/analysis/race/${raceId}/qualifying`).then(r => r.json());

export const getRacePitStops = (raceId) =>
  fetch(`${BASE}/api/analysis/race/${raceId}/pitstops`).then(r => r.json());

export const getSeasonAwards = (year) => getLeaderInfo(year);

// Circuits
export const getCircuits = () =>
  fetch(`${BASE}/api/races/circuits`).then(r => r.json());

