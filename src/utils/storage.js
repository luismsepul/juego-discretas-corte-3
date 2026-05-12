const KEY = {
  scenarioId: 'albion_scenario_id',
  gameState: 'albion_game_state'
}

export function setScenarioId(id) {
  localStorage.setItem(KEY.scenarioId, id)
}

export function getScenarioId() {
  return localStorage.getItem(KEY.scenarioId)
}

export function clearGameState() {
  localStorage.removeItem(KEY.gameState)
}

export function saveGameState(state) {
  localStorage.setItem(KEY.gameState, JSON.stringify(state))
}

export function loadGameState() {
  const raw = localStorage.getItem(KEY.gameState)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

