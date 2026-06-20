import { calculateDistanceFare, isNightMinutes, parseHM } from './pricing'

export interface PriceConfig {
  priseEnCharge: number
  tarifKmJour: number
  tarifKmNuit: number
  fraisApproche: number
  courseMini: number
  courseMiniDe: number
  heureDebutNuit: string
  heureFinNuit: string
  suppApprocheActive: boolean
  suppApprocheSeuilKm: number
  remiseActive: boolean
  remiseSeuilKm: number
  remisePourcentage: number
  tarifNuitDegressifActive: boolean
  tarifNuitDegressifSeuilKm: number
  tarifNuitDegressifPrixKm: number
  tarifNuitDegressifMode: string
  tarifJourDegressifActive: boolean
  tarifJourDegressifSeuilKm: number
  tarifJourDegressifPrixKm: number
  tarifJourDegressifMode: string
  tarifNuitMajoreActive: boolean
  tarifNuitMajoreSeuilKm: number
  tarifNuitMajorePrixKm: number
  tarifJourMajoreActive: boolean
  tarifJourMajoreSeuilKm: number
  tarifJourMajorePrixKm: number
  affichagePrixUnique: boolean
  marcheLenteActive: boolean
  tauxMarcheLente: number
}

export interface ForfaitData {
  actif: boolean
  prixJour: number
  prixNuit: number
  pointA: { lat: number; lng: number; zone?: { lat: number; lng: number }[] }
  pointB: { lat: number; lng: number; zone?: { lat: number; lng: number }[] }
}

export interface PriceResult {
  totalPrice: number
  fourchette: { de: number; a: number } | null
  tariffType: string
  isForfait: boolean
  isNight: boolean
  isHoliday: boolean
  isSunday: boolean
  marcheLenteCost: number
  priceBeforeDegressif: number  // 0 si non appliqué
  priceBeforeRemise: number     // 0 si non appliqué
}

function isPublicHoliday(date: Date): boolean {
  const d = date.getDate(), m = date.getMonth() + 1, y = date.getFullYear()
  const fixed = [[1,1],[1,5],[8,5],[14,7],[15,8],[1,11],[11,11],[25,12]]
  if (fixed.some(([fd, fm]) => d === fd && m === fm)) return true
  const a = y % 19, b = Math.floor(y/100), c = y % 100
  const dd = Math.floor(b/4), e = b % 4, f = Math.floor((b+8)/25)
  const g = Math.floor((b-f+1)/3), h = (19*a+b-dd-g+15) % 30
  const i = Math.floor(c/4), k = c % 4
  const l = (32+2*e+2*i-h-k) % 7
  const mm = Math.floor((a+11*h+22*l)/451)
  const month = Math.floor((h+l-7*mm+114)/31)
  const day = ((h+l-7*mm+114) % 31) + 1
  const easter = new Date(y, month-1, day)
  const lundi = new Date(easter); lundi.setDate(easter.getDate()+1)
  const ascension = new Date(easter); ascension.setDate(easter.getDate()+39)
  const pentecote = new Date(easter); pentecote.setDate(easter.getDate()+50)
  return [lundi, ascension, pentecote].some(hd => hd.getDate()===d && hd.getMonth()===m-1)
}

function distM(a: {lat:number,lng:number}, b: {lat:number,lng:number}): number {
  const R=6371000, dLat=(b.lat-a.lat)*Math.PI/180, dLng=(b.lng-a.lng)*Math.PI/180
  const x=Math.sin(dLat/2)**2+Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLng/2)**2
  return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x))
}

function pointInPolygon(pt: {lat:number,lng:number}, poly: {lat:number,lng:number}[]): boolean {
  let inside = false
  for (let i=0,j=poly.length-1; i<poly.length; j=i++) {
    const xi=poly[i].lng,yi=poly[i].lat,xj=poly[j].lng,yj=poly[j].lat
    if(((yi>pt.lat)!==(yj>pt.lat))&&(pt.lng<((xj-xi)*(pt.lat-yi))/(yj-yi)+xi)) inside=!inside
  }
  return inside
}

function coordInZone(coords: {lat:number,lng:number}|null, point: {lat:number,lng:number,zone?:{lat:number,lng:number}[]}): boolean {
  if (!coords) return false
  if (point.zone && point.zone.length > 2) return pointInPolygon(coords, point.zone)
  if (point.lat && point.lng) return distM(coords, { lat: point.lat, lng: point.lng }) <= 500
  return false
}

