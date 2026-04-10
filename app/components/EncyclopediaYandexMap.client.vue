<script setup lang="ts">
import { computed } from 'vue'
import {
  YandexMap,
  YandexMapDefaultFeaturesLayer,
  YandexMapDefaultMarker,
  YandexMapDefaultSchemeLayer,
} from 'vue-yandex-maps'

const props = defineProps<{
  lng: number
  lat: number
  title?: string
}>()

const mapSettings = computed(() => ({
  location: {
    center: [props.lng, props.lat] as [number, number],
    zoom: 7,
  },
}))

const markerSettings = computed(() => ({
  coordinates: [props.lng, props.lat] as [number, number],
  title: props.title?.trim() || undefined,
}))
</script>

<template>
  <YandexMap class="h-full w-full rounded-2xl" width="100%" height="100%" :settings="mapSettings">
    <YandexMapDefaultSchemeLayer />
    <YandexMapDefaultFeaturesLayer />
    <YandexMapDefaultMarker :settings="markerSettings" />
  </YandexMap>
</template>
