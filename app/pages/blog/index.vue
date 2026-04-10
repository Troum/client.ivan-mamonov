<script setup lang="ts">
import type { Post } from '~/interfaces/Post'
import { useFilters } from '~/composables/useFilters'
import { defaultSiteBlogSection, loadSiteBlogSection } from '~/composables/useSiteContent'

const contentApi = useContentApi()
const { formatCoordinates } = useFilters()

const { data: sectionData } = await useAsyncData('site-blog-section', () => loadSiteBlogSection(), {
  default: () => defaultSiteBlogSection(),
})

const blogSection = computed(() => sectionData.value ?? defaultSiteBlogSection())

const posts = ref<Post[]>([])
const hoveredPost = ref<string | null>(null)

contentApi.fetchPosts().then((rows) => {
  posts.value = rows as unknown as Post[]
})

const s = blogSection.value
usePageSeo(s.seo, {
  title: s.seo.meta_title?.trim() || s.hero_title || 'Блог — Иван Мамонов',
  description: s.seo.meta_description?.trim() || s.hero_subtitle,
  ogImage: s.seo.og_image?.trim() || s.hero_background_image,
})

function formatPublished(p: Post) {
  if (!p.published_at) return ''
  const d = new Date(p.published_at)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

function locationLine(p: Post) {
  if (p.subtitle) return p.subtitle
  const c = p.coordinates
  if (!c) return ''
  if (c.formatted) return c.formatted
  if (c.latitude != null && c.longitude != null) {
    return formatCoordinates(
      { lat: Number(c.latitude), lng: Number(c.longitude) },
      c.latitude_label ?? 'N',
      c.longitude_label ?? 'E'
    )
  }
  return ''
}

function excerptLine(p: Post) {
  const sub = p.subtitle?.trim()
  if (sub) return sub
  return 'История путешествия и снимки с маршрута.'
}

function previewPath(p: Post) {
  const img = p.preview_image
  if (img && typeof img === 'object' && 'path' in img && img.path) return String(img.path)
  return ''
}

function titleParts(title: string) {
  const t = title.trim()
  const space = t.indexOf(' ')
  if (space === -1) return { first: t, rest: '' }
  return { first: t.slice(0, space), rest: t.slice(space) }
}

const breadcrumbs = [
  { label: 'Главная', to: '/' },
  { label: 'Блог' },
]
</script>

<template>
  <div class="min-h-screen bg-white">
    <AppBreadcrumbs :items="breadcrumbs" />
    <SiteSectionHero
      variant="blog"
      :background-image="blogSection.hero_background_image"
      :title="blogSection.hero_title"
      :subtitle="blogSection.hero_subtitle"
    />

    <section class="py-16 lg:py-24 px-6 lg:px-12 max-w-7xl mx-auto">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <article
          v-for="(post, index) in posts"
          :key="post.slug"
          class="group cursor-pointer"
          :class="index === 0 ? 'lg:col-span-2' : ''"
          @mouseenter="hoveredPost = post.slug"
          @mouseleave="hoveredPost = null"
        >
          <NuxtLink :to="`/blog/${post.slug}`" class="block">
            <div
              :class="[
                'relative overflow-hidden bg-gray-100',
                index === 0 ? 'aspect-21/9' : 'aspect-16/10',
              ]"
            >
              <img
                v-if="previewPath(post)"
                :src="previewPath(post)"
                :alt="post.title"
                :class="[
                  'w-full h-full object-cover transition-transform duration-700',
                  hoveredPost === post.slug ? 'scale-105' : 'scale-100',
                ]"
              />
              <div v-else class="w-full h-full bg-linear-to-br from-olivine-200 to-olivine-700" />

              <div
                :class="[
                  'absolute inset-0 bg-black/20 transition-opacity duration-300',
                  hoveredPost === post.slug ? 'opacity-0' : 'opacity-100',
                ]"
              />
            </div>

            <div class="mt-6">
              <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                <span v-if="formatPublished(post)" class="flex items-center gap-1.5">
                  <HeroUiIcon name="i-heroicons-calendar-days" icon-class="w-4 h-4" />
                  {{ formatPublished(post) }}
                </span>
                <span v-if="locationLine(post)" class="flex items-center gap-1.5">
                  <HeroUiIcon name="i-heroicons-map-pin" icon-class="w-4 h-4" />
                  {{ locationLine(post) }}
                </span>
              </div>

              <h2
                :class="[
                  'font-bold tracking-tight text-gray-900 group-hover:text-olivine-600 transition-colors duration-300',
                  index === 0 ? 'text-3xl lg:text-4xl xl:text-5xl' : 'text-2xl lg:text-3xl',
                ]"
              >
                <span class="text-olivine-400">{{ titleParts(post.title).first }}</span
                >{{ titleParts(post.title).rest }}
              </h2>

              <p class="mt-3 text-gray-600 leading-relaxed max-w-2xl">
                {{ excerptLine(post) }}
              </p>

              <div class="mt-4 flex items-center gap-2 text-olivine-500 font-medium">
                <span>Читать далее</span>
                <HeroUiIcon
                  name="i-heroicons-arrow-right"
                  :icon-class="
                    ['w-4 h-4 transition-transform duration-300', hoveredPost === post.slug ? 'translate-x-1' : ''].join(
                      ' '
                    )
                  "
                />
              </div>
            </div>
          </NuxtLink>
        </article>
      </div>
    </section>
  </div>
</template>
