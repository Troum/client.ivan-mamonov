<script setup lang="ts">
import type { ProductDetail } from '~/interfaces/Product'

const route = useRoute()
const config = useRuntimeConfig()
const slug = computed(() => route.params.slug as string)

type OneProductResponse = {
  data?: ProductDetail
}

const shopCart = useShopCart()
const adding = ref(false)

const loading = ref(true)
const error = ref<string | null>(null)
const product = ref<ProductDetail | null>(null)

async function load() {
  loading.value = true
  error.value = null
  try {
    const res = (await $fetch(`${config.public.apiBase}/products/${slug.value}`)) as OneProductResponse & {
      message?: string
    }
    const data = res.data
    if (!data || typeof data !== 'object') {
      product.value = null
      error.value = 'Товар не найден'
      return
    }
    product.value = data as ProductDetail
  } catch {
    product.value = null
    error.value = 'Товар не найден или недоступен'
  } finally {
    loading.value = false
  }
}

watch(slug, load, { immediate: true })

async function addToCart() {
  if (!product.value) return
  adding.value = true
  try {
    await shopCart.addProduct(product.value.id, 1)
  } finally {
    adding.value = false
  }
}

function formatPrice(p: ProductDetail) {
  const n = Number(p.price)
  const formatted = Number.isFinite(n) ? n.toLocaleString('ru-RU') : p.price
  const sym = p.currency === 'RUB' ? '₽' : p.currency === 'USD' ? '$' : p.currency === 'EUR' ? '€' : p.currency
  return `${formatted} ${sym}`
}

const breadcrumbs = computed(() => {
  const p = product.value
  const title = p?.title?.trim() || 'Товар'
  return [
    { label: 'Главная', to: '/' },
    { label: 'Магазин', to: '/shop' },
    { label: title },
  ]
})
</script>

<template>
  <div class="min-h-screen bg-white">
    <AppBreadcrumbs v-if="product && !loading && !error" :items="breadcrumbs" />
    <div class="p-8 md:p-16 max-w-6xl mx-auto">
      <div v-if="loading" class="text-center py-24 text-gray-500">Загрузка…</div>
      <div v-else-if="error || !product" class="text-center text-gray-700 max-w-md mx-auto py-24">
        {{ error || 'Не найдено' }}
        <div class="mt-8">
          <NuxtLink to="/shop" class="underline text-olivine-600 hover:text-olivine-700">← В каталог</NuxtLink>
        </div>
      </div>

      <article v-else class="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        <div class="space-y-4">
          <div
            v-if="product.preview_image?.path"
            class="rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 aspect-[4/5] lg:aspect-square"
          >
            <img :src="product.preview_image.path" :alt="product.title" class="w-full h-full object-cover" />
          </div>
          <div v-if="product.has_main_images && product.main_images?.length" class="grid grid-cols-2 gap-3">
            <div
              v-for="(img, i) in product.main_images"
              :key="img.id ?? i"
              class="aspect-square rounded-xl overflow-hidden border border-gray-100"
            >
              <img :src="img.path" :alt="`${product.title} ${i + 1}`" class="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-6">
          <h1 class="text-3xl md:text-4xl font-extrabold text-gray-900 uppercase leading-tight">
            {{ product.title }}
          </h1>
          <p v-if="product.subtitle" class="text-lg text-gray-600">
            {{ product.subtitle }}
          </p>

          <p class="text-2xl md:text-3xl font-semibold text-olivine-700">
            {{ formatPrice(product) }}
          </p>

          <div class="flex flex-wrap gap-3">
            <button
              type="button"
              class="px-6 py-3 rounded-lg border border-olivine-300 text-olivine-800 uppercase text-sm font-medium hover:bg-olivine-50 disabled:opacity-50"
              :disabled="adding"
              @click="addToCart"
            >
              {{ adding ? '…' : 'В корзину' }}
            </button>
            <NuxtLink
              to="/shop/cart"
              class="px-6 py-3 rounded-lg bg-olivine-500 text-white uppercase text-sm font-medium hover:bg-olivine-600"
            >
              Корзина
            </NuxtLink>
          </div>

          <TiptapHtml v-if="product.content" :content="product.content as object" />

          <p class="text-sm text-gray-500 pt-4">
            По вопросам покупки и доставки можно связаться через раздел
            <NuxtLink to="/contacts" class="underline hover:text-olivine-600">Контакты</NuxtLink>.
          </p>
        </div>
      </article>
    </div>
  </div>
</template>
