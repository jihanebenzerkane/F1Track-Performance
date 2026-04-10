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

export const getTeamColor = (team) => {
  const colors = {
    'Red Bull': '#3671C6',
    Ferrari: '#E8002D',
    McLaren: '#FF8000',
    Mercedes: '#27F4D2',
    'Aston Martin': '#229971',
    Alpine: '#0093CC',
    Williams: '#64C4FF',
    'Racing Bulls': '#6692FF',
    Haas: '#B6BABD',
    Audi: '#C8C8C8',
    'Kick Sauber': '#52E252',
    Cadillac: '#333333',
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
