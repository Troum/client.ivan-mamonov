/** Изображение с Laravel API (ImageResource). */
export interface ApiImage {
  id?: number
  type?: string
  path: string
}

/** Координаты с API (PostResource / EncyclopediaResource). */
export interface ApiCoordinates {
  latitude?: number | string | null
  longitude?: number | string | null
  latitude_label?: string | null
  longitude_label?: string | null
  formatted?: string | null
}

/** Совпадает с App\\Enums\\CommonStatusEnum на API. */
export type CommonStatus = 'published' | 'draft'

export interface Post {
  title: string
  subtitle?: string
  slug: string
  content?: Record<string, unknown> | null
  preview_image?: ApiImage | null
  main_images?: ApiImage[]
  has_main_images?: boolean
  coordinates?: ApiCoordinates | null
  status?: CommonStatus
  published_at?: string | null
}
