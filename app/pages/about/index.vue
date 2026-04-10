<script setup lang="ts">
import { defaultSiteAbout, loadSiteAbout } from '~/composables/useSiteContent'

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

const breadcrumbs = [
  { label: 'Главная', to: '/' },
  { label: 'Обо мне' },
]
</script>

<template>
  <div class="min-h-screen bg-white">
    <AppBreadcrumbs :items="breadcrumbs" />
    <section class="min-h-screen flex flex-col lg:flex-row">
      <div class="flex-1 h-[50vh] lg:h-screen lg:sticky lg:top-0 lg:self-start relative">
        <img
          :src="resolvePublicMediaUrl(about.portrait_image)"
          alt="Иван Мамонов"
          class="w-full h-full object-cover min-h-[50vh] lg:min-h-screen"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent lg:hidden" />
      </div>

      <div class="flex-1 flex flex-col justify-center px-6 lg:px-16 py-16 lg:py-32">
        <div class="mb-8">
          <span class="text-sm font-medium text-olivine-500 tracking-wider uppercase">
            {{ about.role_label }}
          </span>
          <h1 class="mt-3 text-4xl lg:text-5xl xl:text-6xl font-extrabold text-gray-900 tracking-tight">
            {{ about.name_title }}
          </h1>
        </div>

        <div class="max-w-xl space-y-4">
          <p v-for="(paragraph, index) in about.bio_paragraphs" :key="index" class="text-gray-700 leading-relaxed">
            {{ paragraph }}
          </p>
        </div>

        <div class="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="(stat, index) in about.stats" :key="index" class="text-center p-4 bg-olivine-50 rounded-xl">
            <HeroUiIcon :name="stat.icon" icon-class="w-6 h-6 text-olivine-500 mx-auto mb-2" />
            <div class="text-2xl lg:text-3xl font-bold text-gray-900">{{ stat.value }}</div>
            <div class="text-sm text-gray-600">{{ stat.label }}</div>
          </div>
        </div>

        <blockquote v-if="about.quote" class="mt-12 pl-6 border-l-4 border-olivine-400">
          <p class="text-xl lg:text-2xl text-gray-800 italic leading-relaxed">
            {{ about.quote }}
          </p>
        </blockquote>
      </div>
    </section>

    <section class="py-16 lg:py-24 px-6 lg:px-12 bg-gray-50">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">
          {{ about.equipment_title }}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-for="(item, index) in about.equipment" :key="index" class="p-6 bg-white rounded-xl shadow-sm">
            <h3 class="text-sm font-medium text-olivine-500 uppercase tracking-wider mb-2">
              {{ item.category }}
            </h3>
            <p class="text-gray-700">{{ item.items }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
