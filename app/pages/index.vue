<script setup lang="ts">
import { defaultSiteHome, loadSiteHome } from '~/composables/useSiteContent'

definePageMeta({
  layout: 'default',
})

const { data: homeData } = await useAsyncData('site-home-seo', () => loadSiteHome(), {
  default: () => defaultSiteHome(),
})

const home = homeData.value ?? defaultSiteHome()
usePageSeo(home.seo, {
  title: home.seo.meta_title?.trim() || 'Иван Мамонов — пейзажный фотограф',
  description:
    home.seo.meta_description?.trim() ||
    'Пейзажная фотография, блог путешествий, энциклопедия Приморья и магазин печатных работ.',
  ogImage: home.seo.og_image?.trim(),
})
</script>

<template>
  <SectionsHomeHero />
</template>
