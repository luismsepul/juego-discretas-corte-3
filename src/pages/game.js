import { getScenarioById } from '../data/scenarios.js'
import { loadGameState, saveGameState, getScenarioId, clearGameState } from '../utils/storage.js'
import { createMapView } from '../ui/mapView.js'
import { formatHhMm, formatKm, formatLiters } from '../utils/format.js'
import { distanceMatrixKm, pathDistance } from '../engine/tsp.js'

const scenarioNameEl = document.getElementById('scenarioName')
const visitedEl = document.getElementById('visited')
const distanceEl = document.getElementById('distance')
const timeEl = document.getElementById('time')
const fuelEl = document.getElementById('fuel')
const routeChips = document.getElementById('routeChips')
const targetsEl = document.getElementById('targets')
const statusEl = document.getElementById('status')
const hintEl = document.getElementById('hint')
const resultsBtn = document.getElementById('resultsBtn')
const undoBtn = document.getElementById('undoBtn')
const resetBtn = document.getElementById('resetBtn')
const svg = document.getElementById('map')

const scenarioId = getScenarioId()
const scenario = scenarioId ? getScenarioById(scenarioId) : null

if (!scenario) {
  window.location.href = '../index.html'
}

const nodes = scenario.nodes
const startIdx = nodes.findIndex((n) => n.id === scenario.startId)
const nodeIndexById = new Map(nodes.map((n, i) => [n.id, i]))
const targetIds = new Set(nodes.filter((n) => n.id !== scenario.startId).map((n) => n.id))
const dKm = distanceMatrixKm(nodes, scenario.kmPerUnit)

function newState() {
  const startId = scenario.startId
  return {
    scenarioId: scenario.id,
    pathIds: [startId],
    completed: false,
    closed: false,
    createdAt: Date.now()
  }
}

function loadOrCreateState() {
  const saved = loadGameState()
  if (saved && saved.scenarioId === scenario.id && Array.isArray(saved.pathIds) && saved.pathIds[0] === scenario.startId) {
    return saved
  }
  const s = newState()
  saveGameState(s)
  return s
}

let state = loadOrCreateState()

const view = createMapView(svg, nodes, {
  onNodeClick: (id) => onPick(id)
})

function pathToOrder(pathIds) {
  return pathIds.map((id) => nodeIndexById.get(id)).filter((v) => typeof v === 'number')
}

function computeMetrics(pathIds) {
  const order = pathToOrder(pathIds)
  const distanceKm = pathDistance(order, dKm)
  const timeHours = distanceKm / scenario.speedKmh
  const fuelLiters = distanceKm * scenario.litersPerKm
  return { order, distanceKm, timeHours, fuelLiters }
}

function visitedSet(pathIds) {
  const v = new Set()
  for (const id of pathIds) v.add(id)
  return v
}

function allTargetsVisited(pathIds) {
  const v = visitedSet(pathIds)
  for (const id of targetIds) {
    if (!v.has(id)) return false
  }
  return true
}

function canClose(pathIds) {
  return allTargetsVisited(pathIds) && pathIds[pathIds.length - 1] !== scenario.startId
}

function isClosed(pathIds) {
  return pathIds.length >= 2 && pathIds[0] === scenario.startId && pathIds[pathIds.length - 1] === scenario.startId
}

function onPick(id) {
  if (state.completed) return
  const last = state.pathIds[state.pathIds.length - 1]

  if (id === last) return

  if (id === scenario.startId) {
    if (!canClose(state.pathIds)) {
      statusEl.textContent = 'Aún faltan ciudades objetivo por visitar antes de volver a Londres.'
      return
    }
    state.pathIds = [...state.pathIds, scenario.startId]
    state.closed = true
    state.completed = true
    saveGameState(state)
    render()
    return
  }

  if (!targetIds.has(id)) return

  const v = visitedSet(state.pathIds)
  if (v.has(id)) {
    statusEl.textContent = 'Esa ciudad ya está en tu ruta.'
    return
  }

  state.pathIds = [...state.pathIds, id]
  saveGameState(state)
  render()
}

function onUndo() {
  if (state.pathIds.length <= 1) return
  if (state.completed) {
    state.completed = false
    state.closed = false
  }
  state.pathIds = state.pathIds.slice(0, -1)
  saveGameState(state)
  render()
}

function onReset() {
  state = newState()
  saveGameState(state)
  render()
}

undoBtn.addEventListener('click', onUndo)
resetBtn.addEventListener('click', onReset)

function renderTargets() {
  targetsEl.textContent = ''
  for (const n of nodes) {
    if (n.id === scenario.startId) continue
    const row = document.createElement('div')
    row.className = 'target'
    const name = document.createElement('div')
    name.className = 'target__name'
    name.textContent = n.name
    const badge = document.createElement('div')
    badge.className = 'target__badge'
    badge.textContent = n.code
    row.appendChild(name)
    row.appendChild(badge)
    targetsEl.appendChild(row)
  }
}

function renderRouteChips(pathIds) {
  routeChips.textContent = ''
  for (let i = 0; i < pathIds.length; i += 1) {
    const id = pathIds[i]
    const n = nodes[nodeIndexById.get(id)]
    const chip = document.createElement('span')
    chip.className = `chip${id === scenario.startId ? ' chip--start' : ''}`
    chip.textContent = n ? `${i + 1}. ${n.code}` : `${i + 1}. ${id}`
    routeChips.appendChild(chip)
  }
}

function render() {
  scenarioNameEl.textContent = scenario.name
  renderTargets()

  const v = visitedSet(state.pathIds)
  const { order, distanceKm, timeHours, fuelLiters } = computeMetrics(state.pathIds)

  visitedEl.textContent = `${Math.min(v.size, nodes.length)} / ${nodes.length}`
  distanceEl.textContent = formatKm(distanceKm)
  timeEl.textContent = formatHhMm(timeHours)
  fuelEl.textContent = formatLiters(fuelLiters)

  const missing = nodes.filter((n) => n.id !== scenario.startId && !v.has(n.id)).map((n) => n.code)
  if (state.completed) {
    statusEl.textContent = 'Ruta completada. Ya puedes ver la comparación.'
  } else if (missing.length === 0) {
    statusEl.textContent = 'Listo: ahora vuelve a Londres para cerrar la ruta.'
  } else {
    statusEl.textContent = `Faltan: ${missing.join(', ')}`
  }

  hintEl.textContent = 'Haz clic en ciudades objetivo. Vuelve a Londres al final para cerrar.'
  renderRouteChips(state.pathIds)

  const disabled = !isClosed(state.pathIds)
  resultsBtn.setAttribute('aria-disabled', disabled ? 'true' : 'false')
  resultsBtn.classList.toggle('btn--disabled', disabled)
  resultsBtn.style.pointerEvents = disabled ? 'none' : 'auto'
  resultsBtn.style.opacity = disabled ? '0.55' : '1'

  view.renderNodes({ startId: scenario.startId, visitedIds: v, targetIds })
  view.renderRoutes({ playerOrder: order, optimalOrder: [], mode: 'player' })
}

window.addEventListener('beforeunload', () => saveGameState(state))

if (state.scenarioId !== scenario.id) {
  clearGameState()
  state = newState()
  saveGameState(state)
}

render()
