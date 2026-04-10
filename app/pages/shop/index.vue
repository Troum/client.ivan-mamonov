<script setup lang="ts">
import { ShoppingCartIcon } from '@heroicons/vue/24/outline'
import type { ProductListItem } from '~/interfaces/Product'
import { storeToRefs } from 'pinia'
import { defaultSiteShopPage, loadSiteShopPage } from '~/composables/useSiteContent'

const { data: shopSeoData } = await useAsyncData('site-shop-seo', () => loadSiteShopPage(), {
  default: () => defaultSiteShopPage(),
})

const shopPage = shopSeoData.value ?? defaultSiteShopPage()
usePageSeo(shopPage.seo, {
  title: shopPage.seo.meta_title?.trim() || 'Магазин — Иван Мамонов',
  description:
    shopPage.seo.meta_description?.trim() ||
    'Печатные работы и материалы. Оформление и доставка по договоренности.',
  ogImage: shopPage.seo.og_image?.trim(),
})

const config = useRuntimeConfig()
const shopCart = useShopCart()
const cartStore = useCartStore()
const { itemCount } = storeToRefs(cartStore)

const adding = ref<number | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const items = ref<ProductListItem[]>([])
const cartHovered = ref(false)

type ProductsResponse = {
  message?: string
  status?: number
  data?: {
    paginated?: { data?: ProductListItem[] } | ProductListItem[]
    meta?: { current_page?: number; last_page?: number }
  }
}

