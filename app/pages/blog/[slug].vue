<script setup lang="ts">
import { useRoute } from 'vue-router'
import type { Post } from '~/interfaces/Post'
import { useFilters } from '~/composables/useFilters'

const nuxtApp = useNuxtApp()
const route = useRoute()
const { formatCoordinatesDecimal, shortenFormattedCoordinateDecimals } = useFilters()

const contentApi = useContentApi()

const { data: post, error: postError } = await useAsyncData(
  `blog-post-${String(route.params.slug ?? '')}`,
  () => contentApi.fetchPostBySlug(String(route.params.slug ?? '')),
  { server: false, watch: [() => route.params.slug] }
)

if (postError.value || !post.value) {
  throw createError({ statusCode: 404, statusMessage: 'Пост не найден' })
}

const heroImageUrl = computed(() => (post.value as Post | null)?.preview_image?.path ?? null)

const additionalMainImages = computed(() => {
  const mains = (post.value as Post | null)?.main_images
  return Array.isArray(mains) ? mains : []
})

const lightboxOpen = ref(false)
const lightboxIndex = ref(0)

watch(
  () => route.params.slug,
  () => {
    lightboxOpen.value = false
    lightboxIndex.value = 0
  }
)

watch(lightboxOpen, (open) => {
  if (import.meta.client) {
    document.body.style.overflow = open ? 'hidden' : ''
  }
})

function openLightbox(index: number) {
  lightboxIndex.value = index
  lightboxOpen.value = true
}

function closeLightbox() {
  lightboxOpen.value = false
}

function lightboxPrev() {
  const n = additionalMainImages.value.length
  if (n <= 1) return
  lightboxIndex.value = (lightboxIndex.value - 1 + n) % n
}

function lightboxNext() {
  const n = additionalMainImages.value.length
  if (n <= 1) return
  lightboxIndex.value = (lightboxIndex.value + 1) % n
}

function onLightboxKeydown(e: KeyboardEvent) {
  if (!lightboxOpen.value) return
  if (e.key === 'Escape') {
    e.preventDefault()
    closeLightbox()
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault()
    lightboxPrev()
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    lightboxNext()
  }
}

onMounted(() => {
  if (import.meta.client) {
    window.addEventListener('keydown', onLightboxKeydown)
  }
})

onUnmounted(() => {
  if (import.meta.client) {
    document.body.style.overflow = ''
    window.removeEventListener('keydown', onLightboxKeydown)
  }
})

const coordPair = computed(() => {
  const c = (post.value as Post | null)?.coordinates
  if (!c || c.latitude == null || c.longitude == null) return null
  return {
    lat: Number(c.latitude),
    lng: Number(c.longitude),
    latLabel: c.latitude_label ?? 'N',
    lngLabel: c.longitude_label ?? 'E',
  }
})

const coordLabel = computed(() => {
  const pair = coordPair.value
  if (pair) {
    return formatCoordinatesDecimal({ lat: pair.lat, lng: pair.lng }, pair.latLabel, pair.lngLabel)
  }
  const c = (post.value as Post | null)?.coordinates
  if (c?.formatted?.trim()) return shortenFormattedCoordinateDecimals(c.formatted)
  return ''
})

function openInMap(lat: number, lng: number) {
  const fn = nuxtApp.$openMap as ((a: number, b: number, c?: string) => void) | undefined
  fn?.(lat, lng, (post.value as unknown as Post)?.title ?? '')
}

function titleParts(title: string) {
  const t = title.trim()
  const space = t.indexOf(' ')
  if (space === -1) return { first: t, rest: '' }
  return { first: t.slice(0, space), rest: t.slice(space) }
}

const breadcrumbs = computed(() => {
  const p = post.value as Post | null
  const title = p?.title?.trim() || 'Запись'
  return [
    { label: 'Главная', to: '/' },
    { label: 'Блог', to: '/blog' },
    { label: title },
  ]
})
</script>

