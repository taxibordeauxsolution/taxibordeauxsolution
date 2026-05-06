const NIGHT_START = 19 * 60 // 1140 min depuis minuit
const NIGHT_END = 7 * 60    // 420 min depuis minuit

export function isNightMinutes(minutesFromMidnight: number): boolean {
  const t = ((minutesFromMidnight % 1440) + 1440) % 1440
  return t >= NIGHT_START || t < NIGHT_END
}

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
  nightRate: number
): number {
  if (distanceKm <= 0) return 0

  const depMin = departureTime.getHours() * 60 + departureTime.getMinutes()

  if (durationMinutes <= 0) {
    return distanceKm * (isNightMinutes(depMin) ? nightRate : dayRate)
  }

  const arrMin = depMin + durationMinutes
  const speedKmPerMin = distanceKm / durationMinutes

  // Collecte de tous les points de basculement dans [depMin, arrMin]
  const points: number[] = [depMin, arrMin]
  const maxDay = Math.ceil(arrMin / 1440) + 1

  for (let day = 0; day <= maxDay; day++) {
    const t19 = day * 1440 + NIGHT_START
    const t6  = day * 1440 + NIGHT_END
    if (t19 > depMin && t19 < arrMin) points.push(t19)
    if (t6  > depMin && t6  < arrMin) points.push(t6)
  }

  points.sort((a, b) => a - b)

  let fare = 0
  for (let i = 0; i < points.length - 1; i++) {
    const segKm = (points[i + 1] - points[i]) * speedKmPerMin
    fare += segKm * (isNightMinutes(points[i]) ? nightRate : dayRate)
  }

  return fare
}
