const BASE = 'http://localhost:8081';

// Standings
export const getStandings = (year, mode = 'real') =>
  fetch(`${BASE}/api/standings/${year}?mode=${mode}`).then(r => r.json());

export const getConstructorStandings = (year, mode = 'real') =>
  fetch(`${BASE}/api/standings/${year}/constructors?mode=${mode}`).then(r => r.json());

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

export const getPitStrategy = (driverId, circuitId) =>
  fetch(`${BASE}/api/predictions/pitstop/${driverId}/${circuitId}`).then(r => r.json());

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
