<script setup lang="ts">
import { ArrowRight, ArrowUpRight, MapPin } from '@lucide/vue'
import type { Encyclopedia } from '~/interfaces/Encyclopedia'
import type { ApiCoordinates } from '~/interfaces/Post'
import {
  defaultSiteAbout,
  defaultSiteHome,
  loadSiteAbout,
  loadSiteHome,
} from '~/composables/useSiteContent'
import { resolvePublicMediaUrl } from '~/composables/usePageSeo'

definePageMeta({
  layout: 'default',
})

const contentApi = useContentApi()

const { data: homeData } = await useAsyncData('site-home-seo', () => loadSiteHome(), {
  default: () => defaultSiteHome(),
})

const home = homeData.value ?? defaultSiteHome()
usePageSeo(home.seo, {
  title: home.seo.meta_title?.trim() || 'Иван Мамонов — пейзажный фотограф',
  description:
    home.seo.meta_description?.trim() ||
    'Пейзажная фотография, блог путешествий, энциклопедия Приморья и магазин печатных работ.',
  ogImage: home.seo.og_image?.trim(),
})

const { data: aboutData } = await useAsyncData('site-about', () => loadSiteAbout(), {
  default: () => defaultSiteAbout(),
})

const aboutPortrait = computed(
  () =>
    resolvePublicMediaUrl(aboutData.value?.portrait_image || '') ||
    '/images/about-portrait.jpg',
)

const aboutTeaserText = computed(() => {
  const paragraphs = aboutData.value?.bio_paragraphs ?? []
  return (
    paragraphs[1] ||
    paragraphs[0] ||
    'Моя страсть — горы, озёра и леса. Я верю, что фотография способна не только сохранить момент, но и передать эмоции, которые мы испытываем, находясь наедине с природой. Мои работы публиковались в National Geographic, Russia Geographic и других изданиях.'
  )
})

const aboutYearsStat = computed(() => {
  const stats = aboutData.value?.stats ?? []
  const years = stats.find((s) => /лет|опыт/i.test(s.label))
  return years?.value || '10+'
})

const { data: encPreview } = await useAsyncData('home-enc-preview', () =>
  contentApi.fetchEncyclopedia(),
)

const previewArticles = computed(() => {
  const rows = (encPreview.value ?? []) as unknown as Encyclopedia[]
  return rows.slice(0, 3).map((e) => {
    const img =
      e.preview_image && typeof e.preview_image === 'object' && 'path' in e.preview_image
        ? String(e.preview_image.path)
        : ''
    return {
      slug: e.slug,
      title: e.title,
      subtitle: e.subtitle,
      image: resolvePublicMediaUrl(img) || '/images/hero-encyclopedia.jpg',
      category: e.category,
    }
  })
})

type FeaturedHero = {
  href: string
  image: string
  title: string
  caption: string
  coordsLabel: string | null
  alt: string
}

function previewImagePath(row: { preview_image?: { path?: string } | null }): string {
  const path = row.preview_image?.path
  return path ? resolvePublicMediaUrl(String(path)) : ''
}

function coordsLabelFrom(coordinates?: ApiCoordinates | null): string | null {
  if (!coordinates) return null
  if (coordinates.latitude != null && coordinates.longitude != null) {
    const lat = Number(coordinates.latitude)
    const lng = Number(coordinates.longitude)
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null
    const latL = coordinates.latitude_label ?? 'N'
    const lngL = coordinates.longitude_label ?? 'E'
    return `${lat.toFixed(1)}° ${latL} · ${lng.toFixed(1)}° ${lngL}`
  }
  if (coordinates.formatted?.trim()) return coordinates.formatted.trim()
  return null
}

function pickRandom<T>(items: T[]): T | null {
  if (!items.length) return null
  return items[Math.floor(Math.random() * items.length)] ?? null
}

