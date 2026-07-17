<script setup lang="ts">
import {
  ArrowUpRight,
  CalendarDays,
  Camera,
  Clock3,
  Compass,
  Feather,
  Route,
} from '@lucide/vue'
import type { Post } from '~/interfaces/Post'
import { useFilters } from '~/composables/useFilters'
import { defaultSiteBlogSection, loadSiteBlogSection } from '~/composables/useSiteContent'
import { resolvePublicMediaUrl } from '~/composables/usePageSeo'

const contentApi = useContentApi()
const { formatCoordinates } = useFilters()

const { data: sectionData } = await useAsyncData('site-blog-section', () => loadSiteBlogSection(), {
  default: () => defaultSiteBlogSection(),
})

const blogSection = computed(() => sectionData.value ?? defaultSiteBlogSection())

const { data: postsData } = await useAsyncData('blog-posts', () => contentApi.fetchPosts())

const posts = computed(() => (postsData.value ?? []) as unknown as Post[])

const s = blogSection.value
usePageSeo(s.seo, {
  title: s.seo.meta_title?.trim() || s.hero_title || 'Блог — Иван Мамонов',
  description: s.seo.meta_description?.trim() || s.hero_subtitle,
  ogImage: s.seo.og_image?.trim() || s.hero_background_image || '/images/hero-blog.jpg',
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
      c.longitude_label ?? 'E',
    )
  }
  return ''
}

function previewPath(p: Post) {
  const img = p.preview_image
  if (img && typeof img === 'object' && 'path' in img && img.path) {
    return resolvePublicMediaUrl(String(img.path))
  }
  return '/images/blog-baikal.jpg'
}

const TEASERS = [
  {
    icon: Route,
    title: 'Истории путешествий',
    desc: 'Маршруты по Приморью, Сибири и Кавказу — от идеи до финального кадра.',
  },
  {
    icon: Camera,
    title: 'Закулисье съёмок',
    desc: 'Как рождаются снимки: ночёвки в тайге, рассветы на скалах и работа со светом.',
  },
  {
    icon: Compass,
    title: 'Гиды по локациям',
    desc: 'Проверенные точки для пейзажной съёмки с координатами и советами.',
  },
]

const heroImage = computed(
  () =>
    resolvePublicMediaUrl(blogSection.value.hero_background_image) || '/images/hero-blog.jpg',
)
</script>

<template>
  <div>
    <PageHero
      eyebrow="Блог"
      current="Блог"
      :image="heroImage"
      title-html="Истории <em class=&quot;italic text-moss&quot;>путешествий</em>"
      title="Истории путешествий"
      :subtitle="
        blogSection.hero_subtitle ||
        'Фотографии и впечатления из самых красивых уголков России.'
      "
    />

    <section v-if="posts.length > 0" class="container-x pb-16">
      <Reveal>
        <div class="grid gap-6">
          <NuxtLink
            v-for="(post, index) in posts"
            :key="post.slug"
            :to="`/blog/${post.slug}`"
            class="group card-hover grid overflow-hidden rounded-[2rem] border border-line bg-white md:grid-cols-[1.1fr_1fr]"
          >
            <div class="relative min-h-[260px] overflow-hidden">
              <img
                :src="previewPath(post)"
                :alt="post.title"
                loading="lazy"
                class="img-zoom absolute inset-0 h-full w-full object-cover"
              />
              <span
                v-if="index === 0"
                class="absolute left-5 top-5 rounded-full bg-ink/55 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-md"
              >
                Новая запись
              </span>
            </div>
            <div class="flex flex-col justify-center p-8 sm:p-10">
              <div
                class="flex flex-wrap items-center gap-4 text-[12.5px] font-medium text-muted-foreground"
              >
                <span v-if="formatPublished(post)" class="inline-flex items-center gap-1.5">
                  <CalendarDays class="h-3.5 w-3.5 text-moss" />
                  {{ formatPublished(post) }}
                </span>
                <span v-if="locationLine(post)" class="inline-flex items-center gap-1.5">
                  <Clock3 class="h-3.5 w-3.5 text-moss" />
                  {{ locationLine(post) }}
                </span>
              </div>
              <h2
                class="mt-4 font-display text-3xl font-semibold leading-tight text-ink transition-colors group-hover:text-moss sm:text-4xl"
              >
                {{ post.title }}
              </h2>
              <p
                v-if="post.subtitle"
                class="mt-3 text-[15px] leading-relaxed text-muted-foreground"
              >
                {{ post.subtitle }}
              </p>
              <span class="mt-6 inline-flex items-center gap-2 text-[14px] font-semibold text-moss">
                Читать запись
                <ArrowUpRight
                  class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </span>
            </div>
          </NuxtLink>
        </div>
      </Reveal>
    </section>

    <section class="container-x pb-24">
      <Reveal>
        <div
          class="relative overflow-hidden rounded-[2rem] border border-dashed border-line bg-white/70 px-8 py-16 text-center sm:py-20"
        >
          <div
            class="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-moss-wash/60 to-transparent"
            aria-hidden="true"
          />
          <span
            class="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-moss-wash text-moss"
          >
            <Feather class="h-7 w-7" />
          </span>
          <h2 class="relative mt-7 font-display text-3xl font-semibold text-ink sm:text-4xl">
            Дальше — больше
          </h2>
          <p
            class="relative mx-auto mt-4 max-w-md text-[15.5px] leading-relaxed text-ink-soft"
          >
            Мы работаем над наполнением блога. Скоро здесь появятся новые истории путешествий и
            снимки с маршрутов.
          </p>
          <div class="relative mx-auto mt-9 max-w-md">
            <FormsSubscribeInline />
            <p class="mt-3 text-[12.5px] text-muted-foreground">
              Подпишитесь, чтобы не пропустить следующую публикацию
            </p>
          </div>
        </div>
      </Reveal>

      <div class="mt-16 grid gap-5 md:grid-cols-3">
        <Reveal v-for="(t, i) in TEASERS" :key="t.title" :delay="0.07 * i">
          <div
            class="group h-full rounded-3xl border border-line bg-white p-7 transition-all duration-500 hover:border-moss/40 hover:shadow-[0_20px_40px_-24px_rgb(27_30_23/0.2)]"
          >
            <span
              class="flex h-12 w-12 items-center justify-center rounded-2xl bg-moss-wash text-moss transition-colors duration-500 group-hover:bg-moss group-hover:text-white"
            >
              <component :is="t.icon" class="h-5 w-5" />
            </span>
            <h3 class="mt-5 font-display text-[21px] font-semibold text-ink">{{ t.title }}</h3>
            <p class="mt-2.5 text-[14.5px] leading-relaxed text-muted-foreground">{{ t.desc }}</p>
          </div>
        </Reveal>
      </div>
    </section>
  </div>
</template>
