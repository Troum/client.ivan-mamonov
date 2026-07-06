<script setup lang="ts">
import SocialLinkButton from '~/components/SocialLinkButton.vue'
import { defaultSiteContacts, loadSiteContacts } from '~/composables/useSiteContent'

const currentYear = new Date().getFullYear()

const nav = [
  { id: '/blog', label: 'Блог' },
  { id: '/shop', label: 'Магазин' },
  { id: '/encyclopedia', label: 'Энциклопедия' },
  { id: '/about', label: 'Обо мне' },
  { id: '/contacts', label: 'Контакты' },
]

const { data } = await useAsyncData('site-contacts', () => loadSiteContacts(), {
  default: () => defaultSiteContacts(),
})

const socialLinks = computed(() => data.value?.social_links ?? [])
</script>

<template>
  <footer class="bg-olivine-950 text-white">
    <div class="px-6 lg:px-12 py-12 lg:py-16">
      <div class="max-w-7xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          <div>
            <h3 class="text-xl font-bold mb-4">ИВАН МАМОНОВ</h3>
            <p class="text-olivine-200 text-sm leading-relaxed">
              Пейзажный фотограф и путешественник. Запечатлеваю красоту природы России и мира.
            </p>
          </div>

          <div>
            <h4 class="text-sm font-medium text-olivine-300 uppercase tracking-wider mb-4">Навигация</h4>
            <nav class="space-y-2">
              <NuxtLink
                v-for="item in nav"
                :key="item.id"
                :to="item.id"
                class="block text-olivine-100 hover:text-white transition-colors duration-200 text-sm"
              >
                {{ item.label }}
              </NuxtLink>
            </nav>
          </div>

          <div v-if="socialLinks.length">
            <h4 class="text-sm font-medium text-olivine-300 uppercase tracking-wider mb-4">Социальные сети</h4>
            <div class="flex flex-wrap gap-3">
              <SocialLinkButton
                v-for="(link, i) in socialLinks"
                :key="i"
                variant="footer"
                :platform="link.platform"
                :url="link.url"
                :aria-label="link.aria_label ?? undefined"
              />
            </div>
          </div>
        </div>

        <div class="mt-12 pt-8 border-t border-olivine-900">
          <div class="flex flex-col md:flex-row justify-between items-center gap-4">
            <p class="text-olivine-300 text-sm">© {{ currentYear }} Иван Мамонов. Все права защищены.</p>
            <p class="text-olivine-400 text-xs">Сделано с любовью к природе</p>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