const featuredFallback: FeaturedHero = {
  href: '/encyclopedia',
  image: '/images/hero-home.jpg',
  title: 'Побережье Приморья',
  caption: 'Там, где тайга встречается с морем',
  coordsLabel: '43.1° N · 132.0° E',
  alt: 'Побережье Приморья на рассвете',
}

/** Случайная запись: `GET /encyclopedia/random` или `GET /posts/random`. */
const { data: featuredHeroData } = await useAsyncData('home-featured-hero', async () => {
  const [enc, post] = await Promise.all([
    contentApi.fetchEncyclopediaRandom(),
    contentApi.fetchPostRandom(),
  ])

  const candidates: FeaturedHero[] = []

  if (enc && typeof enc.slug === 'string' && enc.slug) {
    const image = previewImagePath(enc as { preview_image?: { path?: string } | null })
    if (image) {
      const title = String(enc.title ?? '')
      const subtitle = typeof enc.subtitle === 'string' ? enc.subtitle.trim() : ''
      candidates.push({
        href: `/encyclopedia/${enc.slug}`,
        image,
        title: title || 'Энциклопедия Приморья',
        caption: subtitle,
        coordsLabel: coordsLabelFrom(enc.coordinates as ApiCoordinates | null),
        alt: title || 'Энциклопедия Приморья',
      })
    }
  }

  if (post && typeof post.slug === 'string' && post.slug) {
    const image = previewImagePath(post as { preview_image?: { path?: string } | null })
    if (image) {
      const title = String(post.title ?? '')
      const subtitle = typeof post.subtitle === 'string' ? post.subtitle.trim() : ''
      candidates.push({
        href: `/blog/${post.slug}`,
        image,
        title: title || 'Блог',
        caption: subtitle,
        coordsLabel: coordsLabelFrom(post.coordinates as ApiCoordinates | null),
        alt: title || 'Блог',
      })
    }
  }

  return pickRandom(candidates) ?? featuredFallback
}, {
  default: () => featuredFallback,
})

const featuredHero = computed(() => featuredHeroData.value ?? featuredFallback)

const SECTIONS = [
  {
    to: '/shop',
    num: '01',
    title: 'Магазин',
    desc: 'Картины, курсы, пресеты',
    image: '/images/hero-shop.jpg',
    alt: 'Туманный лес',
  },
  {
    to: '/blog',
    num: '02',
    title: 'Блог',
    desc: 'Приморье и Россия',
    image: '/images/hero-blog.jpg',
    alt: 'Дерево на скале в тумане',
  },
  {
    to: '/encyclopedia',
    num: '03',
    title: 'Энциклопедия Приморья',
    desc: 'Исторические места, природные локации, события',
    image: '/images/hero-encyclopedia.jpg',
    alt: 'Скала в море на закате',
  },
]

const STATS = [
  { value: '10+', label: 'лет опыта' },
  { value: '50+', label: 'мест съёмок' },
  { value: '15', label: 'наград' },
  { value: '1000+', label: 'довольных клиентов' },
]
</script>

