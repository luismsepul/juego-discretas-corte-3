const base = {
  startId: 'london',
  kmPerUnit: 1.05,
  speedKmh: 70,
  litersPerKm: 0.09
}

const scenarios = [
  {
    id: 'example',
    name: 'Ejemplo (5 ciudades clave)',
    description: 'Londres + Manchester, Liverpool, Leeds y Glasgow.',
    ...base,
    nodes: [
      { id: 'london', code: 'LDN', name: 'Londres', lat: 51.5074, lon: -0.1278 },
      { id: 'manchester', code: 'MAN', name: 'Manchester', lat: 53.4808, lon: -2.2426 },
      { id: 'liverpool', code: 'LIV', name: 'Liverpool', lat: 53.4084, lon: -2.9916 },
      { id: 'leeds', code: 'LEE', name: 'Leeds', lat: 53.8008, lon: -1.5491 },
      { id: 'glasgow', code: 'GLA', name: 'Glasgow', lat: 55.8642, lon: -4.2518 }
    ]
  },
  {
    id: 'easy',
    name: 'Fácil (7 nodos)',
    description: 'Ruta corta con ciudades representativas.',
    ...base,
    nodes: [
      { id: 'london', code: 'LDN', name: 'Londres', lat: 51.5074, lon: -0.1278 },
      { id: 'birmingham', code: 'BIR', name: 'Birmingham', lat: 52.4862, lon: -1.8904 },
      { id: 'manchester', code: 'MAN', name: 'Manchester', lat: 53.4808, lon: -2.2426 },
      { id: 'liverpool', code: 'LIV', name: 'Liverpool', lat: 53.4084, lon: -2.9916 },
      { id: 'leeds', code: 'LEE', name: 'Leeds', lat: 53.8008, lon: -1.5491 },
      { id: 'newcastle', code: 'NEW', name: 'Newcastle upon Tyne', lat: 54.9783, lon: -1.6178 },
      { id: 'glasgow', code: 'GLA', name: 'Glasgow', lat: 55.8642, lon: -4.2518 }
    ]
  },
  {
    id: 'medium',
    name: 'Medio (9 nodos)',
    description: 'Más nodos y decisiones de orden.',
    ...base,
    nodes: [
      { id: 'london', code: 'LDN', name: 'Londres', lat: 51.5074, lon: -0.1278 },
      { id: 'cardiff', code: 'CAR', name: 'Cardiff', lat: 51.4816, lon: -3.1791 },
      { id: 'birmingham', code: 'BIR', name: 'Birmingham', lat: 52.4862, lon: -1.8904 },
      { id: 'bristol', code: 'BRI', name: 'Bristol', lat: 51.4545, lon: -2.5879 },
      { id: 'manchester', code: 'MAN', name: 'Manchester', lat: 53.4808, lon: -2.2426 },
      { id: 'liverpool', code: 'LIV', name: 'Liverpool', lat: 53.4084, lon: -2.9916 },
      { id: 'leeds', code: 'LEE', name: 'Leeds', lat: 53.8008, lon: -1.5491 },
      { id: 'newcastle', code: 'NEW', name: 'Newcastle upon Tyne', lat: 54.9783, lon: -1.6178 },
      { id: 'edinburgh', code: 'EDI', name: 'Edimburgo', lat: 55.9533, lon: -3.1883 }
    ]
  },
  {
    id: 'hard',
    name: 'Difícil (11 nodos)',
    description: 'Ruta larga con más ciudades objetivo.',
    ...base,
    nodes: [
      { id: 'london', code: 'LDN', name: 'Londres', lat: 51.5074, lon: -0.1278 },
      { id: 'brighton', code: 'BRG', name: 'Brighton', lat: 50.8225, lon: -0.1372 },
      { id: 'cambridge', code: 'CAM', name: 'Cambridge', lat: 52.2053, lon: 0.1218 },
      { id: 'oxford', code: 'OXF', name: 'Oxford', lat: 51.752, lon: -1.2577 },
      { id: 'birmingham', code: 'BIR', name: 'Birmingham', lat: 52.4862, lon: -1.8904 },
      { id: 'bristol', code: 'BRI', name: 'Bristol', lat: 51.4545, lon: -2.5879 },
      { id: 'cardiff', code: 'CAR', name: 'Cardiff', lat: 51.4816, lon: -3.1791 },
      { id: 'liverpool', code: 'LIV', name: 'Liverpool', lat: 53.4084, lon: -2.9916 },
      { id: 'manchester', code: 'MAN', name: 'Manchester', lat: 53.4808, lon: -2.2426 },
      { id: 'leeds', code: 'LEE', name: 'Leeds', lat: 53.8008, lon: -1.5491 },
      { id: 'glasgow', code: 'GLA', name: 'Glasgow', lat: 55.8642, lon: -4.2518 }
    ]
  }
]

export function getScenarios() {
  return scenarios
}

export function getScenarioById(id) {
  return scenarios.find((s) => s.id === id) || null
}