<template>
  <template v-if="post">
    <div class="min-h-screen bg-white">
      <AppBreadcrumbs :items="breadcrumbs" />

      <section class="min-h-screen flex flex-col lg:flex-row">
        <div
          class="flex-1 flex flex-col justify-center px-6 lg:pl-24 lg:pr-16 py-24 lg:py-32 order-2 lg:order-1 relative"
        >
          <div v-if="coordLabel" class="mb-6">
            <button
              v-if="coordPair"
              type="button"
              class="font-mono text-sm text-gray-500 tracking-wider hover:text-olivine-600 text-left"
              @click="openInMap(coordPair.lat, coordPair.lng)"
            >
              {{ coordLabel }}
            </button>
            <span v-else class="font-mono text-sm text-gray-500 tracking-wider">{{ coordLabel }}</span>
          </div>

          <h1
            class="text-4xl lg:text-5xl xl:text-6xl font-extrabold text-gray-900 tracking-tight leading-none mb-8"
          >
            <span class="text-olivine-400">{{ titleParts(post.title as unknown as string).first }}</span
            >{{ titleParts(post.title as unknown as string).rest }}
          </h1>

          <div
            v-if="post.subtitle"
            class="hidden lg:block absolute left-6 lg:left-8 top-1/2 -translate-y-1/2 pointer-events-none"
          >
            <span
              class="writing-vertical-lr text-xs tracking-widest text-gray-400 uppercase inline-block"
              style="transform: rotate(180deg)"
            >
              {{ post.subtitle }}
            </span>
          </div>

          <div v-if="post.content">
            <TiptapHtml
              :content="post.content"
              wrapper-class="tiptap-article max-w-xl text-gray-700 leading-relaxed"
            />
          </div>
        </div>

        <div
          class="flex-1 h-[50vh] lg:h-auto lg:sticky lg:top-0 lg:self-start order-1 lg:order-2 min-w-0 w-full lg:min-h-screen"
        >
          <div v-if="heroImageUrl" class="relative h-[50vh] w-full min-w-0 overflow-hidden bg-neutral-100 lg:h-screen">
            <img
              :src="heroImageUrl"
              class="block h-full w-full object-cover object-center"
              :sizes="`(max-width: 1024px) 100vw, 50vw`"
              decoding="async"
              :alt="String(post.title ?? '')"
            />
          </div>
          <div
            v-else
            class="h-[50vh] w-full bg-linear-to-br from-olivine-200 to-olivine-800 lg:h-screen"
            aria-hidden="true"
          />
        </div>
      </section>

      <section
        v-if="additionalMainImages.length"
        class="border-t border-gray-100 bg-white"
      >
        <div class="px-6 py-16 lg:pl-24 lg:pr-16 lg:py-20">
          <h2 class="mb-8 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
            Дополнительные изображения
          </h2>
          <div class="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
            <button
              v-for="(img, i) in additionalMainImages"
              :key="img.id ?? img.path"
              type="button"
              class="group relative aspect-[4/3] overflow-hidden rounded-xl bg-neutral-100 ring-1 ring-black/5 transition hover:ring-olivine-400/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-olivine-500"
              @click="openLightbox(i)"
            >
              <img
                :src="img.path"
                class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                loading="lazy"
                decoding="async"
                :alt="`${String(post.title ?? '')} — ${i + 1}`"
              />
            </button>
          </div>
        </div>
      </section>

      <Teleport to="body">
        <div
          v-if="lightboxOpen && additionalMainImages[lightboxIndex]"
          class="fixed inset-0 z-200 flex flex-col bg-black/95"
          role="dialog"
          aria-modal="true"
          aria-label="Просмотр изображения"
        >
          <button
            type="button"
            class="absolute right-4 top-4 z-10 rounded-full p-2 text-white/90 hover:bg-white/10 hover:text-white"
            aria-label="Закрыть"
            @click="closeLightbox"
          >
            <HeroUiIcon name="i-heroicons-x-mark" icon-class="h-8 w-8" />
          </button>
          <div class="flex min-h-0 flex-1 items-center justify-center p-4 pt-16" @click.self="closeLightbox">
            <img
              :src="additionalMainImages[lightboxIndex]!.path"
              class="max-h-[85vh] max-w-full object-contain"
              :alt="String(post.title ?? '')"
            />
          </div>
          <div
            v-if="additionalMainImages.length > 1"
            class="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-6"
          >
            <div
              class="pointer-events-auto flex items-center gap-2 rounded-full bg-black/50 px-3 py-2 backdrop-blur-sm"
            >
              <button
                type="button"
                class="p-2 text-white/90 hover:text-white"
                aria-label="Предыдущее фото"
                @click="lightboxPrev"
              >
                <HeroUiIcon name="i-heroicons-arrow-long-left" icon-class="text-[22px] w-7 h-7" />
              </button>
              <span class="min-w-16 text-center text-sm tabular-nums text-white/85">
                {{ lightboxIndex + 1 }} / {{ additionalMainImages.length }}
              </span>
              <button
                type="button"
                class="p-2 text-white/90 hover:text-white"
                aria-label="Следующее фото"
                @click="lightboxNext"
              >
                <HeroUiIcon name="i-heroicons-arrow-long-right" icon-class="text-[22px] w-7 h-7" />
              </button>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </template>
</template>

<style scoped>
:deep(.tiptap-article p) {
  margin-bottom: 0.75em;
  color: rgb(55 65 81);
  line-height: 1.625;
}
</style>
