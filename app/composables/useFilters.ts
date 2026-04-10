export function useFilters() {
  const currencyFormatter: Intl.NumberFormat = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'USD',
  })

  const dateFormatter: Intl.DateTimeFormat = new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  const timeFormatter: Intl.DateTimeFormat = new Intl.DateTimeFormat('ru-RU', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  })

  const formatCurrency = (value: unknown): string => {
    return currencyFormatter.format(Number(value))
  }

  const formatDate = (value: unknown): string => {
    return dateFormatter.format(new Date(value as string | number | Date))
  }

  const formatTime = (value: unknown): string => {
    return timeFormatter.format(new Date(value as string | number | Date))
  }

  const convertToDegreesMinutes = (decimalDegree: number) => {
    const degrees = Math.floor(decimalDegree)
    const minutes = Math.floor((decimalDegree - degrees) * 60)
    return `${degrees}°${minutes}′`
  }

  const formatCoordinates = (
    value: { lat: number; lng: number },
    latitudeLabel = 'N',
    longitudeLabel = 'E'
  ) => {
    if (value) {
      const latitude = convertToDegreesMinutes(value.lat)
      const longitude = convertToDegreesMinutes(value.lng)
      return `${latitude} ${latitudeLabel}, ${longitude} ${longitudeLabel}`
    }
  }

  /**
   * Отображение в десятичных градусах с фиксированным числом знаков после запятой.
   * Исходные числа в данных не меняются — округление только для строки.
   */
  const formatCoordinatesDecimal = (
    value: { lat: number; lng: number },
    latitudeLabel = 'N',
    longitudeLabel = 'E',
    fractionDigits = 2
  ): string => {
    const lat = Number(value.lat)
    const lng = Number(value.lng)
    if (Number.isNaN(lat) || Number.isNaN(lng)) return ''
    return `${lat.toFixed(fractionDigits)}°${latitudeLabel}, ${lng.toFixed(fractionDigits)}°${longitudeLabel}`
  }

  /** Укорачивает десятичные числа в строке `coordinates.formatted` с API (только отображение). */
  const shortenFormattedCoordinateDecimals = (str: string, fractionDigits = 2): string => {
    return str.replace(/-?\d+(?:\.\d+)?/g, (match) => {
      const n = Number(match)
      if (Number.isNaN(n)) return match
      return n.toFixed(fractionDigits)
    })
  }

  const isEven = (number: number): boolean => {
    return (number & 1) === 0
  }

  const isOdd = (number: number): boolean => {
    return (number & 1) === 1
  }

  return {
    formatCurrency,
    formatDate,
    formatTime,
    formatCoordinates,
    formatCoordinatesDecimal,
    shortenFormattedCoordinateDecimals,
    isEven,
    isOdd,
  }
}
