<script setup lang="ts">
import {
  Anchor,
  Aperture,
  ArrowRight,
  Award,
  Camera,
  Heart,
  MapPin,
  Mountain,
  SlidersHorizontal,
} from '@lucide/vue'
import { defaultSiteAbout, loadSiteAbout } from '~/composables/useSiteContent'
import { resolvePublicMediaUrl } from '~/composables/usePageSeo'

const { data } = await useAsyncData('site-about', () => loadSiteAbout(), {
  default: () => defaultSiteAbout(),
})

const about = computed(() => data.value ?? defaultSiteAbout())

const a = about.value
usePageSeo(a.seo, {
  title: a.seo.meta_title?.trim() || `${a.name_title} — обо мне`,
  description:
    a.seo.meta_description?.trim() ||
    a.bio_paragraphs[0] ||
    'Пейзажный фотограф из Приморья.',
  ogImage: a.seo.og_image?.trim() || a.portrait_image,
})

const STAT_ICONS = [Camera, MapPin, Award, Heart]
const GEAR_ICONS = [Camera, Aperture, Anchor, SlidersHorizontal]

const portrait = computed(
  () => resolvePublicMediaUrl(about.value.portrait_image) || '/images/about-portrait.jpg',
)

const nameHtml = computed(() => {
  const raw = about.value.name_title?.trim() || 'Иван Мамонов'
  const parts = raw.replace(/\s+/g, ' ').split(' ')
  if (parts.length >= 2) {
    return `${parts[0]} <em class="italic text-moss">${parts.slice(1).join(' ')}</em>`
  }
  return `<em class="italic text-moss">${raw}</em>`
})
</script>

<template>
  <div>
    <PageHero
      :eyebrow="about.role_label || 'Фотограф / Путешественник'"
      current="Обо мне"
      :image="portrait"
      :title-html="nameHtml"
      title="Иван Мамонов"
      subtitle="Пейзажный фотограф из Приморского края. Горы, озёра и леса — и люди, которые их любят."
    />

    <section class="container-x pb-20 sm:pb-28">
      <div class="grid items-start gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <Reveal class="lg:sticky lg:top-28">
          <div class="relative">
            <div class="overflow-hidden rounded-[2rem] border border-line">
              <img
                :src="portrait"
                alt="Иван Мамонов с камерой на фоне гор"
                class="img-zoom aspect-[3/4] w-full object-cover"
              />
            </div>
            <div
              class="absolute -bottom-6 left-6 rounded-2xl border border-line bg-white px-6 py-4 shadow-[0_20px_40px_-20px_rgb(27_30_23/0.25)]"
            >
              <p class="flex items-center gap-2 text-[13px] font-semibold text-ink">
                <Mountain class="h-4 w-4 text-moss" />
                Владивосток, Приморский край
              </p>
            </div>
          </div>
        </Reveal>

        <div>
          <Reveal>
            <p class="eyebrow">Моя история</p>
          </Reveal>
          <Reveal :delay="0.06">
            <h2 class="display-1 mt-4 text-3xl leading-[1.15] sm:text-4xl">
              Десять лет в пути — ради одного
              <em class="italic text-moss">кадра</em>
            </h2>
          </Reveal>
          <Reveal :delay="0.12">
            <div class="mt-7 space-y-5 text-[16px] leading-relaxed text-ink-soft">
              <p v-for="(paragraph, index) in about.bio_paragraphs" :key="index">
                {{ paragraph }}
              </p>
            </div>
          </Reveal>

          <Reveal v-if="about.quote" :delay="0.18">
            <blockquote
              class="mt-10 border-l-2 border-moss pl-6 font-display text-xl italic leading-relaxed text-ink sm:text-2xl"
            >
              {{ about.quote }}
            </blockquote>
          </Reveal>

          <Reveal :delay="0.22">
            <div class="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div
                v-for="(stat, index) in about.stats"
                :key="index"
                class="rounded-2xl border border-line bg-white p-5 text-center transition-colors hover:border-moss/40"
              >
                <component
                  :is="STAT_ICONS[index] || Camera"
                  class="mx-auto h-5 w-5 text-moss"
                />
                <p class="mt-3 font-display text-[26px] font-semibold text-ink">
                  {{ stat.value }}
                </p>
                <p
                  class="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground"
                >
                  {{ stat.label }}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>

    <section class="border-y border-line bg-paper-deep/60 py-20 sm:py-24">
      <div class="container-x">
        <Reveal>
          <div class="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p class="eyebrow">Снаряжение</p>
              <h2 class="display-1 mt-3 text-4xl sm:text-5xl">
                Моё <em class="italic text-moss">оборудование</em>
              </h2>
            </div>
            <p class="max-w-sm text-[15px] leading-relaxed text-muted-foreground">
              Инструменты, которым я доверяю в экспедициях — от широкоугольных панорам до дальних
              деталей.
            </p>
          </div>
        </Reveal>

        <div class="mt-12 grid gap-5 sm:grid-cols-2">
          <Reveal
            v-for="(g, i) in about.equipment"
            :key="g.category"
            :delay="0.06 * i"
          >
            <div
              class="group flex h-full gap-5 rounded-3xl border border-line bg-white p-7 transition-all duration-500 hover:border-moss/40 hover:shadow-[0_20px_40px_-24px_rgb(27_30_23/0.2)]"
            >
              <span
                class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-moss-wash text-moss transition-colors duration-500 group-hover:bg-moss group-hover:text-white"
              >
                <component :is="GEAR_ICONS[i] || Camera" class="h-5 w-5" />
              </span>
              <div>
                <h3 class="font-display text-xl font-semibold text-ink">{{ g.category }}</h3>
                <p class="mt-2 text-[14.5px] leading-relaxed text-muted-foreground">
                  {{ g.items }}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>

    <section class="container-x py-20 sm:py-28">
      <Reveal>
        <div
          class="relative overflow-hidden rounded-[2rem] bg-ink px-8 py-16 text-center sm:px-16 sm:py-20"
        >
          <div
            class="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-moss/25 blur-3xl"
            aria-hidden="true"
          />
          <div
            class="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-sand/15 blur-3xl"
            aria-hidden="true"
          />
          <p
            class="relative text-[11px] font-semibold uppercase tracking-[0.22em] text-moss-soft"
          >
            Сотрудничество
          </p>
          <h2
            class="relative mx-auto mt-5 max-w-2xl font-display text-3xl font-medium leading-tight text-paper sm:text-[44px]"
          >
            Давайте создадим что-то
            <em class="italic text-sand">прекрасное</em> вместе
          </h2>
          <p
            class="relative mx-auto mt-5 max-w-xl text-[15.5px] leading-relaxed text-paper/60"
          >
            Съёмки для брендов, публикации, туры по Приморью или печатные работы для вашего
            интерьера.
          </p>
          <NuxtLink
            to="/contacts"
            class="group relative mt-9 inline-flex items-center gap-2 rounded-full bg-paper px-8 py-4 text-[14px] font-semibold text-ink transition-colors hover:bg-moss hover:text-white"
          >
            Связаться со мной
            <ArrowRight
              class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            />
          </NuxtLink>
        </div>
      </Reveal>
    </section>
  </div>
</template>
