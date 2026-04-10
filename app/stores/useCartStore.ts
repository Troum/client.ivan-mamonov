import { defineStore } from 'pinia'

const STORAGE_KEY = 'shop_cart_token'

function readToken(): string | null {
  if (typeof localStorage === 'undefined') return null
  return localStorage.getItem(STORAGE_KEY)
}

function writeToken(token: string | null) {
  if (typeof localStorage === 'undefined') return
  if (token) localStorage.setItem(STORAGE_KEY, token)
  else localStorage.removeItem(STORAGE_KEY)
}

export const useCartStore = defineStore('shopCart', {
  state: () => ({
    token: null as string | null,
    itemCount: 0,
  }),
  actions: {
    hydrateFromStorage() {
      this.token = readToken()
    },
    setToken(token: string | null) {
      this.token = token
      writeToken(token)
    },
    setItemCount(n: number) {
      this.itemCount = n
    },
  },
})
