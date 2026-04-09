const BASE = 'http://localhost:8081';

// Standings
export const getStandings = (year) =>
  fetch(`${BASE}/api/standings/${year}`).then(r => r.json());

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

// Driver images — using official F1 driver numbers mapped to images
export const getDriverImageUrl = (driverId) => {
  const images = {
    'max-verstappen': 'https://www.formula1.com/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png',
    'lewis-hamilton': 'https://www.formula1.com/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png',
    'charles-leclerc': 'https://www.formula1.com/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png',
    'lando-norris': 'https://www.formula1.com/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png',
    'carlos-sainz-jr': 'https://www.formula1.com/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png',
    'george-russell': 'https://www.formula1.com/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/georus01.png',
    'oscar-piastri': 'https://www.formula1.com/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png',
    'fernando-alonso': 'https://www.formula1.com/content/dam/fom-website/drivers/F/FERALO01_Fernando_Alonso/feralo01.png',
    'lance-stroll': 'https://www.formula1.com/content/dam/fom-website/drivers/L/LANSTR01_Lance_Stroll/lanstr01.png',
    'sergio-perez': 'https://www.formula1.com/content/dam/fom-website/drivers/S/SERPER01_Sergio_Perez/serper01.png',
  };
  return images[driverId] || null;
};

// Team colors
export const getTeamColor = (team) => {
  const colors = {
    'Red Bull': '#3671C6',
    'Ferrari': '#E8002D',
    'McLaren': '#FF8000',
    'Mercedes': '#27F4D2',
    'Aston Martin': '#229971',
    'Alpine': '#0093CC',
    'Williams': '#64C4FF',
    'Racing Bulls': '#6692FF',
    'Haas': '#B6BABD',
    'Audi': '#C8C8C8',
    'Kick Sauber': '#52E252',
    'Cadillac': '#333333',
  };
  return colors[team] || '#ffffff';
};