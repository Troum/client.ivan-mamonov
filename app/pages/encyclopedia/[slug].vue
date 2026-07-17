<script setup lang="ts">
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  Images,
  MapPin,
  Tag,
} from '@lucide/vue'
import type { Encyclopedia } from '~/interfaces/Encyclopedia'
import { resolvePublicMediaUrl } from '~/composables/usePageSeo'
import { useFilters } from '~/composables/useFilters'

const nuxtApp = useNuxtApp()
const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const { shortenFormattedCoordinateDecimals } = useFilters()
const { resolveLocationLabel } = useReverseGeocode()

const locationLabel = ref('')
const locationLoading = ref(false)

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
  `ency-map-${String(route.params.slug ?? 'page').replace(/[^a-zA-Z0-9-_]/g, '-')}`,
)

const mapboxMarkerId = computed(() =>
  `ency-marker-${String(route.params.slug ?? 'page').replace(/[^a-zA-Z0-9-_]/g, '-')}`,
)

const contentApi = useContentApi()

const { data: post, error: postError } = await useAsyncData(
  `encyclopedia-${String(route.params.slug ?? '')}`,
  () => contentApi.fetchEncyclopediaBySlug(String(route.params.slug ?? '')),
  { server: false, watch: [() => route.params.slug] },
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

const galleryPaths = computed(() =>
  carouselItems.value.map((i) => resolvePublicMediaUrl(i.path)),
)

const heroImageSrc = computed(() => {
  const p = post.value as Encyclopedia | null
  if (!p) return ''
  if (p.preview_image?.path) return resolvePublicMediaUrl(p.preview_image.path)
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
  () => !showMapboxMap.value && hasYandexMapsKey.value && !!coordPair.value,
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
  if (!c) return 'Материал'
  if (c === 'nature') return 'Природная локация'
  if (c === 'history') return 'Историческое место'
  if (c === 'events') return 'Событие'
  return c
}

function categoryShortLabel(category: string | null | undefined): string {
  const c = category?.trim()
  if (!c) return '—'
  if (c === 'nature') return 'Природа'
  if (c === 'history') return 'История'
  if (c === 'events') return 'События'
  return c
}

function formatPublished(iso: string | null | undefined) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

async function loadLocationLabel() {
  const p = coordPair.value
  if (!p) {
    locationLabel.value = ''
    locationLoading.value = false
    return
  }

  locationLoading.value = true
  try {
    locationLabel.value = (await resolveLocationLabel(p.lat, p.lng)) ?? ''
  } finally {
    locationLoading.value = false
  }
}

watch(
  coordPair,
  () => {
    void loadLocationLabel()
  },
  { immediate: true },
)

const attachedVideos = computed(() => {
  const p = post.value as Encyclopedia | null
  if (!p) return []
  const list = p.videos
  if (!Array.isArray(list) || list.length === 0) return []
  return list.filter((v): v is { id: number; path: string } =>
    Boolean(v && typeof v.path === 'string' && v.path.trim() !== ''),
  )
})

function encyclopediaVideoSrc(path: string): string {
  return resolvePublicMediaUrl(path.trim())
}

const publishedLabel = computed(() =>
  formatPublished((post.value as Encyclopedia | null)?.published_at),
)

usePageSeo(
  {
    meta_title: '',
    meta_description: '',
    og_title: '',
    og_description: '',
    og_image: '',
  },
  {
    title: `${(post.value as Encyclopedia).title} — энциклопедия`,
    description: (post.value as Encyclopedia).subtitle || '',
    ogImage: heroImageSrc.value || undefined,
  },
)
</script>

<template>
  <div v-if="post">
    <section class="relative overflow-hidden pt-[72px]">
      <div class="absolute inset-0" aria-hidden="true">
        <img
          v-if="heroImageSrc"
          :src="heroImageSrc"
          alt=""
          class="h-full w-full object-cover"
        />
        <div v-else class="h-full w-full bg-ink" />
        <div class="absolute inset-0 bg-gradient-to-b from-ink/45 via-ink/55 to-ink/80" />
      </div>
      <div class="container-x relative pb-24 pt-12 sm:pb-28 sm:pt-16">
        <Reveal>
          <div class="flex flex-wrap items-center gap-3">
            <span
              class="rounded-full bg-moss px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white"
            >
              {{ categoryBadgeLabel(post.category) }}
            </span>
            <nav class="flex items-center gap-1.5 text-[13px] text-white/70">
              <NuxtLink to="/" class="transition-colors hover:text-white">Главная</NuxtLink>
              <ChevronRight class="h-3.5 w-3.5" />
              <NuxtLink to="/encyclopedia" class="transition-colors hover:text-white">
                Энциклопедия
              </NuxtLink>
              <ChevronRight class="h-3.5 w-3.5" />
              <span class="max-w-[40vw] truncate text-white">{{ post.title }}</span>
            </nav>
          </div>
        </Reveal>

        <Reveal :delay="0.08">
          <h1
            class="mt-10 max-w-4xl font-display text-4xl font-medium leading-[1.08] tracking-tightest text-white sm:text-5xl lg:text-6xl"
          >
            {{ post.title }}
          </h1>
        </Reveal>
        <Reveal v-if="post.subtitle" :delay="0.16">
          <p class="mt-6 max-w-2xl text-[16.5px] leading-relaxed text-white/80">
            {{ post.subtitle }}
          </p>
        </Reveal>
        <Reveal v-if="coordPair || coordLabelFallback" :delay="0.22">
          <button
            v-if="coordPair"
            type="button"
            class="mt-6 inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-[11px] font-medium tracking-wide text-white/90 backdrop-blur-sm transition hover:bg-white/20"
            @click="openInMap(coordPair.lat, coordPair.lng)"
          >
            <MapPin class="h-3 w-3 shrink-0 text-sand" />
            <CoordinatesDmsDisplay
              variant="hero"
              :latitude="coordPair.lat"
              :longitude="coordPair.lng"
            />
          </button>
          <p
            v-else
            class="mt-6 inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/90"
          >
            <MapPin class="h-3 w-3 shrink-0 text-sand" />
            {{ coordLabelFallback }}
          </p>
        </Reveal>
      </div>
    </section>

    <section class="container-x relative z-10 -mt-10">
      <Reveal>
        <div
          class="grid gap-4 rounded-3xl border border-line bg-white p-5 shadow-[0_24px_48px_-28px_rgb(27_30_23/0.25)] sm:grid-cols-3 sm:p-6"
        >
          <div class="flex items-center gap-4">
            <span
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-moss-wash text-moss"
            >
              <Tag class="h-5 w-5" />
            </span>
            <div>
              <p
                class="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
              >
                Категория
              </p>
              <p class="mt-1 text-[15px] font-semibold text-ink">
                {{ categoryShortLabel(post.category) }}
              </p>
            </div>
          </div>
          <div v-if="publishedLabel" class="flex items-center gap-4">
            <span
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-moss-wash text-moss"
            >
              <CalendarDays class="h-5 w-5" />
            </span>
            <div>
              <p
                class="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
              >
                Опубликовано
              </p>
              <p class="mt-1 text-[15px] font-semibold text-ink">{{ publishedLabel }}</p>
            </div>
          </div>
          <div v-if="locationLabel || locationLoading" class="flex items-center gap-4">
            <span
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-moss-wash text-moss"
            >
              <MapPin class="h-5 w-5" />
            </span>
            <div>
              <p
                class="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
              >
                Локация
              </p>
              <p class="mt-1 text-[15px] font-semibold text-ink">
                {{ locationLoading ? '…' : locationLabel }}
              </p>
            </div>
          </div>
        </div>
      </Reveal>
    </section>

    <section class="container-x py-16 sm:py-20">
      <div class="grid gap-12 lg:grid-cols-[1fr_320px]">
        <div class="max-w-3xl">
          <Reveal>
            <p class="eyebrow">Описание</p>
          </Reveal>
          <Reveal v-if="post.content" :delay="0.06" class="mt-6">
            <TiptapHtml
              :content="post.content"
              wrapper-class="encyclopedia-prose max-w-none text-ink-soft"
            />
          </Reveal>

          <Reveal class="mt-12">
            <NuxtLink
              to="/encyclopedia"
              class="group inline-flex items-center gap-2 text-[14px] font-semibold text-moss"
            >
              <ArrowLeft
                class="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1"
              />
              Вся энциклопедия
            </NuxtLink>
          </Reveal>
        </div>

        <aside class="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <Reveal v-if="coordPair" :delay="0.1">
            <div class="overflow-hidden rounded-3xl border border-line bg-white">
              <ClientOnly>
                <div
                  v-if="showMapboxMap && mapboxOptions"
                  class="relative h-56 w-full overflow-hidden bg-paper-deep"
                >
                  <MapboxMap :map-id="mapboxMapId" :options="mapboxOptions">
                    <MapboxDefaultMarker :marker-id="mapboxMarkerId" :lnglat="markerLngLat" />
                  </MapboxMap>
                </div>
                <div
                  v-else-if="showYandexMap"
                  class="relative h-56 w-full overflow-hidden bg-paper-deep"
                >
                  <EncyclopediaYandexMap
                    :lng="coordPair.lng"
                    :lat="coordPair.lat"
                    :title="post.title || undefined"
                  />
                </div>
                <div
                  v-else
                  class="flex h-56 items-center justify-center bg-paper-deep px-4 text-center text-sm text-muted-foreground"
                >
                  Карта недоступна без ключа Mapbox или Яндекс.Карт
                </div>
              </ClientOnly>
              <div class="p-5">
                <p
                  class="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
                >
                  Расположение
                </p>
                <p class="mt-2 text-[13.5px] font-medium leading-relaxed text-ink">
                  <CoordinatesDmsDisplay
                    variant="inline"
                    :latitude="coordPair.lat"
                    :longitude="coordPair.lng"
                  />
                </p>
              </div>
            </div>
          </Reveal>
        </aside>
      </div>
    </section>

    <section v-if="galleryPaths.length > 0" class="container-x pb-16 sm:pb-20">
      <Reveal>
        <div class="mb-8 flex items-center gap-3">
          <Images class="h-5 w-5 text-moss" />
          <h2 class="font-display text-2xl font-semibold text-ink sm:text-3xl">Галерея</h2>
        </div>
      </Reveal>
      <div class="aspect-[21/9] mb-4 overflow-hidden rounded-[2rem] border border-line bg-paper-deep">
        <img
          :src="galleryPaths[gallerySelected]"
          :alt="`${post.title} — фото ${gallerySelected + 1}`"
          class="h-full w-full object-cover object-center"
        />
      </div>
      <div v-if="galleryPaths.length > 1" class="flex flex-wrap gap-3">
        <button
          v-for="(src, i) in galleryPaths"
          :key="i"
          type="button"
          class="h-16 w-24 overflow-hidden rounded-lg transition-all duration-300 lg:h-20 lg:w-32"
          :class="
            gallerySelected === i
              ? 'ring-2 ring-moss ring-offset-2'
              : 'opacity-60 hover:opacity-100'
          "
          @click="gallerySelected = i"
        >
          <img :src="src" :alt="`Миниатюра ${i + 1}`" class="h-full w-full object-cover" />
        </button>
      </div>
    </section>

    <section v-if="attachedVideos.length" class="container-x pb-16 sm:pb-20">
      <Reveal>
        <h2 class="mb-8 font-display text-2xl font-semibold text-ink sm:text-3xl">Видео</h2>
      </Reveal>
      <div class="flex flex-col gap-10">
        <SiteMediaVideoPlayer
          v-for="(v, idx) in attachedVideos"
          :key="v.id ?? idx"
          :src="encyclopediaVideoSrc(v.path)"
          :caption="attachedVideos.length > 1 ? `Фрагмент ${idx + 1}` : undefined"
        />
      </div>
    </section>

    <section
      v-if="coordPair || coordLabelFallback"
      class="border-t border-line bg-paper-deep/60 py-16 sm:py-20"
    >
      <div class="container-x">
        <h2 class="mb-8 font-display text-2xl font-semibold text-ink sm:text-3xl">
          Расположение на карте
        </h2>
        <ClientOnly>
          <div
            v-if="showMapboxMap && mapboxOptions"
            class="relative h-[min(420px,55vw)] max-h-[520px] min-h-[280px] w-full overflow-hidden rounded-[2rem] border border-line bg-paper-deep"
          >
            <MapboxMap :map-id="`${mapboxMapId}-large`" :options="mapboxOptions">
              <MapboxDefaultMarker
                :marker-id="`${mapboxMarkerId}-large`"
                :lnglat="markerLngLat"
              />
            </MapboxMap>
          </div>
          <div
            v-else-if="showYandexMap && coordPair"
            class="relative h-[min(420px,55vw)] max-h-[520px] min-h-[280px] w-full overflow-hidden rounded-[2rem] border border-line bg-paper-deep"
          >
            <EncyclopediaYandexMap
              :lng="coordPair.lng"
              :lat="coordPair.lat"
              :title="post.title || undefined"
            />
          </div>
          <div
            v-else
            class="flex h-[min(420px,55vw)] max-h-[520px] min-h-[280px] w-full flex-col items-center justify-center gap-2 rounded-[2rem] border border-dashed border-line bg-white px-4 text-center text-sm text-muted-foreground"
          >
            <p>
              Для встраивания карты добавьте ключ Mapbox или Яндекс.Карт в
              <code class="rounded bg-paper-deep px-1 py-0.5 text-xs">.env</code>
            </p>
          </div>
        </ClientOnly>
      </div>
    </section>
  </div>
</template>

<style scoped>
:deep(.encyclopedia-prose p) {
  color: #45493f;
  line-height: 1.7;
  margin-bottom: 1rem;
  font-size: 16px;
}
:deep(.encyclopedia-prose h2),
:deep(.encyclopedia-prose h3) {
  font-family: 'Playfair Display', Georgia, serif;
  color: #1b1e17;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}
:deep(.encyclopedia-prose a) {
  color: #5e7a45;
  text-decoration: underline;
}
</style>
