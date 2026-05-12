function hasLatLon(n) {
  return typeof n?.lat === 'number' && typeof n?.lon === 'number'
}

function hasLeaflet() {
  return typeof window !== 'undefined' && typeof window.L !== 'undefined'
}

function round5(n) {
  return Math.round(n * 100000) / 100000
}

function segmentKey(a, b) {
  const aLat = round5(a.lat)
  const aLon = round5(a.lon)
  const bLat = round5(b.lat)
  const bLon = round5(b.lon)
  return `${aLon},${aLat}|${bLon},${bLat}`
}

function reverseKey(k) {
  const parts = k.split('|')
  if (parts.length !== 2) return k
  return `${parts[1]}|${parts[0]}`
}

async function fetchOsrmRouteGeoJSON(a, b, signal) {
  const url = `https://router.project-osrm.org/route/v1/driving/${round5(a.lon)},${round5(a.lat)};${round5(b.lon)},${round5(b.lat)}?overview=full&geometries=geojson`
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error('OSRM error')
  const data = await res.json()
  const coords = data?.routes?.[0]?.geometry?.coordinates
  if (!Array.isArray(coords) || coords.length < 2) throw new Error('OSRM empty')
  return coords.map((c) => [c[1], c[0]])
}

function coastPolylineLatLon() {
  return [
    [50.07, -5.71],
    [50.26, -5.05],
    [50.42, -4.85],
    [50.61, -4.21],
    [50.77, -3.46],
    [51.02, -3.01],
    [51.27, -3.23],
    [51.48, -3.31],
    [51.73, -4.33],
    [52.42, -4.83],
    [53.12, -4.57],
    [53.55, -4.94],
    [54.39, -5.66],
    [55.07, -5.8],
    [55.86, -6.2],
    [56.5, -6],
    [57.1, -5.7],
    [57.6, -5.1],
    [58.12, -4.6],
    [58.64, -3.07],
    [58.67, -2.35],
    [58.4, -1.9],
    [57.93, -2.1],
    [57.3, -2],
    [56.8, -2.1],
    [56.1, -2.03],
    [55.55, -1.55],
    [55, -1.35],
    [54.6, -1.1],
    [54, -1.1],
    [53.55, -0.2],
    [53.1, 0.33],
    [52.65, 1.05],
    [52.1, 1.5],
    [51.55, 1.15],
    [51.1, 0.65],
    [50.86, 0.3],
    [50.74, -0.45],
    [50.63, -1.2],
    [50.52, -1.55],
    [50.39, -2.05],
    [50.19, -2.75],
    [50.1, -3.3],
    [49.98, -4.15],
    [50.02, -5.1],
    [50.07, -5.71]
  ]
}

