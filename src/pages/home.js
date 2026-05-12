import { getScenarios, getScenarioById } from '../data/scenarios.js'
import { clearGameState, getScenarioId, setScenarioId } from '../utils/storage.js'

const scenarioSelect = document.getElementById('scenario')
const info = document.getElementById('scenarioInfo')
const howToBtn = document.getElementById('howToBtn')
const howTo = document.getElementById('howTo')

const scenarios = getScenarios()

function ensureSelectedId() {
  const saved = getScenarioId()
  if (saved && getScenarioById(saved)) return saved
  return scenarios[0]?.id || 'easy'
}

function renderSelect(selectedId) {
  scenarioSelect.textContent = ''
  for (const s of scenarios) {
    const opt = document.createElement('option')
    opt.value = s.id
    opt.textContent = s.name
    if (s.id === selectedId) opt.selected = true
    scenarioSelect.appendChild(opt)
  }
}

function renderInfo(id) {
  const s = getScenarioById(id)
  if (!s) {
    info.textContent = ''
    return
  }
  info.textContent = `${s.description} Nodos: ${s.nodes.length}. Inicio: ${s.nodes.find((n) => n.id === s.startId)?.name || 'Londres'}.`
}

const initialId = ensureSelectedId()
setScenarioId(initialId)
clearGameState()
renderSelect(initialId)
renderInfo(initialId)

scenarioSelect.addEventListener('change', () => {
  const id = scenarioSelect.value
  setScenarioId(id)
  clearGameState()
  renderInfo(id)
})

howToBtn.addEventListener('click', () => {
  if (typeof howTo.showModal === 'function') howTo.showModal()
})

