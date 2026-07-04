<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref, computed } from 'vue'
import type { Encyclopedia } from '~/interfaces/Encyclopedia'
import { resolvePublicMediaUrl } from '~/composables/usePageSeo'
import { useFilters } from '~/composables/useFilters'
import AppBreadcrumbs from "~/components/AppBreadcrumbs.vue";

const nuxtApp = useNuxtApp()
const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const { shortenFormattedCoordinateDecimals } = useFilters()

const hasMapboxToken = computed(() => {
  const t = runtimeConfig.public.mapbox?.accessToken
  return typeof t === 'string' && t.length > 0
})

const hasYandexMapsKey = computed(() => {
  const y = runtimeConfig.public.yandexMaps as { apikey?: string } | undefined
  const k = y?.apikey
  return typeof k === 'string' && k.length > 0
})

const mapboxMapId = computed(() =>
  `ency-map-${String(route.params.slug ?? 'page').replace(/[^a-zA-Z0-9-_]/g, '-')}`
)

const mapboxMarkerId = computed(() =>
  `ency-marker-${String(route.params.slug ?? 'page').replace(/[^a-zA-Z0-9-_]/g, '-')}`
)

const contentApi = useContentApi()

const { data: post, error: postError } = await useAsyncData(
  `encyclopedia-${String(route.params.slug ?? '')}`,
  () => contentApi.fetchEncyclopediaBySlug(String(route.params.slug ?? '')),
  { server: false, watch: [() => route.params.slug] }
)

if (postError.value || !post.value) {
  throw createError({ statusCode: 404, statusMessage: 'Статья не найдена' })
}

const gallerySelected = ref(0)

const carouselItems = computed(() => {
  const p = post.value as Encyclopedia | null
  if (!p) return []
  const main = p.main_images
  if (Array.isArray(main) && main.length > 0) return main
  return []
})

const galleryPaths = computed(() => carouselItems.value.map((i) => i.path))

/** Обложка hero — preview_image (кадрируется в админке), не первое фото галереи. */
const heroImageSrc = computed(() => {
  const p = post.value as Encyclopedia | null
  if (!p) return ''
  if (p.preview_image?.path) return p.preview_image.path
  return galleryPaths.value[0] ?? ''
})

const coordPair = computed(() => {
  const c = (post.value as Encyclopedia | null)?.coordinates
  if (!c || c.latitude == null || c.longitude == null) return null
  return {
    lat: Number(c.latitude),
    lng: Number(c.longitude),
    latLabel: c.latitude_label ?? 'N',
    lngLabel: c.longitude_label ?? 'E',
  }
})

/** Только если с API пришла готовая строка без числовых lat/lng (редкий случай). */
const coordLabelFallback = computed(() => {
  if (coordPair.value) return ''
  const c = (post.value as Encyclopedia | null)?.coordinates
  if (c?.formatted?.trim()) return shortenFormattedCoordinateDecimals(c.formatted)
  return ''
})

const mapboxOptions = computed(() => {
  const p = coordPair.value
  if (!p) return null
  return {
    style: 'mapbox://styles/mapbox/light-v11',
    center: [p.lng, p.lat] as [number, number],
    zoom: 7,
  }
})

const showMapboxMap = computed(() => hasMapboxToken.value && !!mapboxOptions.value)

const showYandexMap = computed(
  () => !showMapboxMap.value && hasYandexMapsKey.value && !!coordPair.value
)

const markerLngLat = computed((): [number, number] => {
  const p = coordPair.value
  if (!p) return [0, 0]
  return [p.lng, p.lat]
})

function openInMap(lat: number, lng: number) {
  const fn = nuxtApp.$openMap as ((a: number, b: number, c?: string) => void) | undefined
  fn?.(lat, lng, (post.value as unknown as Encyclopedia)?.title ?? '')
}

function categoryBadgeLabel(category: string | null | undefined): string {
  const c = category?.trim()
  if (!c) return 'МЕСТО ПРИМОРЬЯ'
  if (c === 'nature') return 'ПРИРОДНАЯ ЛОКАЦИЯ'
  if (c === 'history') return 'ИСТОРИЧЕСКОЕ МЕСТО'
  if (c === 'events') return 'СОБЫТИЕ'
  return c.toUpperCase()
}

function categoryShortLabel(category: string | null | undefined): string {
  const c = category?.trim()
  if (!c) return '—'
  if (c === 'nature') return 'ПРИРОДА'
  if (c === 'history') return 'ИСТОРИЯ'
  if (c === 'events') return 'СОБЫТИЯ'
  return c
}

function formatPublished(iso: string | null | undefined) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

type StatCard = { icon: string; title: string; text: string; map?: boolean; isCoordinates?: boolean }

