const DEFAULT_NIGHT_START = 19 * 60 // 1140 min
const DEFAULT_NIGHT_END = 7 * 60    // 420 min

/**
 * Parse "HH:MM" string vers minutes depuis minuit. Fallback sur defaults si invalide.
 */
function parseHM(s: string | undefined, fallback: number): number {
  if (!s) return fallback
  const [h, m] = s.split(':').map(Number)
  if (isNaN(h) || isNaN(m)) return fallback
  return h * 60 + m
}

export function isNightMinutes(
  minutesFromMidnight: number,
  nightStart: number = DEFAULT_NIGHT_START,
  nightEnd: number = DEFAULT_NIGHT_END
): boolean {
  const t = ((minutesFromMidnight % 1440) + 1440) % 1440
  // Si la plage nuit traverse minuit (ex: 19h → 7h) : t >= start OR t < end
  // Si la plage est sur une même journée (rare, ex: 7h → 19h) : t >= start AND t < end
  return nightStart > nightEnd
    ? (t >= nightStart || t < nightEnd)
    : (t >= nightStart && t < nightEnd)
}

export { parseHM }

/**
 * Calcule le tarif kilométrique en tenant compte du basculement
 * jour/nuit en cours de route (ex: départ 18h30, arrivée 20h00).
 * Suppose une vitesse constante sur le trajet.
 */
export function calculateDistanceFare(
  departureTime: Date,
  durationMinutes: number,
  distanceKm: number,
  dayRate: number,
  nightRate: number,
  nightStartHM: string = '19:00',
  nightEndHM: string = '07:00'
): number {
  if (distanceKm <= 0) return 0

  const nightStart = parseHM(nightStartHM, DEFAULT_NIGHT_START)
  const nightEnd = parseHM(nightEndHM, DEFAULT_NIGHT_END)

  const depMin = departureTime.getHours() * 60 + departureTime.getMinutes()

  if (durationMinutes <= 0) {
    return distanceKm * (isNightMinutes(depMin, nightStart, nightEnd) ? nightRate : dayRate)
  }

  const arrMin = depMin + durationMinutes
  const speedKmPerMin = distanceKm / durationMinutes

  // Collecte de tous les points de basculement dans [depMin, arrMin]
  const points: number[] = [depMin, arrMin]
  const maxDay = Math.ceil(arrMin / 1440) + 1

  for (let day = 0; day <= maxDay; day++) {
    const tStart = day * 1440 + nightStart
    const tEnd  = day * 1440 + nightEnd
    if (tStart > depMin && tStart < arrMin) points.push(tStart)
    if (tEnd  > depMin && tEnd  < arrMin) points.push(tEnd)
  }

  points.sort((a, b) => a - b)

  let fare = 0
  for (let i = 0; i < points.length - 1; i++) {
    const segKm = (points[i + 1] - points[i]) * speedKmPerMin
    fare += segKm * (isNightMinutes(points[i], nightStart, nightEnd) ? nightRate : dayRate)
  }

  return fare
}
