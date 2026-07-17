<script setup lang="ts">
import {
  CalendarDays,
  Compass,
  Globe2,
  Landmark,
  LayoutGrid,
  Map as MapIcon,
} from '@lucide/vue'
import type { Encyclopedia } from '~/interfaces/Encyclopedia'
import {
  defaultSiteEncyclopediaSection,
  loadSiteEncyclopediaSection,
  type SiteEncyclopediaCategoryItem,
} from '~/composables/useSiteContent'
import { resolvePublicMediaUrl } from '~/composables/usePageSeo'

const route = useRoute()
const router = useRouter()
const contentApi = useContentApi()

const { data: encSectionData } = await useAsyncData('site-encyclopedia-section', () =>
  loadSiteEncyclopediaSection(),
  { default: () => defaultSiteEncyclopediaSection() },
)

const encSection = computed(() => encSectionData.value ?? defaultSiteEncyclopediaSection())

const es = encSection.value
usePageSeo(es.seo, {
  title: es.seo.meta_title?.trim() || es.hero_title || 'Энциклопедия — Иван Мамонов',
  description: es.seo.meta_description?.trim() || es.hero_subtitle,
  ogImage: es.seo.og_image?.trim() || es.hero_background_image || '/images/hero-encyclopedia.jpg',
})

const { data: postsData } = await useAsyncData('encyclopedia-list', () =>
  contentApi.fetchEncyclopedia(),
)

const posts = computed(() => (postsData.value ?? []) as unknown as Encyclopedia[])

const activeCategory = computed(() => {
  const raw = route.query.c
  const s = Array.isArray(raw) ? raw[0] : raw
  if (!s || s === 'all') return 'all'
  const key = String(s)
  const allowed = (
    encSection.value.categories?.length
      ? encSection.value.categories
      : defaultSiteEncyclopediaSection().categories
  ).map((c) => c.value)
  return allowed.includes(key) ? key : 'all'
})

const categoryTabs = computed(() => {
  const list: SiteEncyclopediaCategoryItem[] = encSection.value.categories?.length
    ? encSection.value.categories
    : defaultSiteEncyclopediaSection().categories
  return list
})

const FILTER_ICONS: Record<string, typeof Globe2> = {
  all: LayoutGrid,
  nature: Globe2,
  history: Landmark,
  events: CalendarDays,
}

function guessCategoryLegacy(e: Encyclopedia): string {
  const t = `${e.title} ${e.subtitle ?? ''}`.toLowerCase()
  const values = (
    encSection.value.categories ?? defaultSiteEncyclopediaSection().categories
  ).map((c) => c.value)
  const history = values.find((v) => v === 'history')
  const events = values.find((v) => v === 'events')
  const nature = values.find((v) => v === 'nature')
  if (/истор|маяк|руин|мост|музей|крепост|замок|село|вантов|город/.test(t))
    return history ?? nature ?? values[0] ?? ''
  if (/событ|фестиваль|праздник|ярмарк/.test(t)) return events ?? nature ?? values[0] ?? ''
  return nature ?? values[0] ?? ''
}

function matchesCategoryFilter(e: Encyclopedia, filter: string): boolean {
  if (filter === 'all') return true
  const c = e.category?.trim()
  if (c) return c === filter
  return guessCategoryLegacy(e) === filter
}

function badgeLabel(e: Encyclopedia): string {
  const c = e.category?.trim()
  const tabs = encSection.value.categories?.length
    ? encSection.value.categories
    : defaultSiteEncyclopediaSection().categories
  if (c) {
    const hit = tabs.find((t) => t.value === c)
    if (hit) return hit.label
    return c
  }
  const guessed = guessCategoryLegacy(e)
  const hit2 = tabs.find((t) => t.value === guessed)
  return hit2?.label ?? ''
}

function previewPath(e: Encyclopedia) {
  const img = e.preview_image
  if (img && typeof img === 'object' && 'path' in img && img.path) {
    return resolvePublicMediaUrl(String(img.path))
  }
  return '/images/hero-encyclopedia.jpg'
}

const filteredLocations = computed(() => {
  const f = activeCategory.value
  return posts.value.filter((loc) => matchesCategoryFilter(loc, f))
})