const statCards = computed((): StatCard[] => {
  const p = post.value as Encyclopedia | null
  if (!p) return []
  const cards: StatCard[] = []
  if (p.subtitle?.trim()) {
    cards.push({ icon: 'i-heroicons-map-pin', title: 'Локация', text: p.subtitle.trim() })
  }
  cards.push({
    icon: 'i-heroicons-tag',
    title: 'Категория',
    text: categoryShortLabel(p.category),
  })
  if (coordPair.value || coordLabelFallback.value) {
    cards.push({
      icon: 'i-heroicons-globe-alt',
      title: 'Координаты',
      text: coordLabelFallback.value,
      map: !!coordPair.value,
      isCoordinates: !!coordPair.value,
    })
  }
  if (p.published_at) {
    const fd = formatPublished(p.published_at)
    if (fd) cards.push({ icon: 'i-heroicons-calendar-days', title: 'Опубликовано', text: fd })
  }
  return cards
})

const gridClass = 'grid-cols-2 lg:grid-cols-4'

const breadcrumbs = computed(() => {
  const p = post.value as Encyclopedia | null
  const title = p?.title?.trim() || 'Статья'
  return [
    { label: 'Главная', to: '/' },
    { label: 'Энциклопедия', to: '/encyclopedia' },
    { label: title },
  ]
})

/** Видеофайлы из админки (не встроены в Tiptap-контент). */
const attachedVideos = computed(() => {
  const p = post.value as Encyclopedia | null
  if (!p) return []
  const list = p.videos
  if (!Array.isArray(list) || list.length === 0) return []
  return list.filter((v): v is { id: number; path: string } =>
    Boolean(v && typeof v.path === 'string' && v.path.trim() !== '')
  )
})

function encyclopediaVideoSrc(path: string): string {
  return resolvePublicMediaUrl(path.trim())
}
</script>

