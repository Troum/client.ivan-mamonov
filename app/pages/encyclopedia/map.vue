<script setup lang="ts">
import { ChevronRight, List, Map as MapIcon, MapPin } from '@lucide/vue'
import type { MapLocation } from '~/interfaces/MapLocation'
import {
  defaultSiteEncyclopediaSection,
  loadSiteEncyclopediaSection,
} from '~/composables/useSiteContent'
import { resolvePublicMediaUrl } from '~/composables/usePageSeo'

const contentApi = useContentApi()

const { data: encSectionData } = await useAsyncData('site-encyclopedia-section', () =>
  loadSiteEncyclopediaSection(),
  { default: () => defaultSiteEncyclopediaSection() },
)

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
    ogImage: es.seo.og_image?.trim() || es.hero_background_image || '/images/hero-encyclopedia.jpg',
  },
)

const { data: locationsData } = await useAsyncData('encyclopedia-map-locations', () =>
  contentApi.fetchMapLocations(),
)

const locations = computed(() => (locationsData.value ?? []) as MapLocation[])

function cardLink(loc: MapLocation) {
  if (loc.encyclopedia_slug) return `/encyclopedia/${encodeURIComponent(loc.encyclopedia_slug)}`
  return null
}

function thumb(loc: MapLocation) {
  const img = (loc as MapLocation & { preview_image?: { path?: string } }).preview_image?.path
  if (img) return resolvePublicMediaUrl(img)
  return '/images/hero-encyclopedia.jpg'
}
</script>

<template>
  <div>
    <section class="relative overflow-hidden pt-[72px]">
      <div class="pointer-events-none absolute inset-0" aria-hidden="true">
        <img
          src="/images/hero-encyclopedia.jpg"
          alt=""
          class="h-full w-full object-cover object-center opacity-[0.16]"
        />
        <div class="absolute inset-0 bg-gradient-to-b from-paper/40 via-paper/70 to-paper" />
      </div>
      <div class="container-x relative pb-10 pt-14 sm:pt-20">
        <Reveal>
          <nav class="flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <NuxtLink to="/" class="transition-colors hover:text-moss">Главная</NuxtLink>
            <ChevronRight class="h-3.5 w-3.5" />
            <NuxtLink to="/encyclopedia" class="transition-colors hover:text-moss">
              Энциклопедия
            </NuxtLink>
            <ChevronRight class="h-3.5 w-3.5" />
            <span class="text-ink">Карта</span>
          </nav>
        </Reveal>
        <Reveal :delay="0.08">
          <p class="eyebrow mt-10">Энциклопедия Приморья</p>
        </Reveal>
        <Reveal :delay="0.14">
          <h1 class="display-1 mt-4 max-w-3xl text-5xl sm:text-6xl">
            Все места <em class="italic text-moss">на карте</em>
          </h1>
        </Reveal>
        <Reveal :delay="0.2">
          <p class="mt-6 max-w-xl text-[17px] leading-relaxed text-ink-soft">
            {{ locations.length }} локаций из энциклопедии — от Владивостока до Находки и самых
            отдалённых островов края.
          </p>
        </Reveal>

        <Reveal :delay="0.24">
          <div class="mt-8 inline-flex rounded-full border border-line bg-white p-1.5">
            <NuxtLink
              to="/encyclopedia"
              class="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13.5px] font-semibold text-ink-soft transition-colors hover:text-moss"
            >
              <List class="h-4 w-4" />
              Список
            </NuxtLink>
            <span
              class="inline-flex items-center gap-2 rounded-full bg-moss px-5 py-2.5 text-[13.5px] font-semibold text-white shadow-[0_8px_20px_-8px_rgb(94_122_69/0.6)]"
            >
              <MapIcon class="h-4 w-4" />
              Карта
            </span>
          </div>
        </Reveal>
      </div>
    </section>

    <section class="container-x pb-16">
      <Reveal>
        <div
          class="h-[420px] overflow-hidden rounded-[2rem] border border-line shadow-[0_32px_64px_-40px_rgb(27_30_23/0.35)] sm:h-[560px]"
        >
          <EncyclopediaLocationsMap :locations="locations" />
        </div>
      </Reveal>

      <Reveal class="mt-6">
        <div
          class="flex flex-wrap items-center gap-5 text-[13px] font-medium text-muted-foreground"
        >
          <span class="flex items-center gap-2">
            <span class="h-3 w-3 rounded-full bg-moss" />
            История
          </span>
          <span class="flex items-center gap-2">
            <span class="h-3 w-3 rounded-full bg-[#C98A4B]" />
            События
          </span>
          <span class="flex items-center gap-2">
            <span class="h-3 w-3 rounded-full bg-[#5A8BA0]" />
            Природа
          </span>
          <span class="ml-auto hidden sm:block">
            Нажмите на точку, чтобы открыть материал
          </span>
        </div>
      </Reveal>
    </section>

    <section v-if="locations.length > 0" class="container-x pb-24">
      <Reveal>
        <h2 class="font-display text-2xl font-semibold text-ink sm:text-3xl">Места на карте</h2>
      </Reveal>
      <div class="mt-8 grid gap-4 sm:grid-cols-2">
        <div
          v-for="loc in locations"
          :key="loc.id"
          class="group overflow-hidden rounded-3xl border border-line bg-white transition-all hover:border-moss/40"
        >
          <component
            :is="cardLink(loc) ? 'NuxtLink' : 'div'"
            :to="cardLink(loc) || undefined"
            class="block p-5"
          >
            <div class="flex gap-4">
              <div
                class="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-paper-deep"
              >
                <img
                  :src="thumb(loc)"
                  :alt="loc.title"
                  class="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div class="min-w-0 flex-1">
                <h3
                  class="font-display text-lg font-semibold text-ink transition-colors group-hover:text-moss"
                >
                  {{ loc.title }}
                </h3>
                <p
                  v-if="loc.description"
                  class="mt-1 line-clamp-2 text-[13.5px] leading-relaxed text-muted-foreground"
                >
                  {{ loc.description }}
                </p>
                <p class="mt-2 inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
                  <MapPin class="h-3.5 w-3.5 text-moss" />
                  <CoordinatesDmsDisplay
                    variant="map-list"
                    :latitude="loc.latitude"
                    :longitude="loc.longitude"
                  />
                </p>
              </div>
            </div>
          </component>
        </div>
      </div>
    </section>

    <section v-else class="container-x pb-24">
      <div
        class="rounded-3xl border border-dashed border-line bg-white/60 px-8 py-16 text-center"
      >
        <p class="font-display text-xl text-ink">Пока нет точек на карте</p>
        <p class="mt-2 text-[15px] text-muted-foreground">
          Локации появятся, когда у статей энциклопедии будут заданы координаты.
        </p>
      </div>
    </section>
  </div>
</template>
