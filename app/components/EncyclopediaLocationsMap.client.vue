<script setup lang="ts">
import { computed } from 'vue'
import {
  YandexMap,
  YandexMapDefaultFeaturesLayer,
  YandexMapDefaultMarker,
  YandexMapDefaultSchemeLayer,
} from 'vue-yandex-maps'
import type { MapLocation } from '~/interfaces/MapLocation'

const props = defineProps<{
  locations: MapLocation[]
}>()

const runtimeConfig = useRuntimeConfig()

const hasMapboxToken = computed(() => {
  const t = runtimeConfig.public.mapbox?.accessToken
  return typeof t === 'string' && t.length > 0
})

const hasYandexMapsKey = computed(() => {
  const y = runtimeConfig.public.yandexMaps as { apikey?: string } | undefined
  const k = y?.apikey
  return typeof k === 'string' && k.length > 0
})

const points = computed(() => {
  return props.locations
    .filter((l) => Number.isFinite(l.latitude) && Number.isFinite(l.longitude))
    .map((l) => ({
      id: l.id,
      title: l.title,
      lat: l.latitude,
      lng: l.longitude,
      slug: l.encyclopedia_slug,
      description: l.description,
    }))
})

function centerZoomForPoints(pts: { lat: number; lng: number }[]): {
  center: [number, number]
  zoom: number
} {
  if (pts.length === 0) return { center: [131.9, 43.12], zoom: 6 }
  if (pts.length === 1) return { center: [pts[0].lng, pts[0].lat], zoom: 8 }
  let minLat = 90
  let maxLat = -90
  let minLng = 180
  let maxLng = -180
  for (const p of pts) {
    minLat = Math.min(minLat, p.lat)
    maxLat = Math.max(maxLat, p.lat)
    minLng = Math.min(minLng, p.lng)
    maxLng = Math.max(maxLng, p.lng)
  }
  const cLat = (minLat + maxLat) / 2
  const cLng = (minLng + maxLng) / 2
  const latSpan = maxLat - minLat
  const lngSpan = maxLng - minLng
  const span = Math.max(latSpan, lngSpan * 0.75)
  let zoom = 7
  if (span > 8) zoom = 5
  else if (span > 4) zoom = 6
  else if (span > 1.5) zoom = 7
  else if (span > 0.5) zoom = 8
  else zoom = 9
  return { center: [cLng, cLat], zoom }
}

const view = computed(() => centerZoomForPoints(points.value))

const mapboxMapId = 'encyclopedia-locations-map'

const mapboxOptions = computed(() => {
  const p = points.value
  if (p.length === 0) return null
  const { center, zoom } = view.value
  return {
    style: 'mapbox://styles/mapbox/light-v11',
    center: center as [number, number],
    zoom,
  }
})

const showMapboxMap = computed(() => hasMapboxToken.value && !!mapboxOptions.value && points.value.length > 0)

const yandexMapSettings = computed(() => ({
  location: {
    center: view.value.center,
    zoom: view.value.zoom,
  },
}))

const showYandexMap = computed(
  () => !showMapboxMap.value && hasYandexMapsKey.value && points.value.length > 0
)

function markerSettings(m: { lng: number; lat: number; title: string }) {
  return {
    coordinates: [m.lng, m.lat] as [number, number],
    title: m.title?.trim() || undefined,
  }
}
</script>

<template>
  <div class="h-full w-full">
    <div
      v-if="showMapboxMap && mapboxOptions"
      class="relative h-full min-h-[280px] w-full overflow-hidden bg-paper-deep"
    >
      <MapboxMap :map-id="mapboxMapId" class="h-full w-full" :options="mapboxOptions">
        <MapboxDefaultMarker
          v-for="m in points"
          :key="m.id"
          :marker-id="`ency-loc-${m.id}`"
          :lnglat="[m.lng, m.lat] as [number, number]"
        />
      </MapboxMap>
    </div>

    <div
      v-else-if="showYandexMap"
      class="relative h-full min-h-[280px] w-full overflow-hidden bg-paper-deep"
    >
      <YandexMap
        class="h-full w-full"
        width="100%"
        height="100%"
        :settings="yandexMapSettings"
      >
        <YandexMapDefaultSchemeLayer />
        <YandexMapDefaultFeaturesLayer />
        <YandexMapDefaultMarker
          v-for="m in points"
          :key="m.id"
          :settings="markerSettings(m)"
        />
      </YandexMap>
    </div>

    <div
      v-else-if="points.length === 0"
      class="flex h-full min-h-[240px] w-full flex-col items-center justify-center gap-3 bg-paper px-4 text-center text-sm text-muted-foreground"
    >
      <p>Пока нет точек на карте. Они появятся после добавления меток в админке.</p>
    </div>

    <div
      v-else
      class="flex h-full min-h-[240px] w-full flex-col items-center justify-center gap-2 bg-paper px-4 text-center text-sm text-muted-foreground"
    >
      <p>
        Для карты добавьте в <code class="rounded bg-paper-deep px-1 py-0.5 text-xs">.env</code> токен Mapbox
        (<code class="rounded bg-paper-deep px-1 py-0.5 text-xs">PUBLIC_MAPBOX_ACCESS_TOKEN</code>) или ключ Яндекс.Карт
        (<code class="rounded bg-paper-deep px-1 py-0.5 text-xs">PUBLIC_YANDEX_MAPS_API_KEY</code>).
      </p>
    </div>
  </div>
</template>
