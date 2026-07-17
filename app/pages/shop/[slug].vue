<script setup lang="ts">
import { ArrowLeft, ChevronRight, Image, ShoppingBag } from '@lucide/vue'
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
  <div class="min-h-screen pt-[72px]">
    <div class="container-x py-12 sm:py-16">
      <div v-if="loading" class="py-24 text-center text-muted-foreground">Загрузка товара…</div>
      <div
        v-else-if="error || !product"
        class="mx-auto max-w-lg rounded-[2rem] border border-line bg-white px-8 py-16 text-center"
      >
        <span class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-moss-wash text-moss">
          <Image class="h-6 w-6" />
        </span>
        <h1 class="mt-6 font-display text-3xl font-semibold text-ink">Товар не найден</h1>
        <p class="mt-3 text-sm leading-relaxed text-muted-foreground">
          {{ error || 'Не найдено' }}
        </p>
        <div class="mt-8 flex justify-center">
          <NuxtLink to="/shop" class="btn-outline">
            <ArrowLeft class="h-4 w-4" />
            В каталог
          </NuxtLink>
        </div>
      </div>

      <article v-else>
        <Reveal>
          <nav class="flex flex-wrap items-center gap-1.5 text-[13px] text-muted-foreground">
            <template v-for="(item, index) in breadcrumbs" :key="item.label">
              <ChevronRight v-if="index" class="h-3.5 w-3.5" />
              <NuxtLink v-if="item.to" :to="item.to" class="transition-colors hover:text-moss">
                {{ item.label }}
              </NuxtLink>
              <span v-else class="text-ink">{{ item.label }}</span>
            </template>
          </nav>
        </Reveal>

        <div class="mt-10 grid items-start gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
          <Reveal>
            <div class="space-y-4">
              <div
                class="overflow-hidden rounded-[2rem] border border-line bg-paper-deep"
                :class="product.preview_image?.path ? 'aspect-[4/5] lg:aspect-square' : 'aspect-square'"
              >
                <img
                  v-if="product.preview_image?.path"
                  :src="product.preview_image.path"
                  :alt="product.title"
                  class="h-full w-full object-cover"
                />
                <div v-else class="flex h-full items-center justify-center text-muted-foreground">
                  <Image class="h-10 w-10" />
                </div>
              </div>
              <div
                v-if="product.has_main_images && product.main_images?.length"
                class="grid grid-cols-2 gap-4"
              >
                <div
                  v-for="(img, i) in product.main_images"
                  :key="img.id ?? i"
                  class="group aspect-square overflow-hidden rounded-2xl border border-line bg-paper-deep"
                >
                  <img
                    :src="img.path"
                    :alt="`${product.title} ${i + 1}`"
                    class="img-zoom h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </Reveal>

          <div class="lg:sticky lg:top-28">
            <Reveal :delay="0.08">
              <p class="eyebrow">Авторская коллекция</p>
              <h1 class="display-1 mt-4 text-4xl sm:text-5xl lg:text-6xl">
                {{ product.title }}
              </h1>
              <p v-if="product.subtitle" class="mt-5 text-[16px] leading-relaxed text-ink-soft">
                {{ product.subtitle }}
              </p>

              <div class="my-8 h-px bg-line" />

              <p class="font-display text-3xl font-semibold text-moss">
                {{ formatPrice(product) }}
              </p>

              <div class="mt-7 flex flex-wrap gap-3">
                <button
                  type="button"
                  class="btn-moss disabled:cursor-wait disabled:opacity-50"
                  :disabled="adding"
                  @click="addToCart"
                >
                  <ShoppingBag class="h-4 w-4" />
                  {{ adding ? 'Добавляем…' : 'В корзину' }}
                </button>
                <NuxtLink to="/shop/cart" class="btn-outline">
                  Открыть корзину
                </NuxtLink>
              </div>

              <div v-if="product.content" class="mt-10 border-t border-line pt-8 text-ink-soft">
                <TiptapHtml :content="product.content as object" />
              </div>

              <p class="mt-8 border-t border-line pt-6 text-sm leading-relaxed text-muted-foreground">
                По вопросам покупки и доставки можно связаться через раздел
                <NuxtLink to="/contacts" class="link-underline font-medium text-moss">Контакты</NuxtLink>.
              </p>
            </Reveal>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>