onMounted(async () => {
  try {
    const res = (await $fetch(`${config.public.apiBase}/products`)) as ProductsResponse
    const inner = res.data
    if (!inner) {
      items.value = []
      return
    }
    const paginated = inner.paginated
    if (Array.isArray(paginated)) {
      items.value = paginated as ProductListItem[]
    } else if (paginated && Array.isArray(paginated.data)) {
      items.value = paginated.data
    } else {
      items.value = []
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Не удалось загрузить каталог'
  } finally {
    loading.value = false
  }
})

async function addToCart(p: ProductListItem) {
  adding.value = p.id
  try {
    await shopCart.addProduct(p.id, 1)
  } catch {
    /* optional toast */
  } finally {
    adding.value = null
  }
}

function formatPrice(p: ProductListItem) {
  const n = Number(p.price)
  const formatted = Number.isFinite(n) ? n.toLocaleString('ru-RU') : p.price
  const sym =
    p.currency === 'RUB' ? '₽' : p.currency === 'USD' ? '$' : p.currency === 'EUR' ? '€' : p.currency
  return `${formatted} ${sym}`
}

const breadcrumbs = [
  { label: 'Главная', to: '/' },
  { label: 'Магазин' },
]
</script>

<template>
  <div class="min-h-screen bg-white">
    <AppBreadcrumbs :items="breadcrumbs" />
    <section class="pt-32 pb-16 px-6 lg:px-12">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-6xl lg:text-8xl xl:text-9xl font-extrabold text-olivine-100 tracking-tight">
          МАГАЗИН
        </h1>

        <p class="mt-6 text-lg lg:text-xl text-gray-600 max-w-2xl">
          Печатные работы и материалы. Оформление и доставка по договоренности.
        </p>

        <div class="mt-8 flex items-center gap-3">
          <NuxtLink
            to="/shop/cart"
            class="flex items-center gap-2 px-4 py-2 bg-olivine-50 text-olivine-700 rounded-full font-medium transition-all duration-300 hover:bg-olivine-100"
            @mouseenter="cartHovered = true"
            @mouseleave="cartHovered = false"
          >
            <ShoppingCartIcon
              :class="['w-5 h-5 transition-transform duration-300', cartHovered ? 'scale-110' : '']"
            />
            <span>КОРЗИНА</span>
            <span class="bg-olivine-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
              {{ itemCount }}
            </span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="py-16 px-6 lg:px-12">
      <div class="max-w-7xl mx-auto">
        <div v-if="loading" class="text-center py-24 text-gray-500">Загрузка…</div>
        <p v-else-if="error" class="text-center py-24 text-red-600">{{ error }}</p>

        <template v-else-if="!items.length">
          <div class="flex flex-col items-center justify-center py-24 text-center">
            <div class="w-24 h-24 bg-olivine-50 rounded-full flex items-center justify-center mb-6">
              <ShoppingCartIcon class="w-10 h-10 text-olivine-300" />
            </div>
            <h2 class="text-2xl font-semibold text-gray-400">Пока нет товаров в каталоге</h2>
            <p class="mt-3 text-gray-400 max-w-md">
              Мы работаем над наполнением магазина. Скоро здесь появятся печатные работы, курсы и пресеты.
            </p>
          </div>

          <div class="mt-16 p-8 bg-olivine-50 rounded-2xl text-center">
            <h3 class="text-xl font-semibold text-olivine-800 mb-3">Скоро открытие</h3>
            <p class="text-olivine-600">
              Подпишитесь на рассылку, чтобы первым узнать о появлении новых товаров
            </p>
            <div class="mt-6">
              <FormsSubscribeInline />
            </div>
          </div>
        </template>

        <ul v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 list-none p-0 m-0">
          <li
            v-for="p in items"
            :key="p.id"
            class="flex flex-col rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <NuxtLink :to="`/shop/${p.slug}`" class="group block flex-1">
              <div class="aspect-[4/3] bg-gray-100 overflow-hidden">
                <img
                  v-if="p.preview_image?.path"
                  :src="p.preview_image.path"
                  :alt="p.title"
                  class="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                />
                <div v-else class="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                  Нет фото
                </div>
              </div>
              <div class="p-5 flex flex-col gap-2">
                <h2 class="text-xl font-semibold text-gray-900 uppercase leading-tight group-hover:text-olivine-600 transition-colors">
                  {{ p.title }}
                </h2>
                <p v-if="p.subtitle" class="text-sm text-gray-600 line-clamp-2">
                  {{ p.subtitle }}
                </p>
                <span class="text-lg font-medium text-olivine-700 mt-auto">
                  {{ formatPrice(p) }}
                </span>
              </div>
            </NuxtLink>
            <div class="px-5 pb-5">
              <button
                type="button"
                class="w-full py-2 rounded-lg border border-olivine-200 text-olivine-700 text-sm font-medium hover:bg-olivine-50 disabled:opacity-50"
                :disabled="adding === p.id"
                @click="addToCart(p)"
              >
                {{ adding === p.id ? '…' : 'В корзину' }}
              </button>
            </div>
          </li>
        </ul>

        <div
          v-if="items.length"
          class="mt-16 p-8 bg-olivine-50 rounded-2xl text-center max-w-3xl mx-auto"
        >
          <h3 class="text-xl font-semibold text-olivine-800 mb-3">Скоро открытие</h3>
          <p class="text-olivine-600">
            Подпишитесь на рассылку, чтобы первым узнать о появлении новых товаров
          </p>
          <div class="mt-6">
            <FormsSubscribeInline />
          </div>
        </div>
      </div>
    </section>

    <section class="py-16 px-6 lg:px-12 bg-gray-50">
      <div class="max-w-7xl mx-auto">
        <h2 class="text-2xl font-bold text-gray-900 mb-8">Что будет в магазине</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            v-for="(item, index) in [
              {
                title: 'Печатные работы',
                description: 'Фотографии на профессиональной бумаге, холсте и алюминии',
              },
              {
                title: 'Курсы',
                description: 'Обучение пейзажной фотографии, обработке и композиции',
              },
              {
                title: 'Пресеты',
                description: 'Готовые настройки для Lightroom и Photoshop',
              },
            ]"
            :key="index"
            class="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ item.title }}</h3>
            <p class="text-gray-600">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
