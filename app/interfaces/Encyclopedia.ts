import type { ApiCoordinates, ApiImage, CommonStatus } from '~/interfaces/Post'

/** Видео с API (`VideoResource`). */
export interface ApiEncyclopediaVideo {
  id: number
  path: string
}

export interface Encyclopedia {
  title: string
  subtitle?: string
  category?: string | null
  slug: string
  content?: Record<string, unknown> | null
  preview_image?: ApiImage | null
  main_images?: ApiImage[]
  has_main_images?: boolean
  /** Файлы, загруженные в админке отдельно от текста статьи. */
  videos?: ApiEncyclopediaVideo[]
  has_videos?: boolean
  external_links?: unknown
  coordinates?: ApiCoordinates | null
  status?: CommonStatus
  published_at?: string | null
}
