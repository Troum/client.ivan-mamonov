// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

/** Mapbox: https://account.mapbox.com/access-tokens/ — NUXT_PUBLIC_ или PUBLIC_ */
const mapboxAccessToken =
  process.env.NUXT_PUBLIC_MAPBOX_ACCESS_TOKEN ||
  process.env.PUBLIC_MAPBOX_ACCESS_TOKEN ||
  import.meta.env.NUXT_PUBLIC_MAPBOX_ACCESS_TOKEN ||
  ''

/** Яндекс.Карты JS API 3: https://developer.tech.yandex.ru/services/ */
const yandexMapsApiKey =
  process.env.NUXT_PUBLIC_YANDEX_MAPS_API_KEY ||
  process.env.PUBLIC_YANDEX_MAPS_API_KEY ||
  import.meta.env.NUXT_PUBLIC_YANDEX_MAPS_API_KEY ||
  ''

const apiBaseFromEnv = import.meta.env.NUXT_PUBLIC_API_BASE
const publicApiBase =
  apiBaseFromEnv !== undefined && apiBaseFromEnv !== ''
    ? apiBaseFromEnv
    : 'https://api.ivanmamonov.test/api'
const useViteApiProxy = !/^https?:\/\//i.test(publicApiBase)

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,
  app: {
    head: {
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
      title: 'Иван Мамонов',
    },
  },
  css: [
    'mapbox-gl/dist/mapbox-gl.css',
    'vue-yandex-maps/css',
    './app/assets/css/main.css',
  ],
  modules: ['@pinia/nuxt', 'nuxt-mapbox', 'vue-yandex-maps/nuxt'],
  mapbox: {
    accessToken: mapboxAccessToken,
    persistent: false,
  },
  yandexMaps: {
    apikey: yandexMapsApiKey,
    lang: 'ru_RU',
  },
  runtimeConfig: {
    public: {
      apiBase: publicApiBase,
    },
  },
  vite: {
    plugins: [tailwindcss()],
    server: useViteApiProxy
      ? {
          proxy: {
            '/api': {
              target: import.meta.env.NUXT_API_PROXY_TARGET || 'http://127.0.0.1:8000',
              changeOrigin: true,
            },
          },
        }
      : {},
  },
})
