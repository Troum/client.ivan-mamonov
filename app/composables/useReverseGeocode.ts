type MapboxContext = { id: string; text: string }
type MapboxFeature = {
  place_type?: string[]
  text?: string
  context?: MapboxContext[]
}

type YandexComponent = { kind: string; name: string }

const locationCache = new Map<string, string>()

function cacheKey(lat: number, lng: number): string {
  return `${lat.toFixed(5)},${lng.toFixed(5)}`
}

function formatMapboxFeature(feature: MapboxFeature): string {
  const locality =
    feature.text?.trim() ||
    feature.context?.find((c) => c.id.startsWith('place.'))?.text?.trim() ||
    feature.context?.find((c) => c.id.startsWith('locality.'))?.text?.trim() ||
    feature.context?.find((c) => c.id.startsWith('district.'))?.text?.trim()

  const region = feature.context?.find((c) => c.id.startsWith('region.'))?.text?.trim()
  const parts = [locality, region].filter(Boolean) as string[]
  return [...new Set(parts)].join(', ')
}

function formatYandexGeoObject(geoObject: {
  metaDataProperty?: {
    GeocoderMetaData?: {
      text?: string
      Address?: { Components?: YandexComponent[] }
    }
  }
}): string {
  const components = geoObject.metaDataProperty?.GeocoderMetaData?.Address?.Components
  if (components?.length) {
    const pick = (...kinds: string[]) =>
      components.find((c) => kinds.includes(c.kind))?.name?.trim()

    const locality = pick('locality', 'village', 'district', 'area')
    const region = pick('province')
    const parts = [locality, region].filter(Boolean) as string[]
    if (parts.length) return [...new Set(parts)].join(', ')
  }

  return geoObject.metaDataProperty?.GeocoderMetaData?.text?.trim() ?? ''
}

async function reverseGeocodeMapbox(
  lat: number,
  lng: number,
  accessToken: string
): Promise<string | null> {
  const url = new URL(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json`
  )
  url.searchParams.set('access_token', accessToken)
  url.searchParams.set('language', 'ru')
  url.searchParams.set('types', 'place,locality,district,region')

  const res = await fetch(url.toString())
  if (!res.ok) return null

  const data = (await res.json()) as { features?: MapboxFeature[] }
  const feature = data.features?.[0]
  if (!feature) return null

  const label = formatMapboxFeature(feature)
  return label || null
}

async function reverseGeocodeYandex(
  lat: number,
  lng: number,
  apiKey: string
): Promise<string | null> {
  const url = new URL('https://geocode-maps.yandex.ru/1.x/')
  url.searchParams.set('apikey', apiKey)
  url.searchParams.set('geocode', `${lng},${lat}`)
  url.searchParams.set('format', 'json')
  url.searchParams.set('lang', 'ru_RU')
  url.searchParams.set('results', '1')

  const res = await fetch(url.toString())
  if (!res.ok) return null

  const data = (await res.json()) as {
    response?: {
      GeoObjectCollection?: {
        featureMember?: Array<{ GeoObject?: Parameters<typeof formatYandexGeoObject>[0] }>
      }
    }
  }

  const geoObject = data.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject
  if (!geoObject) return null

  const label = formatYandexGeoObject(geoObject)
  return label || null
}

export function useReverseGeocode() {
  const runtimeConfig = useRuntimeConfig()

  async function resolveLocationLabel(lat: number, lng: number): Promise<string | null> {
    const key = cacheKey(lat, lng)
    const cached = locationCache.get(key)
    if (cached) return cached

    const mapboxToken = runtimeConfig.public.mapbox?.accessToken
    if (typeof mapboxToken === 'string' && mapboxToken.length > 0) {
      const label = await reverseGeocodeMapbox(lat, lng, mapboxToken)
      if (label) {
        locationCache.set(key, label)
        return label
      }
    }

    const yandexKey = (runtimeConfig.public.yandexMaps as { apikey?: string } | undefined)?.apikey
    if (typeof yandexKey === 'string' && yandexKey.length > 0) {
      const label = await reverseGeocodeYandex(lat, lng, yandexKey)
      if (label) {
        locationCache.set(key, label)
        return label
      }
    }

    return null
  }

  return { resolveLocationLabel }
}
