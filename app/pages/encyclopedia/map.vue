<script setup lang="ts">
import type { MapLocation } from '~/interfaces/MapLocation'
import {
  defaultSiteEncyclopediaSection,
  loadSiteEncyclopediaSection,
  type SiteEncyclopediaCategoryItem,
} from '~/composables/useSiteContent'
import SiteSectionHero from '~/components/SiteSectionHero.vue'

const route = useRoute()
const contentApi = useContentApi()

const { data: encSectionData } = await useAsyncData('site-encyclopedia-section', () => loadSiteEncyclopediaSection(), {
  default: () => defaultSiteEncyclopediaSection(),
})

const encSection = computed(() => encSectionData.value ?? defaultSiteEncyclopediaSection())

const es = encSection.value
usePageSeo(
  {
    ...es.seo,
    meta_title: 'Карта — энциклопедия Приморья',
  },
  {
    title: 'Карта — энциклопедия Приморья — Иван Мамонов',
    description: es.seo.meta_description?.trim() || es.hero_subtitle,
    ogImage: es.seo.og_image?.trim() || es.hero_background_image,
  },
)

const { data: locationsData } = await useAsyncData('encyclopedia-map-locations', () =>
  contentApi.fetchMapLocations(),
)

const locations = computed(() => locationsData.value ?? [])

const categoryTabs = computed(() => {
  const list: SiteEncyclopediaCategoryItem[] = encSection.value.categories?.length
    ? encSection.value.categories
    : defaultSiteEncyclopediaSection().categories
  return list.map((c) => ({
    value: c.value,
    label: c.label,
    icon: c.icon?.trim() || 'i-heroicons-tag',
  }))
})

const filterPillClass = (active: boolean) =>
  [
    'flex items-center gap-2 px-4 lg:px-6 py-2 rounded-full text-sm font-medium transition-all duration-300',
    active
      ? 'bg-olivine-500 text-white'
      : 'bg-gray-100 text-gray-600 hover:bg-olivine-100 hover:text-olivine-700',
  ]

const isAllFilterActive = computed(
  () => route.path === '/encyclopedia' && !route.query.c,
)
const isMapNavActive = computed(() => route.path === '/encyclopedia/map')

const breadcrumbs = [
  { label: 'Главная', to: '/' },
  { label: 'Энциклопедия', to: '/encyclopedia' },
  { label: 'Карта' },
]

function cardLink(loc: MapLocation) {
  if (loc.encyclopedia_slug) return `/encyclopedia/${encodeURIComponent(loc.encyclopedia_slug)}`
  return null
}
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
          <NuxtLink to="/encyclopedia" :class="filterPillClass(isAllFilterActive)">
            <HeroUiIcon name="i-heroicons-map-pin" icon-class="w-4 h-4" />
            <span class="hidden sm:inline">ВСЕ</span>
          </NuxtLink>
          <NuxtLink to="/encyclopedia/map" :class="filterPillClass(isMapNavActive)">
            <HeroUiIcon name="i-heroicons-map" icon-class="w-4 h-4" />
            <span class="hidden sm:inline">КАРТА</span>
          </NuxtLink>
          <NuxtLink
            v-for="category in categoryTabs"
            :key="category.value"
            :to="{ path: '/encyclopedia', query: { c: category.value } }"
            :class="filterPillClass(false)"
          >
            <HeroUiIcon :name="category.icon" icon-class="w-4 h-4" />
            <span class="hidden sm:inline">{{ category.label }}</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="py-10 lg:py-14 px-6 lg:px-12">
      <div class="max-w-6xl mx-auto space-y-10">
        <EncyclopediaLocationsMap :locations="locations" />

        <div v-if="locations.length > 0" class="space-y-4">
          <h2 class="text-xl font-semibold text-gray-900">Места на карте</h2>
          <ul class="grid gap-4 sm:grid-cols-2">
            <li
              v-for="loc in locations"
              :key="loc.id"
              class="rounded-xl border border-gray-100 bg-gray-50/80 p-4 transition hover:border-olivine-200"
            >
              <NuxtLink
                v-if="cardLink(loc)"
                :to="cardLink(loc)!"
                class="block group"
              >
                <h3 class="font-semibold text-gray-900 group-hover:text-olivine-600">
                  {{ loc.title }}
                </h3>
                <p v-if="loc.description" class="mt-2 text-sm text-gray-600 leading-relaxed">
                  {{ loc.description }}
                </p>
                <CoordinatesDmsDisplay
                  class="mt-2"
                  variant="map-list"
                  :latitude="loc.latitude"
                  :longitude="loc.longitude"
                />
                <div class="mt-3 text-sm font-medium text-olivine-500">
                  Подробнее →
                </div>
              </NuxtLink>
              <div v-else class="block">
                <h3 class="font-semibold text-gray-900">
                  {{ loc.title }}
                </h3>
                <p v-if="loc.description" class="mt-2 text-sm text-gray-600 leading-relaxed">
                  {{ loc.description }}
                </p>
                <CoordinatesDmsDisplay
                  class="mt-2"
                  variant="map-list"
                  :latitude="loc.latitude"
                  :longitude="loc.longitude"
                />
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>
