<script setup lang="ts">
import { ExclamationCircleIcon } from '@heroicons/vue/24/outline'
import { computed, ref } from 'vue'
import type { Encyclopedia } from '~/interfaces/Encyclopedia'
import {
  defaultSiteEncyclopediaSection,
  loadSiteEncyclopediaSection,
  type SiteEncyclopediaCategoryItem,
} from '~/composables/useSiteContent'
import SiteSectionHero from "~/components/SiteSectionHero.vue";

const contentApi = useContentApi()

const { data: encSectionData } = await useAsyncData('site-encyclopedia-section', () => loadSiteEncyclopediaSection(), {
  default: () => defaultSiteEncyclopediaSection(),
})

const encSection = computed(() => encSectionData.value ?? defaultSiteEncyclopediaSection())

const es = encSection.value
usePageSeo(es.seo, {
  title: es.seo.meta_title?.trim() || es.hero_title || 'Энциклопедия — Иван Мамонов',
  description: es.seo.meta_description?.trim() || es.hero_subtitle,
  ogImage: es.seo.og_image?.trim() || es.hero_background_image,
})

const posts = ref<Encyclopedia[]>([])
/** 'all' или value из API (совпадает с encyclopedia.category) */
const activeCategory = ref<string>('all')
const hoveredLocation = ref<string | null>(null)

contentApi.fetchEncyclopedia().then((rows) => {
  posts.value = rows as unknown as Encyclopedia[]
})

const categoryTabs = computed(() => {
  const list: SiteEncyclopediaCategoryItem[] = encSection.value.categories?.length
    ? encSection.value.categories
    : defaultSiteEncyclopediaSection().categories
  return [
    { value: 'all', label: 'ВСЕ', icon: 'i-heroicons-map-pin' },
    ...list.map((c) => ({
      value: c.value,
      label: c.label,
      icon: c.icon?.trim() || 'i-heroicons-tag',
    })),
  ]
})

/** Только если category в записи пусто — подбор по тексту (редкий случай для старых данных). */
function guessCategoryLegacy(e: Encyclopedia): string {
  const t = `${e.title} ${e.subtitle ?? ''}`.toLowerCase()
  const values = (encSection.value.categories ?? defaultSiteEncyclopediaSection().categories).map((c) => c.value)
  const history = values.find((v) => v === 'history')
  const events = values.find((v) => v === 'events')
  const nature = values.find((v) => v === 'nature')
  if (/истор|маяк|руин|мост|музей|крепост|замок|село|вантов|город/.test(t)) return history ?? nature ?? values[0] ?? ''
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
    return c.toUpperCase()
  }
  const guessed = guessCategoryLegacy(e)
  const hit2 = tabs.find((t) => t.value === guessed)
  return hit2?.label ?? '—'
}

function previewPath(e: Encyclopedia) {
  const img = e.preview_image
  if (img && typeof img === 'object' && 'path' in img && img.path) return String(img.path)
  return ''
}

const filteredLocations = computed(() => {
  const f = activeCategory.value
  return posts.value.filter((loc) => matchesCategoryFilter(loc, f))
})

const emptyStateTitle = computed(() => {
  if (activeCategory.value === 'all' || posts.value.length === 0) {
    return 'Пока нет записей'
  }
  return 'В этой категории пока нет записей'
})

const emptyStateDescription = computed(() => {
  if (activeCategory.value === 'all' || posts.value.length === 0) {
    return 'Мы работаем над наполнением энциклопедии. Скоро здесь появятся материалы об истории, природе и событиях Приморья.'
  }
  return 'Попробуйте открыть другую рубрику — записи по этой теме ещё готовятся.'
})

const breadcrumbs = [
  { label: 'Главная', to: '/' },
  { label: 'Энциклопедия' },
]
</script>

<template>
  <div class="min-h-screen bg-white">
    <AppBreadcrumbs :items="breadcrumbs" />
    <SiteSectionHero
      variant="encyclopedia"
      :background-image="encSection.hero_background_image"
      :title="encSection.hero_title"
      :subtitle="encSection.hero_subtitle"
    />

    <section class="sticky top-16 lg:top-20 z-30 bg-white border-b border-gray-100">
      <div class="px-6 lg:px-12 py-4">
        <div class="flex flex-wrap gap-2 lg:gap-4 justify-center">
          <button
            v-for="category in categoryTabs"
            :key="category.value"
            type="button"
            :class="[
              'flex items-center gap-2 px-4 lg:px-6 py-2 rounded-full text-sm font-medium transition-all duration-300',
              activeCategory === category.value
                ? 'bg-olivine-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-olivine-100 hover:text-olivine-700',
            ]"
            @click="activeCategory = category.value"
          >
            <HeroUiIcon :name="category.icon" icon-class="w-4 h-4" />
            <span class="hidden sm:inline">{{ category.label }}</span>
          </button>
        </div>
      </div>
    </section>

    <section class="py-12 lg:py-16 px-6 lg:px-12">
      <div class="max-w-7xl mx-auto">
        <div
          v-if="filteredLocations.length === 0"
          class="flex flex-col items-center justify-center py-24 text-center"
        >
          <div class="w-24 h-24 bg-olivine-50 rounded-full flex items-center justify-center mb-6">
            <ExclamationCircleIcon class="w-10 h-10 text-olivine-300" />
          </div>
          <h2 class="text-2xl font-semibold text-gray-400">
            {{ emptyStateTitle }}
          </h2>
          <p class="mt-3 text-gray-400 max-w-md">
            {{ emptyStateDescription }}
          </p>
        </div>
        <div
          v-else
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          <article
            v-for="(location, index) in filteredLocations"
            :key="location.slug"
            class="group cursor-pointer animate-fadeInUp"
            :style="{ animationDelay: `${index * 0.1}s` }"
            @mouseenter="hoveredLocation = location.slug"
            @mouseleave="hoveredLocation = null"
          >
            <NuxtLink :to="`/encyclopedia/${location.slug}`" class="block">
              <div class="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100">
                <img
                  v-if="previewPath(location)"
                  :src="previewPath(location)"
                  :alt="location.title"
                  :class="[
                    'w-full h-full object-cover transition-transform duration-700',
                    hoveredLocation === location.slug ? 'scale-110' : 'scale-100',
                  ]"
                />
                <div v-else class="w-full h-full bg-gradient-to-br from-olivine-200 to-olivine-700" />

                <div
                  :class="[
                    'absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300',
                    hoveredLocation === location.slug ? 'opacity-100' : 'opacity-70',
                  ]"
                />

                <div class="absolute top-4 left-4">
                  <span
                    class="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-800 rounded-full uppercase tracking-wider"
                  >
                    {{ badgeLabel(location) }}
                  </span>
                </div>

                <div class="absolute bottom-0 left-0 right-0 p-4 lg:p-6">
                  <h3 class="text-xl lg:text-2xl font-bold text-white">
                    {{ location.title }}
                  </h3>
                </div>
              </div>

              <div class="mt-4">
                <p v-if="location.subtitle" class="text-gray-600 leading-relaxed">
                  {{ location.subtitle }}
                </p>
                <div class="mt-3 flex items-center gap-2 text-olivine-500 font-medium text-sm">
                  <span>Подробнее</span>
                  <span
                    :class="[
                      'transition-transform duration-300 inline-block',
                      hoveredLocation === location.slug ? 'translate-x-1' : '',
                    ]"
                  >
                    →
                  </span>
                </div>
              </div>
            </NuxtLink>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>
