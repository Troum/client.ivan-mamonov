import { openMap } from '~/utils/openMap'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide('openMap', (lat: number, lng: number, label?: string) => openMap(lat, lng, label ?? ''))
})
