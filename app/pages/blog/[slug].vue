<script setup lang="ts">
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  MapPin,
  X,
  ArrowLeft as ArrowLongLeft,
  ArrowRight as ArrowLongRight,
} from '@lucide/vue'
import type { Post } from '~/interfaces/Post'
import { useFilters } from '~/composables/useFilters'
import { resolvePublicMediaUrl } from '~/composables/usePageSeo'

const nuxtApp = useNuxtApp()
const route = useRoute()
const { shortenFormattedCoordinateDecimals } = useFilters()

const contentApi = useContentApi()

const { data: post, error: postError } = await useAsyncData(
  `blog-post-${String(route.params.slug ?? '')}`,
  () => contentApi.fetchPostBySlug(String(route.params.slug ?? '')),
  { server: false, watch: [() => route.params.slug] },
)

if (postError.value || !post.value) {
  throw createError({ statusCode: 404, statusMessage: 'Пост не найден' })
}

const heroImageUrl = computed(() => {
  const path = (post.value as Post | null)?.preview_image?.path
  return path ? resolvePublicMediaUrl(path) : null
})

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
  },
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

const coordLabelFallback = computed(() => {
  if (coordPair.value) return ''
  const c = (post.value as Post | null)?.coordinates
  if (c?.formatted?.trim()) return shortenFormattedCoordinateDecimals(c.formatted)
  return ''
})

function openInMap(lat: number, lng: number) {
  const fn = nuxtApp.$openMap as ((a: number, b: number, c?: string) => void) | undefined
  fn?.(lat, lng, (post.value as unknown as Post)?.title ?? '')
}

function formatPublished(iso: string | null | undefined) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

const publishedLabel = computed(() =>
  formatPublished((post.value as Post | null)?.published_at),
)

const p = post.value as Post
usePageSeo(
  {
    meta_title: '',
    meta_description: '',
    og_title: '',
    og_description: '',
    og_image: '',
  },
  {
    title: `${p.title} — блог`,
    description: p.subtitle || '',
    ogImage: heroImageUrl.value || undefined,
  },
)
</script>

