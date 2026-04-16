/** Публичные метки карты энциклопедии (`GET /map-locations`). */
export interface MapLocation {
  id: number
  title: string
  latitude: number
  longitude: number
  encyclopedia_slug: string | null
  description: string | null
  sort_order: number
  is_published: boolean
}
