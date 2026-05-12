import { getScenarioById } from '../data/scenarios.js'
import { getScenarioId, loadGameState } from '../utils/storage.js'
import { createMapView } from '../ui/mapView.js'
import { formatHhMm, formatKm, formatLiters, round1 } from '../utils/format.js'
import { distanceMatrixKm, pathDistance, solveTspHeldKarp, routeMetricsKm } from '../engine/tsp.js'

const scenarioNameEl = document.getElementById('scenarioName')
const scoreEl = document.getElementById('score')
const playerDistanceEl = document.getElementById('playerDistance')
const optimalDistanceEl = document.getElementById('optimalDistance')
const playerRouteEl = document.getElementById('playerRoute')
const optimalRouteEl = document.getElementById('optimalRoute')
const deltaEl = document.getElementById('delta')
const pctEl = document.getElementById('pct')
const playerTimeEl = document.getElementById('playerTime')
const playerFuelEl = document.getElementById('playerFuel')
const retryBtn = document.getElementById('retryBtn')
const svg = document.getElementById('map')

const scenarioId = getScenarioId()
const scenario = scenarioId ? getScenarioById(scenarioId) : null
const gameState = loadGameState()

if (!scenario || !gameState || gameState.scenarioId !== scenario.id || !Array.isArray(gameState.pathIds) || gameState.pathIds.length < 2) {
  window.location.href = '../index.html'
}

const nodes = scenario.nodes
const nodeIndexById = new Map(nodes.map((n, i) => [n.id, i]))

function idsToOrder(pathIds) {
  return pathIds.map((id) => nodeIndexById.get(id)).filter((v) => typeof v === 'number')
}

const playerOrder = idsToOrder(gameState.pathIds)
const dKm = distanceMatrixKm(nodes, scenario.kmPerUnit)
const optimalOrder = solveTspHeldKarp(dKm, nodeIndexById.get(scenario.startId) ?? 0)

const playerKm = pathDistance(playerOrder, dKm)
const optimalKm = pathDistance(optimalOrder, dKm)

const deltaKm = playerKm - optimalKm
const pct = optimalKm > 0 ? (deltaKm / optimalKm) * 100 : 0

const playerMetrics = routeMetricsKm({
  nodes,
  order: playerOrder,
  kmPerUnit: scenario.kmPerUnit,
  speedKmh: scenario.speedKmh,
  litersPerKm: scenario.litersPerKm
})

function routeText(order) {
  const trimmed = order.length >= 2 && order[0] === order[order.length - 1] ? order.slice(0, -1) : order
  const names = trimmed.map((i, idx) => {
    const name = nodes[i]?.name
    if (!name) return null
    return `${idx + 1}. ${name}`
  })
  return names.filter(Boolean).join(' → ')
}

function starsFor(pctOver) {
  if (pctOver <= 10) return 3
  if (pctOver <= 25) return 2
  return 1
}

function renderScore() {
  const s = starsFor(pct)
  const title = document.createElement('div')
  title.className = 'score__title'
  title.textContent = pct <= 0 ? '¡Excelente! Igualaste o mejoraste el óptimo.' : 'Tu eficiencia logística'

  const subtitle = document.createElement('div')
  subtitle.className = 'help'
  subtitle.textContent = `Estuviste a ${round1(Math.max(0, pct)).toLocaleString('es-CO')}% sobre la ruta óptima.`

  const stars = document.createElement('div')
  stars.className = 'score__stars'
  for (let i = 1; i <= 3; i += 1) {
    const star = document.createElement('div')
    star.className = `star${i <= s ? ' star--on' : ''}`
    stars.appendChild(star)
  }

  scoreEl.textContent = ''
  scoreEl.appendChild(title)
  scoreEl.appendChild(subtitle)
  scoreEl.appendChild(stars)
}

const view = createMapView(svg, nodes, {
  onNodeClick: () => {}
})

function setViewMode(mode) {
  view.renderNodes({ startId: scenario.startId, visitedIds: new Set(), targetIds: new Set() })
  view.renderRoutes({ playerOrder, optimalOrder, mode })
}

function render() {
  scenarioNameEl.textContent = scenario.name

  renderScore()
  playerDistanceEl.textContent = formatKm(playerKm)
  optimalDistanceEl.textContent = formatKm(optimalKm)
  playerRouteEl.textContent = routeText(playerOrder)
  optimalRouteEl.textContent = routeText(optimalOrder)

  deltaEl.textContent = `${deltaKm >= 0 ? '+' : ''}${formatKm(deltaKm).replace(' km', '')} km`
  pctEl.textContent = `${round1(Math.max(0, pct)).toLocaleString('es-CO')}%`
  playerTimeEl.textContent = formatHhMm(playerMetrics.timeHours)
  playerFuelEl.textContent = formatLiters(playerMetrics.fuelLiters)

  setViewMode('both')
}

document.querySelectorAll('input[name="view"]').forEach((r) => {
  r.addEventListener('change', () => {
    const mode = r.checked ? r.value : null
    if (mode === 'both' || mode === 'player' || mode === 'optimal') setViewMode(mode)
  })
})

retryBtn.addEventListener('click', () => {
  window.location.href = './game.html'
})

render()
