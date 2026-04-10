<script setup lang="ts">
import type { CartLine } from '~/interfaces/Cart'

const shopCart = useShopCart()
const loading = ref(true)
const error = ref<string | null>(null)
const lines = ref<CartLine[]>([])
const total = ref('0')
const currency = ref<string | null>(null)

async function load() {
  loading.value = true
  error.value = null
  try {
    const data = await shopCart.fetchCart()
    lines.value = data?.items ?? []
    total.value = data?.total ?? '0'
    currency.value = data?.currency ?? null
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Ошибка загрузки корзины'
  } finally {
    loading.value = false
  }
}

onMounted(load)

function formatMoney(amount: string, cur: string | null) {
  const n = Number(amount)
  const formatted = Number.isFinite(n) ? n.toLocaleString('ru-RU') : amount
  const sym = cur === 'RUB' ? '₽' : cur === 'USD' ? '$' : cur === 'EUR' ? '€' : cur ?? ''
  return `${formatted} ${sym}`.trim()
}
const breadcrumbs = [
  { label: 'Главная', to: '/' },
  { label: 'Магазин', to: '/shop' },
  { label: 'Корзина' },
]
</script>

<template>
  <div class="min-h-screen bg-white">
    <AppBreadcrumbs :items="breadcrumbs" />
    <div class="p-8 md:px-12 md:py-16 max-w-3xl mx-auto">
      <h1 class="text-3xl md:text-4xl font-extrabold uppercase text-gray-900 mb-8">Корзина</h1>

      <div v-if="loading" class="text-gray-500">Загрузка…</div>
      <p v-else-if="error" class="text-red-600">{{ error }}</p>
      <p v-else-if="!lines.length" class="text-gray-600">
        Корзина пуста.
        <NuxtLink to="/shop" class="underline text-olivine-600 ml-1">В каталог</NuxtLink>
      </p>

      <ul v-else class="space-y-6">
        <li
          v-for="line in lines"
          :key="line.product_id"
          class="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50"
        >
          <div class="flex-1">
            <NuxtLink :to="`/shop/${line.slug}`" class="text-lg font-semibold text-gray-900 hover:text-olivine-600">
              {{ line.title }}
            </NuxtLink>
            <p class="text-sm text-gray-500 mt-1">
              {{ formatMoney(line.unit_price, line.currency) }} × {{ line.quantity }}
            </p>
          </div>
          <div class="flex items-center gap-3">
            <input
              type="number"
              min="0"
              class="w-20 bg-white border border-gray-200 rounded px-2 py-1.5 text-gray-900"
              :value="line.quantity"
              @change="
                shopCart
                  .setQuantity(line.product_id, Number(($event.target as HTMLInputElement).value) || 0)
                  .then(load)
              "
            />
            <span class="text-gray-900 min-w-[7rem] text-right">
              {{ formatMoney(line.line_total, line.currency) }}
            </span>
            <button
              type="button"
              class="text-gray-400 hover:text-red-500 p-2"
              aria-label="Удалить"
              @click="shopCart.removeItem(line.product_id).then(load)"
            >
              ✕
            </button>
          </div>
        </li>
      </ul>

      <div v-if="lines.length" class="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p class="text-xl font-semibold text-gray-900">
          Итого: {{ formatMoney(total, currency) }}
        </p>
        <NuxtLink
          to="/shop/checkout"
          class="inline-flex justify-center px-8 py-3 rounded-lg bg-olivine-500 text-white font-medium hover:bg-olivine-600"
        >
          Оформить
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
