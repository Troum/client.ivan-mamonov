import type { CartApiResponse } from '~/interfaces/Cart'
import { useCartStore } from '~/stores/useCartStore'

export function useShopCart() {
  const config = useRuntimeConfig()
  const store = useCartStore()

  const base = () => `${config.public.apiBase}`

  async function ensureToken(): Promise<string> {
    store.hydrateFromStorage()
    if (store.token) return store.token

    const res = (await $fetch(`${base()}/cart/issue-token`, {
      method: 'POST',
      headers: { Accept: 'application/json' },
    })) as Record<string, unknown>
    const inner = res['data'] as { token?: string } | undefined
    const token = inner?.token
    if (!token) throw new Error('Не удалось создать корзину')
    store.setToken(token)
    return token
  }

  function authHeaders(token: string) {
    return {
      'X-Cart-Token': token,
      Accept: 'application/json',
    }
  }

  async function fetchCart(): Promise<CartApiResponse['data']> {
    const token = await ensureToken()
    const res = (await $fetch(`${base()}/cart`, {
      headers: authHeaders(token),
    })) as Record<string, unknown>
    let data = res['data'] as CartApiResponse['data'] | Record<string, unknown> | undefined
    if (data && typeof data === 'object' && 'data' in data && (data as { data?: unknown }).data) {
      data = (data as { data: CartApiResponse['data'] }).data
    }
    if (data && typeof data === 'object' && 'items_count' in data) {
      store.setItemCount((data as { items_count?: number }).items_count ?? 0)
    }
    return data as CartApiResponse['data']
  }

  async function addProduct(productId: number, quantity = 1) {
    const token = await ensureToken()
    await $fetch(`${base()}/cart/items`, {
      method: 'POST',
      headers: {
        ...authHeaders(token),
        'Content-Type': 'application/json',
      },
      body: { product_id: productId, quantity },
    })
    await fetchCart()
  }

  async function setQuantity(productId: number, quantity: number) {
    const token = await ensureToken()
    await $fetch(`${base()}/cart/items/${productId}`, {
      method: 'PATCH',
      headers: {
        ...authHeaders(token),
        'Content-Type': 'application/json',
      },
      body: { quantity },
    })
    await fetchCart()
  }

  async function removeItem(productId: number) {
    const token = await ensureToken()
    await $fetch(`${base()}/cart/items/${productId}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    })
    await fetchCart()
  }

  type CheckoutBody = {
    email: string
    phone?: string
    name?: string
    return_url: string
    payment_gateway?: string
  }

  async function checkout(body: CheckoutBody) {
    const token = await ensureToken()
    return await $fetch(`${base()}/checkout`, {
      method: 'POST',
      headers: {
        ...authHeaders(token),
        'Content-Type': 'application/json',
      },
      body,
    })
  }

  async function orderStatus(publicId: string) {
    return await $fetch(`${base()}/orders/status/${publicId}`)
  }

  return {
    ensureToken,
    fetchCart,
    addProduct,
    setQuantity,
    removeItem,
    checkout,
    orderStatus,
  }
}