<template>
  <div v-if="post">
    <section class="relative overflow-hidden pt-[72px]">
      <div class="absolute inset-0" aria-hidden="true">
        <img
          v-if="heroImageUrl"
          :src="heroImageUrl"
          alt=""
          class="h-full w-full object-cover"
        />
        <div v-else class="h-full w-full bg-ink" />
        <div class="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/50 to-ink/80" />
      </div>
      <div class="container-x relative pb-24 pt-12 sm:pb-28 sm:pt-16">
        <Reveal>
          <div class="flex flex-wrap items-center gap-3">
            <span
              class="rounded-full bg-sand px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink"
            >
              Блог
            </span>
            <nav class="flex items-center gap-1.5 text-[13px] text-white/70">
              <NuxtLink to="/" class="transition-colors hover:text-white">Главная</NuxtLink>
              <ChevronRight class="h-3.5 w-3.5" />
              <NuxtLink to="/blog" class="transition-colors hover:text-white">Блог</NuxtLink>
              <ChevronRight class="h-3.5 w-3.5" />
              <span class="max-w-[40vw] truncate text-white">{{ post.title }}</span>
            </nav>
          </div>
        </Reveal>

        <Reveal :delay="0.08">
          <h1
            class="mt-10 max-w-4xl font-display text-4xl font-medium leading-[1.08] tracking-tightest text-white sm:text-5xl lg:text-[64px]"
          >
            {{ post.title }}
          </h1>
        </Reveal>
        <Reveal v-if="post.subtitle" :delay="0.16">
          <p class="mt-6 max-w-2xl text-[17px] leading-relaxed text-white/80">
            {{ post.subtitle }}
          </p>
        </Reveal>
        <Reveal :delay="0.22">
          <div class="mt-8 flex flex-wrap items-center gap-3 text-[13px] font-medium text-white/85">
            <span
              v-if="publishedLabel"
              class="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 backdrop-blur-sm"
            >
              <CalendarDays class="h-4 w-4 text-sand" />
              {{ publishedLabel }}
            </span>
            <button
              v-if="coordPair"
              type="button"
              class="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 backdrop-blur-sm transition hover:bg-white/20"
              @click="openInMap(coordPair.lat, coordPair.lng)"
            >
              <MapPin class="h-4 w-4 text-sand" />
              <CoordinatesDmsDisplay
                variant="hero"
                :latitude="coordPair.lat"
                :longitude="coordPair.lng"
              />
            </button>
            <span
              v-else-if="coordLabelFallback"
              class="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 backdrop-blur-sm"
            >
              <MapPin class="h-4 w-4 text-sand" />
              {{ coordLabelFallback }}
            </span>
          </div>
        </Reveal>
      </div>
    </section>

    <section class="container-x py-16 sm:py-20">
      <div class="mx-auto max-w-3xl">
        <Reveal v-if="post.content">
          <TiptapHtml
            :content="post.content"
            wrapper-class="tiptap-article text-ink-soft leading-relaxed"
          />
        </Reveal>

        <Reveal class="mt-12">
          <NuxtLink
            to="/blog"
            class="group inline-flex items-center gap-2 text-[14px] font-semibold text-moss"
          >
            <ArrowLeft
              class="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1"
            />
            Все записи блога
          </NuxtLink>
        </Reveal>
      </div>
    </section>

    <section
      v-if="additionalMainImages.length"
      class="border-t border-line bg-paper-deep/40 py-16 sm:py-20"
    >
      <div class="container-x">
        <h2 class="mb-8 font-display text-2xl font-semibold text-ink sm:text-3xl">
          Дополнительные изображения
        </h2>
        <div class="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
          <button
            v-for="(img, i) in additionalMainImages"
            :key="img.id ?? img.path"
            type="button"
            class="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-paper-deep transition hover:border-moss/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-moss"
            @click="openLightbox(i)"
          >
            <img
              :src="resolvePublicMediaUrl(img.path)"
              class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
              loading="lazy"
              decoding="async"
              :alt="`${String(post.title ?? '')} — ${i + 1}`"
            />
          </button>
        </div>
      </div>
    </section>

    <section class="container-x py-16 sm:py-20">
      <Reveal>
        <div
          class="rounded-[2rem] border border-line bg-white p-8 text-center sm:p-12"
        >
          <p class="eyebrow">Рассылка</p>
          <h3 class="mt-4 font-display text-2xl font-semibold text-ink sm:text-3xl">
            Не пропустите следующие истории
          </h3>
          <div class="mx-auto mt-8 max-w-md">
            <FormsSubscribeInline />
          </div>
        </div>
      </Reveal>
    </section>

    <Teleport to="body">
      <div
        v-if="lightboxOpen && additionalMainImages[lightboxIndex]"
        class="fixed inset-0 z-[200] flex flex-col bg-ink/95"
        role="dialog"
        aria-modal="true"
        aria-label="Просмотр изображения"
      >
        <button
          type="button"
          class="absolute right-4 top-4 z-10 rounded-full p-2 text-paper/90 hover:bg-white/10 hover:text-paper"
          aria-label="Закрыть"
          @click="closeLightbox"
        >
          <X class="h-8 w-8" />
        </button>
        <div
          class="flex min-h-0 flex-1 items-center justify-center p-4 pt-16"
          @click.self="closeLightbox"
        >
          <img
            :src="resolvePublicMediaUrl(additionalMainImages[lightboxIndex]!.path)"
            class="max-h-[85vh] max-w-full object-contain"
            :alt="String(post.title ?? '')"
          />
        </div>
        <div
          v-if="additionalMainImages.length > 1"
          class="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-6"
        >
          <div
            class="pointer-events-auto flex items-center gap-2 rounded-full bg-ink/50 px-3 py-2 backdrop-blur-sm"
          >
            <button
              type="button"
              class="p-2 text-paper/90 hover:text-paper"
              aria-label="Предыдущее фото"
              @click="lightboxPrev"
            >
              <ArrowLongLeft class="h-7 w-7" />
            </button>
            <span class="min-w-16 text-center text-sm tabular-nums text-paper/85">
              {{ lightboxIndex + 1 }} / {{ additionalMainImages.length }}
            </span>
            <button
              type="button"
              class="p-2 text-paper/90 hover:text-paper"
              aria-label="Следующее фото"
              @click="lightboxNext"
            >
              <ArrowLongRight class="h-7 w-7" />
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
:deep(.tiptap-article p) {
  margin-bottom: 0.85em;
  color: #45493f;
  line-height: 1.7;
  font-size: 16.5px;
}
:deep(.tiptap-article h2),
:deep(.tiptap-article h3) {
  font-family: 'Playfair Display', Georgia, serif;
  color: #1b1e17;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}
:deep(.tiptap-article a) {
  color: #5e7a45;
  text-decoration: underline;
}
</style>
