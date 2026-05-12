export function round1(n) {
  return Math.round(n * 10) / 10
}

export function round2(n) {
  return Math.round(n * 100) / 100
}

export function formatKm(km) {
  return `${round1(km).toLocaleString('es-CO')} km`
}

export function formatLiters(l) {
  return `${round2(l).toLocaleString('es-CO')} L`
}

export function formatHhMm(hours) {
  const totalMin = Math.round(hours * 60)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h <= 0) return `${m} min`
  return `${h} h ${m} min`
}

