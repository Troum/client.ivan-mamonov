export interface ProductImage {
  id?: number
  type?: string
  path: string
}

export interface ProductListItem {
  id: number
  title: string
  subtitle: string | null
  slug: string
  price: string
  currency: string
  sort_order: number
  preview_image: ProductImage | null
  has_main_images: boolean
  status: string
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface ProductDetail extends ProductListItem {
  content: Record<string, unknown> | null
  main_images: ProductImage[]
}
