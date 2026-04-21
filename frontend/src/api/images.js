const FLAGS = {
  netherlands: 'NL',
  british: 'GB',
  monegasque: 'MC',
  australian: 'AU',
  spanish: 'ES',
  mexican: 'MX',
  french: 'FR',
  canadian: 'CA',
  german: 'DE',
  japanese: 'JP',
  thai: 'TH',
  chinese: 'CN',
  american: 'US',
  italian: 'IT',
  finnish: 'FI',
  brazilian: 'BR',
  danish: 'DK',
}

export const getFlag = (nationality) => {
  if (!nationality) return '🏁'
  const key = nationality.toLowerCase().trim()
  const code = FLAGS[key]
  return code ? String.fromCodePoint(...[...code].map(c => 127397 + c.charCodeAt())) : '🏁'
}

export const getNatCode = (nationality) => {
  if (!nationality) return '---';
  const mapping = {
    'netherlands': 'NED',
    'united-kingdom': 'GBR',
    'monaco': 'MON',
    'australia': 'AUS',
    'spain': 'ESP',
    'mexico': 'MEX',
    'france': 'FRA',
    'canada': 'CAN',
    'germany': 'GER',
    'japan': 'JPN',
    'thailand': 'THA',
    'china': 'CHN',
    'united-states-of-america': 'USA',
    'italy': 'ITA',
    'finland': 'FIN',
    'brazil': 'BRA',
    'denmark': 'DEN',
    'new-zealand': 'NZL'
  }
  return mapping[nationality.toLowerCase().trim()] || nationality.substring(0, 3).toUpperCase();
}

export const getTeamColor = (team) => {
  const colors = {
    'Red Bull': '#D4AF37',
    'Ferrari': '#C5A059',
    'Mercedes': '#A3A3A3',
    'Aston Martin': '#006F62', // Keeping some unique Identifiers is okay, but subtle
    'Alpine': '#0090FF',
    'McLaren': '#FF8700',
    'Williams': '#005AFF',
    'Haas': '#FFFFFF',
    'AlphaTauri': '#FFFFFF',
    'Racing Bulls': '#FFFFFF',
    'Audi': '#A3A3A3',
    'Cadillac': '#FFFFFF',
  }
  return colors[team] || '#ffffff'
}

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
  }
  return images[driverId] || null
}

export const getConstructorImageUrl = (team) => {
  if (!team) return null;
  const key = team.toLowerCase().replace(/\s+/g, '-');
  const images = {
    'red-bull': 'https://www.formula1.com/content/dam/fom-website/teams/2024/red-bull-racing.png',
    'ferrari': 'https://www.formula1.com/content/dam/fom-website/teams/2024/ferrari.png',
    'mclaren': 'https://www.formula1.com/content/dam/fom-website/teams/2024/mclaren.png',
    'mercedes': 'https://www.formula1.com/content/dam/fom-website/teams/2024/mercedes.png',
    'aston-martin': 'https://www.formula1.com/content/dam/fom-website/teams/2024/aston-martin.png',
    'alpine': 'https://www.formula1.com/content/dam/fom-website/teams/2024/alpine.png',
    'williams': 'https://www.formula1.com/content/dam/fom-website/teams/2024/williams.png',
    'racing-bulls': 'https://www.formula1.com/content/dam/fom-website/teams/2024/rb.png',
    'rb': 'https://www.formula1.com/content/dam/fom-website/teams/2024/rb.png',
    'haas': 'https://www.formula1.com/content/dam/fom-website/teams/2024/haas.png',
    'audi': 'https://www.formula1.com/content/dam/fom-website/teams/2024/kick-sauber.png',
    'kick-sauber': 'https://www.formula1.com/content/dam/fom-website/teams/2024/kick-sauber.png',
  };
  return images[key] || null;
}