export function computePrice(
  distance: number,
  duration: number,
  pickupDate: Date | null,
  config: PriceConfig,
  forfaits: ForfaitData[],
  fromCoords: {lat:number,lng:number} | null,
  toCoords: {lat:number,lng:number} | null,
  tollCost = 0,
  durationInTraffic = 0,
): PriceResult {
  const nightStartMin = parseHM(config.heureDebutNuit, 19*60)
  const nightEndMin   = parseHM(config.heureFinNuit, 7*60)

  let isNight = false, isHoliday = false, isSunday = false
  if (pickupDate) {
    const currentMin = pickupDate.getHours()*60 + pickupDate.getMinutes()
    isNight    = isNightMinutes(currentMin, nightStartMin, nightEndMin)
    isHoliday  = isPublicHoliday(pickupDate)
    isSunday   = pickupDate.getDay() === 0
  }

  const marcheLenteCost = (config.marcheLenteActive && durationInTraffic > 0)
    ? Math.round(Math.max(0, durationInTraffic - duration) / 60 * config.tauxMarcheLente * 100) / 100
    : 0

  const DAY_RATE   = config.tarifKmJour
  const NIGHT_RATE = config.tarifKmNuit

  let degressifApplique = false
  let distanceFareNormal = 0

  const calcFareNuit = (dist: number): number => {
    const rate = NIGHT_RATE
    const mA = config.tarifNuitMajoreActive, sM = config.tarifNuitMajoreSeuilKm, pM = config.tarifNuitMajorePrixKm
    const dA = config.tarifNuitDegressifActive, sD = config.tarifNuitDegressifSeuilKm, pD = config.tarifNuitDegressifPrixKm
    if (mA && dist <= sM) return dist * pM
    if (dA && dist > sD) {
      degressifApplique = true
      distanceFareNormal = dist * rate
      return config.tarifNuitDegressifMode === 'retroactif' ? dist * pD : sD * rate + (dist - sD) * pD
    }
    return dist * rate
  }

  const calcFareJour = (dist: number): number => {
    const rate = DAY_RATE
    const mA = config.tarifJourMajoreActive, sM = config.tarifJourMajoreSeuilKm, pM = config.tarifJourMajorePrixKm
    const dA = config.tarifJourDegressifActive, sD = config.tarifJourDegressifSeuilKm, pD = config.tarifJourDegressifPrixKm
    if (mA && dist <= sM) return dist * pM
    if (dA && dist > sD) {
      degressifApplique = true
      distanceFareNormal = dist * rate
      return config.tarifJourDegressifMode === 'retroactif' ? dist * pD : sD * rate + (dist - sD) * pD
    }
    return dist * rate
  }

  const hasNuitSpecial = config.tarifNuitMajoreActive || config.tarifNuitDegressifActive
  const hasJourSpecial = config.tarifJourMajoreActive || config.tarifJourDegressifActive

  let distanceFare: number
  if (isHoliday || isSunday) {
    distanceFare = calcFareNuit(distance)
  } else if (pickupDate) {
    if (hasNuitSpecial && isNight)       distanceFare = calcFareNuit(distance)
    else if (hasJourSpecial && !isNight) distanceFare = calcFareJour(distance)
    else distanceFare = calculateDistanceFare(pickupDate, duration, distance, DAY_RATE, NIGHT_RATE, config.heureDebutNuit, config.heureFinNuit)
  } else {
    distanceFare = calcFareJour(distance)
  }

  const approachFees = (config.suppApprocheActive && distance >= config.suppApprocheSeuilKm) ? 0 : config.fraisApproche
  let finalPrice = Math.max(Math.round((config.priseEnCharge + distanceFare + approachFees + tollCost + marcheLenteCost) * 100) / 100, config.courseMini)

  // Prix sans dégressif (pour affichage barré)
  let priceBeforeDegressif = 0
  if (degressifApplique) {
    const normalFare = Math.max(Math.round((config.priseEnCharge + distanceFareNormal + approachFees + tollCost + marcheLenteCost) * 100) / 100, config.courseMini)
    if (normalFare > finalPrice) priceBeforeDegressif = normalFare
  }

  // Forfaits
  let isForfait = false
  for (const f of forfaits) {
    if (!f.actif) continue
    const matchAB = coordInZone(fromCoords, f.pointA) && coordInZone(toCoords, f.pointB)
    const matchBA = coordInZone(fromCoords, f.pointB) && coordInZone(toCoords, f.pointA)
    if (matchAB || matchBA) {
      finalPrice = (isNight || isHoliday || isSunday) ? f.prixNuit : f.prixJour
      isForfait = true
      break
    }
  }

  // Remise courses longues
  let priceBeforeRemise = 0
  if (config.remiseActive && !isForfait && distance >= config.remiseSeuilKm) {
    priceBeforeRemise = finalPrice
    finalPrice = Math.round(finalPrice * (1 - config.remisePourcentage / 100) * 100) / 100
  }

  // Tariff type
  let tariffType = 'Jour'
  if (isHoliday) tariffType = 'Férié'
  else if (isSunday) tariffType = 'Dimanche'
  else if (pickupDate && duration > 0) {
    const depMin = pickupDate.getHours()*60 + pickupDate.getMinutes()
    const arrMin = depMin + duration
    const depIsNight = isNightMinutes(depMin, nightStartMin, nightEndMin)
    const arrIsNight = isNightMinutes(arrMin, nightStartMin, nightEndMin)
    if (depIsNight && arrIsNight)       tariffType = 'Nuit'
    else if (!depIsNight && !arrIsNight) tariffType = 'Jour'
    else                                 tariffType = 'Mixte'
  } else if (isNight) tariffType = 'Nuit'

  const fourchette = isForfait || config.affichagePrixUnique
    ? null
    : finalPrice <= config.courseMini
      ? { de: config.courseMiniDe || 0, a: config.courseMini }
      : { de: Math.round((finalPrice - config.fraisApproche) * 100) / 100, a: finalPrice }

  return { totalPrice: finalPrice, fourchette, tariffType, isForfait, isNight, isHoliday, isSunday, marcheLenteCost, priceBeforeDegressif, priceBeforeRemise }
}
