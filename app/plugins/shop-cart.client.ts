import { useCartStore } from '~/stores/useCartStore'

export default defineNuxtPlugin(() => {
  const store = useCartStore()
  store.hydrateFromStorage()
  const shopCart = useShopCart()
  shopCart.fetchCart().catch(() => {})
})
