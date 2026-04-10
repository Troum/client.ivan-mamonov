import type { ApiCoordinates, ApiImage, CommonStatus } from '~/interfaces/Post'

export interface Encyclopedia {
  title: string
  subtitle?: string
  category?: string | null
  slug: string
  content?: Record<string, unknown> | null
  preview_image?: ApiImage | null
  main_images?: ApiImage[]
  has_main_images?: boolean
  videos?: unknown[]
  external_links?: unknown
  coordinates?: ApiCoordinates | null
  status?: CommonStatus
  published_at?: string | null
}
