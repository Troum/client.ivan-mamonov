/**
 * Десятичные градусы → градусы, минуты, секунды (для отображения на сайте).
 * Логика согласована с админкой (dashboard geoDms).
 */

export type LatitudeHemisphere = 'N' | 'S'
export type LongitudeHemisphere = 'E' | 'W'

export type DmsLatitude = {
  deg: number
  min: number
  sec: number
  hem: LatitudeHemisphere
}

export type DmsLongitude = {
  deg: number
  min: number
  sec: number
  hem: LongitudeHemisphere
}

function roundSec(sec: number): number {
  return Math.round(sec * 10000) / 10000
}

export function decimalLatitudeToDms(latitude: number): DmsLatitude {
  const hem: LatitudeHemisphere = latitude >= 0 ? 'N' : 'S'
  const abs = Math.min(Math.abs(latitude), 90)
  let deg = Math.floor(abs + 1e-12)
  let rem = abs - deg
  let min = Math.floor(rem * 60 + 1e-12)
  let sec = (rem * 60 - min) * 60
  if (sec >= 59.99995) {
    sec = 0
    min += 1
  }
  if (min >= 60) {
    min = 0
    deg += 1
  }
  if (deg > 90) {
    deg = 90
    min = 0
    sec = 0
  }
  return { deg, min, sec: roundSec(sec), hem }
}

export function decimalLongitudeToDms(longitude: number): DmsLongitude {
  const hem: LongitudeHemisphere = longitude >= 0 ? 'E' : 'W'
  const abs = Math.min(Math.abs(longitude), 180)
  let deg = Math.floor(abs + 1e-12)
  let rem = abs - deg
  let min = Math.floor(rem * 60 + 1e-12)
  let sec = (rem * 60 - min) * 60
  if (sec >= 59.99995) {
    sec = 0
    min += 1
  }
  if (min >= 60) {
    min = 0
    deg += 1
  }
  if (deg > 180) {
    deg = 180
    min = 0
    sec = 0
  }
  return { deg, min, sec: roundSec(sec), hem }
}

/** Секунды для ru: без лишних нулей, десятичный разделитель — запятая. */
export function formatSecondsRu(sec: number): string {
  const s = roundSec(sec)
  if (Math.abs(s - Math.round(s)) < 1e-8) {
    return String(Math.round(s))
  }
  return s.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 4 })
}

export type CoordinateAxisDisplay = {
  label: string
  deg: number
  min: number
  secDisplay: string
  hem: string
}

export function latitudeToDisplay(latitude: number): CoordinateAxisDisplay {
  const { deg, min, sec, hem } = decimalLatitudeToDms(latitude)
  return {
    label: 'Широта',
    deg,
    min,
    secDisplay: formatSecondsRu(sec),
    hem,
  }
}

export function longitudeToDisplay(longitude: number): CoordinateAxisDisplay {
  const { deg, min, sec, hem } = decimalLongitudeToDms(longitude)
  return {
    label: 'Долгота',
    deg,
    min,
    secDisplay: formatSecondsRu(sec),
    hem,
  }
}