<template>
  <div v-if="post" class="min-h-screen bg-white">
    <div
      class="pointer-events-none fixed top-[4.25rem] lg:top-[5.25rem] left-4 right-4 z-30 lg:left-12 lg:right-12"
    >
      <div class="pointer-events-auto flex w-full max-w-full flex-col items-start gap-2">
        <span
          class="inline-block shrink-0 rounded-full bg-olivine-500 px-4 py-1.5 text-xs font-medium tracking-wider text-white uppercase shadow-sm"
        >
          {{ categoryBadgeLabel(post.category as any) }}
        </span>
        <AppBreadcrumbs :items="breadcrumbs" :fixed="false" />
      </div>
    </div>

    <section class="relative h-[55vh] min-h-[320px] max-h-[720px] lg:h-[65vh]">
      <div class="absolute inset-0 overflow-hidden">
        <HeroCoverImage
          v-if="heroImageSrc"
          :src="heroImageSrc"
          :alt="post.title as string"
        />
        <div v-else class="h-full w-full bg-linear-to-br from-olivine-300 to-olivine-800" />

        <div class="absolute inset-0 z-[2] bg-linear-to-t from-black/85 via-black/45 to-black/15" />
      </div>

      <div
        class="absolute bottom-0 left-0 right-0 z-[3] px-6 pt-6 lg:p-16"
        :class="
          coordPair || coordLabelFallback ? 'pb-24 sm:pb-20 lg:pb-16' : 'pb-6 lg:pb-16'
        "
      >
        <div class="max-w-4xl">
          <h1
            class="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-white tracking-tight leading-snug [text-shadow:0_2px_24px_rgba(0,0,0,0.55)]"
          >
            {{ post.title }}
          </h1>
          <p v-if="post.subtitle" class="mt-4 text-xl lg:text-2xl text-olivine-200 font-light">
            {{ post.subtitle }}
          </p>
          <div v-if="coordPair || coordLabelFallback" class="mt-6 flex items-center gap-3">
            <HeroUiIcon
              name="i-heroicons-map-pin"
              icon-class="w-4 h-4 flex-shrink-0 text-white/75"
            />
            <button
              v-if="coordPair"
              type="button"
              class="text-left w-full min-w-0 rounded-sm outline-offset-4 hover:opacity-95 focus-visible:ring-2 focus-visible:ring-white/40"
              @click="openInMap(coordPair.lat, coordPair.lng)"
            >
              <CoordinatesDmsDisplay
                variant="hero"
                :latitude="coordPair.lat"
                :longitude="coordPair.lng"
              />
            </button>
            <span v-else class="font-mono text-sm">{{ coordLabelFallback }}</span>
          </div>
        </div>
      </div>
    </section>

    <section v-if="statCards.length" class="py-8 lg:py-12 px-6 lg:px-12 -mt-8 sm:-mt-12 lg:-mt-16 relative z-10">
      <div class="max-w-6xl mx-auto">
        <div class="grid gap-4" :class="gridClass">
          <div
            v-for="(card, idx) in statCards"
            :key="idx"
            class="bg-white rounded-xl shadow-lg p-4 lg:p-6 min-w-0"
          >
            <HeroUiIcon :name="card.icon" icon-class="w-5 h-5 text-olivine-500 mb-2" />
            <p class="text-xs text-gray-500 uppercase tracking-wider mb-0">{{ card.title }}</p>
            <button
              v-if="card.map && coordPair && card.isCoordinates"
              type="button"
              class="text-left w-full min-w-0 mt-2 hover:opacity-95 rounded-sm outline-offset-2 focus-visible:ring-2 focus-visible:ring-olivine-300"
              @click="openInMap(coordPair.lat, coordPair.lng)"
            >
              <CoordinatesDmsDisplay
                variant="card"
                :latitude="coordPair.lat"
                :longitude="coordPair.lng"
              />
            </button>
            <p v-else class="text-sm lg:text-base font-medium text-gray-900 mt-1">{{ card.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <section v-if="post.content" class="py-12 lg:py-16 px-6 lg:px-12">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">Описание</h2>
        <TiptapHtml
          :content="post.content"
          wrapper-class="encyclopedia-prose max-w-none text-gray-700"
        />
      </div>
    </section>

    <section v-if="galleryPaths.length > 0" class="py-12 lg:py-16 px-6 lg:px-12">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">Галерея</h2>
        <div class="aspect-[21/9] rounded-2xl overflow-hidden bg-gray-100 mb-4">
          <img
            :src="galleryPaths[gallerySelected]"
            :alt="`${post.title} — фото ${gallerySelected + 1}`"
            class="w-full h-full object-cover object-center"
          />
        </div>
        <div v-if="galleryPaths.length > 1" class="flex gap-3 flex-wrap">
          <button
            v-for="(src, i) in galleryPaths"
            :key="i"
            type="button"
            class="w-24 h-16 lg:w-32 lg:h-20 rounded-lg overflow-hidden transition-all duration-300"
            :class="
              gallerySelected === i
                ? 'ring-2 ring-olivine-500 ring-offset-2'
                : 'opacity-60 hover:opacity-100'
            "
            @click="gallerySelected = i"
          >
            <img :src="src" :alt="`Миниатюра ${i + 1}`" class="w-full h-full object-cover" />
          </button>
        </div>
      </div>
    </section>

    <section v-if="attachedVideos.length" class="py-12 lg:py-16 px-6 lg:px-12">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">Видео</h2>
        <div class="flex flex-col gap-10">
          <SiteMediaVideoPlayer
            v-for="(v, idx) in attachedVideos"
            :key="v.id ?? idx"
            :src="encyclopediaVideoSrc(v.path)"
            :caption="attachedVideos.length > 1 ? `Фрагмент ${idx + 1}` : undefined"
          />
        </div>
      </div>
    </section>

    <section v-if="coordPair || coordLabelFallback" class="py-12 lg:py-16 px-6 lg:px-12 bg-gray-50">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">Расположение на карте</h2>
        <ClientOnly>
          <div
            v-if="showMapboxMap && mapboxOptions"
            class="relative h-[min(420px,55vw)] w-full min-h-[280px] max-h-[520px] overflow-hidden rounded-2xl border border-slate-200 bg-neutral-200 grayscale"
          >
            <MapboxMap :map-id="mapboxMapId" class="rounded-2xl" :options="mapboxOptions">
              <MapboxDefaultMarker :marker-id="mapboxMarkerId" :lnglat="markerLngLat" />
            </MapboxMap>
          </div>
          <div
            v-else-if="showYandexMap && coordPair"
            class="relative h-[min(420px,55vw)] w-full min-h-[280px] max-h-[520px] overflow-hidden rounded-2xl border border-slate-200 bg-neutral-200"
          >
            <EncyclopediaYandexMap
              :lng="coordPair.lng"
              :lat="coordPair.lat"
              :title="(post.title as string) || undefined"
            />
          </div>
          <div
            v-else
            class="flex h-[min(420px,55vw)] min-h-[280px] w-full max-h-[520px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 text-center text-sm text-slate-600"
          >
            <p>
              Для встраивания карты добавьте в <code class="rounded bg-slate-200 px-1 py-0.5 text-xs">.env</code>
              ключ Mapbox:
              <code class="rounded bg-slate-200 px-1 py-0.5 text-xs">PUBLIC_MAPBOX_ACCESS_TOKEN</code>
              или
              <code class="rounded bg-slate-200 px-1 py-0.5 text-xs">NUXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code>
              — либо ключ Яндекс.Карт:
              <code class="rounded bg-slate-200 px-1 py-0.5 text-xs">PUBLIC_YANDEX_MAPS_API_KEY</code>
              или
              <code class="rounded bg-slate-200 px-1 py-0.5 text-xs">NUXT_PUBLIC_YANDEX_MAPS_API_KEY</code>
            </p>
          </div>
          <template #fallback>
            <div
              class="h-[min(420px,55vw)] min-h-[280px] w-full max-h-[520px] rounded-2xl border border-slate-200 bg-gray-100 animate-pulse"
            />
          </template>
        </ClientOnly>
        <CoordinatesDmsDisplay
          v-if="coordPair"
          class="mt-4"
          variant="inline"
          :latitude="coordPair.lat"
          :longitude="coordPair.lng"
        />
        <p v-else-if="coordLabelFallback" class="mt-4 font-mono text-sm text-gray-600">
          {{ coordLabelFallback }}
        </p>
        <p v-if="post.subtitle" class="mt-2 text-sm text-gray-500">{{ post.subtitle }}</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
:deep(.encyclopedia-prose p) {
  color: rgb(55 65 81);
  line-height: 1.625;
  margin-bottom: 1rem;
}
</style>
