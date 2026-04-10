<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import SocialLinkButton from '~/components/SocialLinkButton.vue'
import { defaultSiteContacts, loadSiteContacts } from '~/composables/useSiteContent'

definePageMeta({
  name: 'contacts',
})

const { data } = await useAsyncData('site-contacts', () => loadSiteContacts(), {
  default: () => defaultSiteContacts(),
})

const site = computed(() => data.value ?? defaultSiteContacts())

const s0 = site.value
usePageSeo(s0.seo, {
  title: s0.seo.meta_title?.trim() || s0.hero_title || 'Контакты',
  description: s0.seo.meta_description?.trim() || s0.hero_subtitle,
  ogImage: s0.seo.og_image?.trim() || s0.hero_background_image,
})

const options = computed(() => site.value.feedback_themes.map((t) => ({ value: t.value, label: t.label })))

const selected = ref(options.value[0]?.value ?? 1)
const theme = ref<string>()

watch(
  options,
  (opts) => {
    if (!opts.length) return
    if (!opts.some((o) => o.value === selected.value)) {
      selected.value = opts[0].value
    }
  },
  { immediate: true }
)

watch(
  [selected, options],
  () => {
    theme.value = options.value.find((o) => o.value === selected.value)?.label
  },
  { immediate: true }
)

const breadcrumbs = [
  { label: 'Главная', to: '/' },
  { label: 'Контакты' },
]
</script>

<template>
  <div class="min-h-screen bg-white">
    <AppBreadcrumbs :items="breadcrumbs" />
    <section class="relative min-h-[40vh] bg-olivine-950 flex items-center justify-center">
      <div class="absolute inset-0 opacity-10">
        <div
          class="absolute inset-0 bg-cover bg-center"
          :style="{ backgroundImage: `url('${resolvePublicMediaUrl(site.hero_background_image)}')` }"
        />
        <div class="absolute inset-0 bg-gradient-to-b from-olivine-950/80 to-olivine-950" />
      </div>

      <div class="relative z-10 text-center px-6 py-24">
        <h1 class="text-5xl lg:text-7xl xl:text-8xl font-extrabold text-white tracking-tight">
          {{ site.hero_title }}
        </h1>
        <p v-if="site.hero_subtitle" class="mt-6 text-lg text-olivine-200 max-w-2xl mx-auto">
          {{ site.hero_subtitle }}
        </p>
      </div>
    </section>

    <section class="py-16 lg:py-24 px-6 lg:px-12">
      <div class="max-w-6xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <div>
            <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">
              {{ site.section_title }}
            </h2>

            <div class="space-y-6">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-olivine-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <HeroUiIcon name="i-heroicons-envelope" icon-class="w-5 h-5 text-olivine-600" />
                </div>
                <div>
                  <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider">Email</h3>
                  <a
                    :href="`mailto:${site.email}`"
                    class="text-lg text-gray-900 hover:text-olivine-500 transition-colors"
                  >
                    {{ site.email }}
                  </a>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-olivine-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <HeroUiIcon name="i-heroicons-phone" icon-class="w-5 h-5 text-olivine-600" />
                </div>
                <div>
                  <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider">Телефон</h3>
                  <a
                    :href="site.phone_href"
                    class="text-lg text-gray-900 hover:text-olivine-500 transition-colors"
                  >
                    {{ site.phone_display }}
                  </a>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-olivine-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <HeroUiIcon name="i-heroicons-map-pin" icon-class="w-5 h-5 text-olivine-600" />
                </div>
                <div>
                  <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider">Локация</h3>
                  <p class="text-lg text-gray-900">{{ site.location }}</p>
                </div>
              </div>
            </div>

            <div class="mt-10">
              <h3 id="contact-theme-heading" class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                Тема обращения
              </h3>
              <FormsContactThemeRadios
                v-model="selected"
                :options="options"
                heading-id="contact-theme-heading"
              />
            </div>

            <div v-if="site.social_links.length" class="mt-12">
              <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Социальные сети</h3>
              <div class="flex flex-wrap gap-4">
                <SocialLinkButton
                  v-for="(link, i) in site.social_links"
                  :key="i"
                  :platform="link.platform"
                  :url="link.url"
                  :aria-label="link.aria_label ?? undefined"
                />
              </div>
            </div>
          </div>

          <div class="space-y-10">
            <div class="bg-olivine-50 rounded-2xl p-6 lg:p-8">
              <h2 class="text-xl font-bold text-gray-900 mb-6">Отправить сообщение</h2>
              <FormsFeedbackForm :theme="theme" />
            </div>
            <div class="rounded-2xl border border-olivine-100 p-6 lg:p-8">
              <h2 class="text-lg font-bold text-gray-900 mb-4">Рассылка</h2>
              <FormsSubscribeInline />
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