function createLeafletMapView(container, nodes, options) {
  const { onNodeClick } = options
  const L = window.L

  container.textContent = ''

  const map = L.map(container, {
    zoomControl: true,
    attributionControl: false,
    scrollWheelZoom: true,
    preferCanvas: true
  })

  map.whenReady(() => {
    requestAnimationFrame(() => map.invalidateSize())
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    crossOrigin: true
  }).addTo(map)

  const markerById = new Map()
  const nodesLatLng = nodes.map((n) => [n.lat, n.lon])
  const bounds = L.latLngBounds(nodesLatLng)
  map.fitBounds(bounds.pad(0.35))

  const border = L.polyline(coastPolylineLatLon(), {
    color: '#ff4b4b',
    weight: 2,
    opacity: 0.8,
    dashArray: '6 6'
  }).addTo(map)

  const routeLayer = L.layerGroup().addTo(map)
  const stepLayer = L.layerGroup().addTo(map)
  const segCache = new Map()
  let renderToken = 0
  let activeControllers = []

  function storageKey(k) {
    return `osrm:${k}`
  }

  function readStored(k) {
    try {
      const raw = localStorage.getItem(storageKey(k))
      if (!raw) return null
      const v = JSON.parse(raw)
      if (!Array.isArray(v) || v.length < 2) return null
      if (!Array.isArray(v[0]) || v[0].length !== 2) return null
      return v
    } catch {
      return null
    }
  }

  function writeStored(k, v) {
    try {
      localStorage.setItem(storageKey(k), JSON.stringify(v))
    } catch {
      return
    }
  }

  function markerStyle({ isStart, isVisited, isTarget }) {
    const fillColor = isStart ? '#ffd75e' : isVisited ? '#5b8cff' : '#ffffff'
    const color = isStart ? 'rgba(140,100,0,0.8)' : isTarget ? 'rgba(10,20,30,0.65)' : 'rgba(10,20,30,0.45)'
    const fillOpacity = isStart ? 0.98 : isVisited ? 0.85 : 0.9
    const weight = isStart ? 3 : 2
    return { radius: 8, fillColor, color, weight, opacity: 1, fillOpacity }
  }

  for (const n of nodes) {
    const marker = L.circleMarker([n.lat, n.lon], markerStyle({ isStart: false, isVisited: false, isTarget: true }))
    marker.addTo(map)
    marker.bindTooltip(`${n.code} — ${n.name}`, { direction: 'top', opacity: 0.95, sticky: true })
    marker.on('click', () => onNodeClick(n.id))
    markerById.set(n.id, marker)
  }

  function renderNodes({ startId, visitedIds, targetIds }) {
    for (const n of nodes) {
      const marker = markerById.get(n.id)
      if (!marker) continue
      const isStart = n.id === startId
      const isVisited = visitedIds.has(n.id)
      const isTarget = targetIds.has(n.id)
      marker.setStyle(markerStyle({ isStart, isVisited, isTarget }))
    }
  }

  function cancelActive() {
    for (const c of activeControllers) c.abort()
    activeControllers = []
  }

  async function getSegmentLatLngs(a, b, signal) {
    const k = segmentKey(a, b)
    const rev = reverseKey(k)
    if (segCache.has(k)) return segCache.get(k)
    const stored = readStored(k)
    if (stored) {
      segCache.set(k, stored)
      segCache.set(rev, [...stored].reverse())
      return stored
    }
    if (segCache.has(rev)) {
      const v = segCache.get(rev)
      const reversed = Array.isArray(v) ? [...v].reverse() : v
      segCache.set(k, reversed)
      return reversed
    }
    const pts = await fetchOsrmRouteGeoJSON(a, b, signal)
    segCache.set(k, pts)
    segCache.set(rev, [...pts].reverse())
    writeStored(k, pts)
    writeStored(rev, [...pts].reverse())
    return pts
  }

  async function drawRoadRoute(order, color, opacity, token) {
    if (order.length < 2) return
    const controller = new AbortController()
    activeControllers.push(controller)
    const signal = controller.signal

    const segTasks = []
    for (let i = 1; i < order.length; i += 1) {
      const a = nodes[order[i - 1]]
      const b = nodes[order[i]]
      if (!a || !b) continue
      segTasks.push({ a, b })
    }

    const concurrency = 2
    let idx = 0
    const runners = Array.from({ length: Math.min(concurrency, segTasks.length) }, async () => {
      while (idx < segTasks.length) {
        const cur = segTasks[idx]
        idx += 1
        if (token !== renderToken) return
        try {
          const pts = await getSegmentLatLngs(cur.a, cur.b, signal)
          if (token !== renderToken) return
          L.polyline(pts, { color, weight: 5, opacity, lineCap: 'round', lineJoin: 'round' }).addTo(routeLayer)
        } catch {
          if (token !== renderToken) return
          L.polyline(
            [
              [cur.a.lat, cur.a.lon],
              [cur.b.lat, cur.b.lon]
            ],
            { color, weight: 4, opacity: Math.max(0.35, opacity - 0.25), dashArray: '6 8', lineCap: 'round', lineJoin: 'round' }
          ).addTo(routeLayer)
        }
      }
    })

    await Promise.all(runners)
  }

  function iconHtml(num, color) {
    const safe = String(num).replace(/[^0-9]/g, '')
    return `<span class="step-marker__inner" style="background:${color}">${safe}</span>`
  }

  function addStepMarkers(order, color, kind) {
    const trimmed = order.length >= 2 && order[0] === order[order.length - 1] ? order.slice(0, -1) : order
    const anchorShift = kind === 'optimal' ? [22, 22] : [0, 0]

    for (let i = 0; i < trimmed.length; i += 1) {
      const n = nodes[trimmed[i]]
      if (!n) continue
      const icon = L.divIcon({
        className: `step-marker step-marker--${kind}`,
        html: iconHtml(i + 1, color),
        iconSize: [24, 24],
        iconAnchor: [12 + anchorShift[0], 12 + anchorShift[1]]
      })
      L.marker([n.lat, n.lon], { icon, interactive: false, keyboard: false }).addTo(stepLayer)
    }
  }

  function renderRoutes({ playerOrder, optimalOrder, mode }) {
    routeLayer.clearLayers()
    stepLayer.clearLayers()
    cancelActive()
    renderToken += 1
    const token = renderToken

    if (mode === 'player' || mode === 'both') {
      if (playerOrder.length >= 2) {
        const opacity = mode === 'both' ? 0.9 : 1
        const color = '#1f66ff'
        void drawRoadRoute(playerOrder, color, opacity, token)
        addStepMarkers(playerOrder, color, 'player')
      }
    }

    if (mode === 'optimal' || mode === 'both') {
      if (optimalOrder.length >= 2) {
        const opacity = mode === 'both' ? 0.75 : 1
        const color = '#00a135'
        void drawRoadRoute(optimalOrder, color, opacity, token)
        addStepMarkers(optimalOrder, color, 'optimal')
      }
    }
  }

  return {
    renderNodes,
    renderRoutes,
    destroy() {
      cancelActive()
      routeLayer.clearLayers()
      stepLayer.clearLayers()
      markerById.clear()
      border.remove()
      map.remove()
    }
  }
}

export function createMapView(container, nodes, options) {
  const allLatLon = nodes.every((n) => hasLatLon(n))
  if (!allLatLon || !hasLeaflet()) {
    throw new Error('Mapa real no disponible: falta Leaflet o lat/lon en los nodos.')
  }
  return createLeafletMapView(container, nodes, options)
}