function setFilter(key: string) {
  if (key === 'all') {
    router.push({ path: '/encyclopedia' })
  } else {
    router.push({ path: '/encyclopedia', query: { c: key } })
  }
}

const contactEmail = 'ivanmamonov.photo@gmail.com'

const heroImage = computed(
  () =>
    resolvePublicMediaUrl(encSection.value.hero_background_image) ||
    '/images/hero-encyclopedia.jpg',
)
</script>

<template>
  <div>
    <PageHero
      eyebrow="Энциклопедия Приморья"
      current="Энциклопедия"
      :image="heroImage"
      title-html="Исторические места, природа и <em class=&quot;italic text-moss&quot;>события края</em>"
      title="Исторические места, природа и события края"
      :subtitle="
        encSection.hero_subtitle ||
        'Собрание историй Дальнего Востока: забытые острова, исчезнувшие названия и люди, создававшие Приморье.'
      "
    >
      <div class="mt-9 flex flex-wrap gap-2.5">
        <button
          type="button"
          :class="[
            'inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-[13.5px] font-semibold transition-all duration-300',
            activeCategory === 'all'
              ? 'border-moss bg-moss text-white shadow-[0_8px_20px_-8px_rgb(94_122_69/0.6)]'
              : 'border-line bg-white text-ink-soft hover:border-moss/50 hover:text-moss',
          ]"
          @click="setFilter('all')"
        >
          <LayoutGrid class="h-4 w-4" />
          Все
        </button>
        <button
          v-for="category in categoryTabs"
          :key="category.value"
          type="button"
          :class="[
            'inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-[13.5px] font-semibold transition-all duration-300',
            activeCategory === category.value
              ? 'border-moss bg-moss text-white shadow-[0_8px_20px_-8px_rgb(94_122_69/0.6)]'
              : 'border-line bg-white text-ink-soft hover:border-moss/50 hover:text-moss',
          ]"
          @click="setFilter(category.value)"
        >
          <component :is="FILTER_ICONS[category.value] || Globe2" class="h-4 w-4" />
          {{ category.label }}
        </button>
        <NuxtLink
          to="/encyclopedia/map"
          class="inline-flex items-center gap-2 rounded-full border border-dashed border-moss/50 bg-moss-wash/60 px-5 py-2.5 text-[13.5px] font-semibold text-moss-dark transition-all duration-300 hover:border-moss hover:bg-moss hover:text-white"
        >
          <MapIcon class="h-4 w-4" />
          Карта
        </NuxtLink>
      </div>
    </PageHero>

    <section class="container-x pb-24">
      <div v-if="filteredLocations.length > 0" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <ArticleCard
          v-for="location in filteredLocations"
          :key="location.slug"
          :slug="location.slug"
          :title="location.title"
          :subtitle="location.subtitle"
          :image="previewPath(location)"
          :category="location.category"
          :category-label="badgeLabel(location)"
        />
      </div>
      <div
        v-else
        class="flex flex-col items-center rounded-3xl border border-dashed border-line bg-white/60 px-8 py-20 text-center"
      >
        <span class="flex h-14 w-14 items-center justify-center rounded-full bg-moss-wash text-moss">
          <Compass class="h-6 w-6" />
        </span>
        <h3 class="mt-6 font-display text-2xl font-semibold text-ink">Раздел наполняется</h3>
        <p class="mt-3 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
          Материалы уже в работе и скоро появятся здесь.
        </p>
      </div>

      <Reveal class="mt-16">
        <div
          class="flex flex-col items-start justify-between gap-6 rounded-3xl border border-line bg-white p-8 sm:flex-row sm:items-center sm:p-10"
        >
          <div>
            <h3 class="font-display text-2xl font-semibold text-ink sm:text-[28px]">
              Знаете историю, которой здесь не хватает?
            </h3>
            <p class="mt-2 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
              Напишите мне — интересные факты и локации попадут в следующие выпуски энциклопедии.
            </p>
          </div>
          <a
            :href="`mailto:${contactEmail}`"
            class="inline-flex shrink-0 items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-[14px] font-semibold text-paper transition-colors hover:bg-moss"
          >
            Предложить тему
          </a>
        </div>
      </Reveal>
    </section>
  </div>
</template>
