<script setup lang="ts">
import { ArrowRight, BellRing, GraduationCap, Image, ShoppingBag, Wand2 } from '@lucide/vue'
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

</script>

<template>
  <div>
    <PageHero
      eyebrow="Авторский магазин"
      current="Магазин"
      image="/images/hero-shop.jpg"
      title="Печатные работы и материалы"
      title-html="Печатные работы <em class=&quot;italic text-moss&quot;>и материалы</em>"
      subtitle="Фотографии, знания и инструменты, созданные в экспедициях по Дальнему Востоку."
    >
      <NuxtLink
        to="/shop/cart"
        class="group btn-outline mt-8"
        @mouseenter="cartHovered = true"
        @mouseleave="cartHovered = false"
      >
        <ShoppingBag
          :class="['h-4 w-4 transition-transform duration-300', cartHovered ? 'scale-110' : '']"
        />
        Корзина
        <span class="flex h-6 min-w-6 items-center justify-center rounded-full bg-moss px-1.5 text-xs text-white">
          {{ itemCount }}
        </span>
      </NuxtLink>
    </PageHero>

    <section class="container-x pb-20 sm:pb-28">
      <Reveal>
        <div class="grid overflow-hidden rounded-[2rem] bg-ink lg:grid-cols-[0.9fr_1.1fr]">
          <div class="relative min-h-72 overflow-hidden lg:min-h-[430px]">
            <img
              src="/images/hero-shop.jpg"
              alt="Пейзажная фотография Ивана Мамонова"
              class="h-full w-full object-cover opacity-80"
            />
            <div class="absolute inset-0 bg-gradient-to-r from-transparent to-ink/45" />
          </div>
          <div class="flex flex-col justify-center px-7 py-12 sm:px-12 lg:px-16">
            <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-moss/20 text-moss-soft">
              <BellRing class="h-5 w-5" />
            </span>
            <p class="mt-7 text-[11px] font-semibold uppercase tracking-[0.22em] text-moss-soft">
              Будьте первыми
            </p>
            <h2 class="mt-3 font-display text-4xl font-medium text-paper sm:text-5xl">
              Скоро <em class="italic text-sand">открытие</em>
            </h2>
            <p class="mt-5 max-w-lg text-[15px] leading-relaxed text-paper/60">
              Подпишитесь на рассылку — сообщу о первых тиражах, курсах и наборах пресетов.
            </p>
            <div class="mt-8 max-w-xl">
              <FormsSubscribeInline dark />
            </div>
          </div>
        </div>
      </Reveal>
    </section>

    <section v-if="loading || error || items.length" class="border-y border-line bg-white/60 py-20 sm:py-24">
      <div class="container-x">
        <Reveal>
          <div class="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p class="eyebrow">Каталог</p>
              <h2 class="display-1 mt-3 text-4xl sm:text-5xl">
                Доступно <em class="italic text-moss">сейчас</em>
              </h2>
            </div>
            <NuxtLink to="/shop/cart" class="btn-outline">
              <ShoppingBag class="h-4 w-4" />
              Корзина · {{ itemCount }}
            </NuxtLink>
          </div>
        </Reveal>

        <div v-if="loading" class="py-20 text-center text-muted-foreground">Загрузка каталога…</div>
        <p v-else-if="error" class="py-20 text-center text-destructive">{{ error }}</p>

        <ul v-else class="mt-12 grid list-none gap-6 p-0 sm:grid-cols-2 xl:grid-cols-3">
          <Reveal v-for="(p, index) in items" :key="p.id" :delay="0.05 * index">
            <li class="card-hover flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-white">
              <NuxtLink :to="`/shop/${p.slug}`" class="group flex flex-1 flex-col">
                <div class="aspect-[4/3] overflow-hidden bg-paper-deep">
                  <img
                    v-if="p.preview_image?.path"
                    :src="p.preview_image.path"
                    :alt="p.title"
                    class="img-zoom h-full w-full object-cover"
                  />
                  <div v-else class="flex h-full w-full items-center justify-center text-muted-foreground">
                    <Image class="h-8 w-8" />
                  </div>
                </div>
                <div class="flex flex-1 flex-col p-6">
                  <p class="eyebrow">Авторская работа</p>
                  <h3 class="mt-3 font-display text-2xl font-semibold leading-tight text-ink transition-colors group-hover:text-moss">
                    {{ p.title }}
                  </h3>
                  <p v-if="p.subtitle" class="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {{ p.subtitle }}
                  </p>
                  <span class="mt-6 font-display text-xl font-semibold text-moss">
                    {{ formatPrice(p) }}
                  </span>
                </div>
              </NuxtLink>
              <div class="px-6 pb-6">
                <button
                  type="button"
                  class="btn-moss w-full justify-center disabled:cursor-wait disabled:opacity-50"
                  :disabled="adding === p.id"
                  @click="addToCart(p)"
                >
                  <ShoppingBag class="h-4 w-4" />
                  {{ adding === p.id ? 'Добавляем…' : 'В корзину' }}
                </button>
              </div>
            </li>
          </Reveal>
        </ul>
      </div>
    </section>

    <section class="container-x py-20 sm:py-28">
      <Reveal>
        <p class="eyebrow">Коллекция</p>
        <div class="mt-3 flex flex-wrap items-end justify-between gap-5">
          <h2 class="display-1 text-4xl sm:text-5xl">
            Что будет <em class="italic text-moss">в магазине</em>
          </h2>
          <p class="max-w-md text-[15px] leading-relaxed text-muted-foreground">
            Всё, что помогает увидеть природу глубже и сохранить впечатление от неё надолго.
          </p>
        </div>
      </Reveal>

      <div class="mt-12 grid gap-6 md:grid-cols-3">
        <Reveal :delay="0.04">
          <article class="group card-hover overflow-hidden rounded-3xl border border-line bg-white">
            <div class="aspect-[4/3] overflow-hidden"><img src="/images/hero-shop.jpg" alt="Печатные работы" class="img-zoom h-full w-full object-cover" /></div>
            <div class="p-6">
              <Image class="h-5 w-5 text-moss" />
              <h3 class="mt-4 font-display text-2xl font-semibold text-ink">Печатные работы</h3>
              <p class="mt-3 text-sm leading-relaxed text-muted-foreground">Фотографии на профессиональной бумаге, холсте и алюминии.</p>
            </div>
          </article>
        </Reveal>
        <Reveal :delay="0.1">
          <article class="group card-hover overflow-hidden rounded-3xl border border-line bg-white">
            <div class="aspect-[4/3] overflow-hidden"><img src="/images/shop-courses.jpg" alt="Курсы по фотографии" class="img-zoom h-full w-full object-cover" /></div>
            <div class="p-6">
              <GraduationCap class="h-5 w-5 text-moss" />
              <h3 class="mt-4 font-display text-2xl font-semibold text-ink">Курсы</h3>
              <p class="mt-3 text-sm leading-relaxed text-muted-foreground">Обучение пейзажной фотографии, обработке и композиции.</p>
            </div>
          </article>
        </Reveal>
        <Reveal :delay="0.16">
          <article class="group card-hover overflow-hidden rounded-3xl border border-line bg-white">
            <div class="aspect-[4/3] overflow-hidden"><img src="/images/shop-presets.jpg" alt="Пресеты для обработки" class="img-zoom h-full w-full object-cover" /></div>
            <div class="p-6">
              <Wand2 class="h-5 w-5 text-moss" />
              <h3 class="mt-4 font-display text-2xl font-semibold text-ink">Пресеты</h3>
              <p class="mt-3 text-sm leading-relaxed text-muted-foreground">Готовые настройки для Lightroom и Photoshop.</p>
              <span class="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-moss">
                Скоро <ArrowRight class="h-3.5 w-3.5" />
              </span>
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  </div>
</template>