<template>
  <div>
    <section class="relative overflow-hidden pt-[72px]">
      <div
        class="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-moss/10 blur-3xl"
        aria-hidden="true"
      />
      <div class="container-x pb-16 pt-14 text-center sm:pt-20">
        <Reveal>
          <p class="eyebrow flex items-center justify-center gap-2">
            <MapPin class="h-3.5 w-3.5" />
            Пейзажный фотограф · Приморский край
          </p>
        </Reveal>
        <Reveal :delay="0.08">
          <h1 class="display-1 mx-auto mt-6 max-w-5xl text-[13vw] sm:text-7xl lg:text-[92px]">
            Иван <em class="italic text-moss">Мамонов</em>
          </h1>
        </Reveal>
        <Reveal :delay="0.16">
          <p
            class="mx-auto mt-6 max-w-2xl text-balance text-[17px] leading-relaxed text-ink-soft sm:text-lg"
          >
            Более десяти лет путешествую по России и миру, запечатлевая красоту природы в её самых
            разных проявлениях — от туманных побережий Приморья до вершин Кавказа.
          </p>
        </Reveal>
        <Reveal :delay="0.24">
          <div class="mt-9 flex flex-wrap items-center justify-center gap-3">
            <NuxtLink to="/encyclopedia" class="group btn-ink">
              Энциклопедия Приморья
              <ArrowRight
                class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              />
            </NuxtLink>
            <NuxtLink to="/about" class="btn-outline">Обо мне</NuxtLink>
          </div>
        </Reveal>
      </div>

      <Reveal :delay="0.1" :y="40">
        <div class="container-x">
          <NuxtLink
            :to="featuredHero.href"
            class="group relative block overflow-hidden rounded-[2rem] border border-line shadow-[0_40px_80px_-40px_rgb(27_30_23/0.35)]"
          >
            <img
              :src="featuredHero.image"
              :alt="featuredHero.alt"
              class="img-zoom aspect-[16/9] w-full object-cover sm:aspect-[21/9]"
            />
            <div
              class="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-ink/55 via-ink/10 to-transparent p-6 sm:p-8"
            >
              <div class="min-w-0 max-w-lg">
                <h2
                  class="font-display text-xl font-semibold leading-snug text-white sm:text-2xl lg:text-[28px]"
                >
                  {{ featuredHero.title }}
                </h2>
                <p
                  v-if="featuredHero.caption"
                  class="mt-2 text-sm leading-relaxed text-white/85 sm:text-[15px]"
                >
                  {{ featuredHero.caption }}
                </p>
              </div>
              <span
                v-if="featuredHero.coordsLabel"
                class="hidden shrink-0 rounded-full border border-white/30 px-4 py-1.5 text-[12px] font-medium uppercase tracking-[0.18em] text-white/85 sm:block"
              >
                {{ featuredHero.coordsLabel }}
              </span>
            </div>
          </NuxtLink>

          <div
            class="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-4"
          >
            <div v-for="s in STATS" :key="s.label" class="bg-white px-6 py-7 text-center">
              <p class="font-display text-4xl font-semibold text-ink">{{ s.value }}</p>
              <p
                class="mt-1.5 text-[12px] font-medium uppercase tracking-[0.16em] text-muted-foreground"
              >
                {{ s.label }}
              </p>
            </div>
          </div>
        </div>
      </Reveal>
    </section>

    <section class="container-x py-20 sm:py-28">
      <Reveal>
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p class="eyebrow">Разделы сайта</p>
            <h2 class="display-1 mt-3 text-4xl sm:text-5xl">
              Что здесь <em class="italic text-moss">есть</em>
            </h2>
          </div>
          <p class="max-w-sm text-[15px] leading-relaxed text-muted-foreground">
            Магазин работ, истории путешествий и энциклопедия родного края — всё в одном месте.
          </p>
        </div>
      </Reveal>

      <div class="mt-12 grid gap-6 md:grid-cols-3">
        <Reveal v-for="(s, i) in SECTIONS" :key="s.to" :delay="0.08 * i">
          <NuxtLink :to="s.to" class="group card-hover relative block overflow-hidden rounded-3xl">
            <div class="relative aspect-[3/4] overflow-hidden">
              <img
                :src="s.image"
                :alt="s.alt"
                loading="lazy"
                class="img-zoom h-full w-full object-cover"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/15 to-transparent" />
              <span
                class="absolute left-5 top-5 rounded-full border border-white/25 px-3 py-1 text-[12px] font-semibold tracking-[0.2em] text-white/85"
              >
                {{ s.num }}
              </span>
              <span
                class="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition-all duration-500 group-hover:bg-moss group-hover:backdrop-blur-0"
              >
                <ArrowUpRight
                  class="h-5 w-5 transition-transform duration-300 group-hover:rotate-45"
                />
              </span>
              <div class="absolute inset-x-0 bottom-0 p-6">
                <h3 class="font-display text-[26px] font-semibold leading-tight text-white">
                  {{ s.title }}
                </h3>
                <p class="mt-1.5 text-[13.5px] text-white/70">{{ s.desc }}</p>
              </div>
            </div>
          </NuxtLink>
        </Reveal>
      </div>
    </section>

    <section v-if="previewArticles.length" class="border-y border-line bg-paper-deep/60 py-20 sm:py-28">
      <div class="container-x">
        <Reveal>
          <div class="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p class="eyebrow">Энциклопедия Приморья</p>
              <h2 class="display-1 mt-3 max-w-2xl text-4xl sm:text-5xl">
                Истории края, которые
                <em class="italic text-moss">стоит знать</em>
              </h2>
            </div>
            <NuxtLink
              to="/encyclopedia"
              class="group inline-flex items-center gap-2 text-[14px] font-semibold text-moss"
            >
              Вся энциклопедия
              <ArrowRight
                class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              />
            </NuxtLink>
          </div>
        </Reveal>

        <div class="mt-12 grid gap-6 md:grid-cols-3">
          <Reveal v-for="(a, i) in previewArticles" :key="a.slug" :delay="0.08 * i">
            <ArticleCard
              :slug="a.slug"
              :title="a.title"
              :subtitle="a.subtitle"
              :image="a.image"
              :category="a.category"
            />
          </Reveal>
        </div>
      </div>
    </section>

    <section class="container-x py-20 sm:py-28">
      <div class="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <Reveal>
          <div class="relative">
            <div class="overflow-hidden rounded-[2rem] border border-line">
              <img
                :src="aboutPortrait"
                alt="Иван Мамонов с камерой"
                loading="lazy"
                class="img-zoom aspect-[3/4] w-full object-cover"
              />
            </div>
            <div
              class="absolute -bottom-6 -right-4 rounded-2xl border border-line bg-white px-6 py-5 shadow-[0_20px_40px_-20px_rgb(27_30_23/0.25)] sm:-right-8"
            >
              <p class="font-display text-3xl font-semibold text-moss">{{ aboutYearsStat }}</p>
              <p
                class="mt-0.5 text-[12px] font-medium uppercase tracking-[0.16em] text-muted-foreground"
              >
                лет за камерой
              </p>
            </div>
          </div>
        </Reveal>

        <div>
          <Reveal>
            <p class="eyebrow">Обо мне</p>
          </Reveal>
          <Reveal :delay="0.08">
            <h2 class="display-1 mt-4 text-4xl leading-[1.08] sm:text-5xl">
              Фотография — способ
              <em class="italic text-moss">остановить время</em>
            </h2>
          </Reveal>
          <Reveal :delay="0.14">
            <p class="mt-6 max-w-xl text-[16px] leading-relaxed text-ink-soft">
              {{ aboutTeaserText }}
            </p>
          </Reveal>
          <Reveal :delay="0.2">
            <div class="mt-8 flex flex-wrap gap-3">
              <NuxtLink to="/about" class="group btn-moss">
                Подробнее обо мне
                <ArrowRight
                  class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                />
              </NuxtLink>
              <NuxtLink to="/contacts" class="btn-outline">Связаться</NuxtLink>
            </div>
          </Reveal>
        </div>
      </div>
    </section>

    <section class="border-t border-line bg-white">
      <div class="container-x py-20 text-center sm:py-28">
        <Reveal>
          <p class="eyebrow">Манифест</p>
        </Reveal>
        <Reveal :delay="0.08">
          <blockquote
            class="mx-auto mt-8 max-w-4xl font-display text-3xl font-medium leading-[1.25] text-ink sm:text-[42px]"
          >
            «Сохранить то, что
            <em class="italic text-moss">исчезнет</em> через мгновение, — в этом весь смысл»
          </blockquote>
        </Reveal>
        <Reveal :delay="0.16">
          <p class="mt-8 text-[13px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Иван Мамонов
          </p>
        </Reveal>
      </div>
    </section>
  </div>
</template>
