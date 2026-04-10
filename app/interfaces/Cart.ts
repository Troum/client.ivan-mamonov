export interface CartLine {
  product_id: number
  title: string
  slug: string
  quantity: number
  unit_price: string
  currency: string
  line_total: string
  preview_image: { path?: string; id?: number } | null
}

export interface CartApiResponse {
  message?: string
  status?: number
  data?: {
    token: string
    items: CartLine[]
    currency: string | null
    total: string
    items_count: number
  }
}
