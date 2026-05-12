export function euclidean(a, b) {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.sqrt(dx * dx + dy * dy)
}

function toRad(deg) {
  return (deg * Math.PI) / 180
}

export function haversineKm(a, b) {
  const R = 6371
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const dLat = lat2 - lat1
  const dLon = toRad(b.lon - a.lon)
  const s1 = Math.sin(dLat / 2)
  const s2 = Math.sin(dLon / 2)
  const h = s1 * s1 + Math.cos(lat1) * Math.cos(lat2) * s2 * s2
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
  return R * c
}

function hasLatLon(n) {
  return typeof n.lat === 'number' && typeof n.lon === 'number'
}

function hasXy(n) {
  return typeof n.x === 'number' && typeof n.y === 'number'
}

export function distanceMatrix(nodes) {
  const n = nodes.length
  const d = Array.from({ length: n }, () => Array.from({ length: n }, () => 0))
  for (let i = 0; i < n; i += 1) {
    for (let j = i + 1; j < n; j += 1) {
      const v = euclidean(nodes[i], nodes[j])
      d[i][j] = v
      d[j][i] = v
    }
  }
  return d
}

export function distanceMatrixKm(nodes, kmPerUnit = 1) {
  const n = nodes.length
  const d = Array.from({ length: n }, () => Array.from({ length: n }, () => 0))
  for (let i = 0; i < n; i += 1) {
    for (let j = i + 1; j < n; j += 1) {
      let km = 0
      if (hasLatLon(nodes[i]) && hasLatLon(nodes[j])) {
        km = haversineKm(nodes[i], nodes[j])
      } else if (hasXy(nodes[i]) && hasXy(nodes[j])) {
        km = euclidean(nodes[i], nodes[j]) * kmPerUnit
      }
      d[i][j] = km
      d[j][i] = km
    }
  }
  return d
}

export function pathDistance(order, d) {
  let sum = 0
  for (let i = 1; i < order.length; i += 1) {
    sum += d[order[i - 1]][order[i]]
  }
  return sum
}

export function solveTspHeldKarp(d, startIndex = 0) {
  const n = d.length
  if (n <= 1) return [startIndex, startIndex]
  if (startIndex !== 0) {
    const order = [...Array(n).keys()]
    const swapped = order.map((i) => (i === 0 ? startIndex : i === startIndex ? 0 : i))
    const remap = swapped
    const inv = Array.from({ length: n }, () => 0)
    for (let i = 0; i < n; i += 1) inv[remap[i]] = i
    const d2 = Array.from({ length: n }, () => Array.from({ length: n }, () => 0))
    for (let i = 0; i < n; i += 1) {
      for (let j = 0; j < n; j += 1) {
        d2[i][j] = d[remap[i]][remap[j]]
      }
    }
    const ord2 = solveTspHeldKarp(d2, 0)
    return ord2.map((i) => remap[i])
  }

  const m = n - 1
  const size = 1 << m
  const dp = Array.from({ length: size }, () => Array.from({ length: m }, () => Number.POSITIVE_INFINITY))
  const parent = Array.from({ length: size }, () => Array.from({ length: m }, () => -1))

  for (let j = 0; j < m; j += 1) {
    dp[1 << j][j] = d[0][j + 1]
  }

  for (let mask = 1; mask < size; mask += 1) {
    for (let j = 0; j < m; j += 1) {
      if ((mask & (1 << j)) === 0) continue
      const prevMask = mask ^ (1 << j)
      if (prevMask === 0) continue
      for (let k = 0; k < m; k += 1) {
        if ((prevMask & (1 << k)) === 0) continue
        const cand = dp[prevMask][k] + d[k + 1][j + 1]
        if (cand < dp[mask][j]) {
          dp[mask][j] = cand
          parent[mask][j] = k
        }
      }
    }
  }

  const all = size - 1
  let bestCost = Number.POSITIVE_INFINITY
  let bestEnd = 0
  for (let j = 0; j < m; j += 1) {
    const cand = dp[all][j] + d[j + 1][0]
    if (cand < bestCost) {
      bestCost = cand
      bestEnd = j
    }
  }

  const seq = []
  let mask = all
  let cur = bestEnd
  while (cur !== -1) {
    seq.push(cur + 1)
    const p = parent[mask][cur]
    mask = mask ^ (1 << cur)
    cur = p
  }
  seq.reverse()

  return [0, ...seq, 0]
}

export function routeMetricsKm({ nodes, order, kmPerUnit, speedKmh, litersPerKm }) {
  const dKm = distanceMatrixKm(nodes, kmPerUnit)
  const km = pathDistance(order, dKm)
  const hours = km / speedKmh
  const liters = km * litersPerKm
  return {
    distanceKm: km,
    timeHours: hours,
    fuelLiters: liters
  }
}
