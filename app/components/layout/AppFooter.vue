<script setup lang="ts">
import { AtSign, Camera, Music2, Play, Send } from '@lucide/vue'
import { defaultSiteContacts, loadSiteContacts } from '~/composables/useSiteContent'

const currentYear = new Date().getFullYear()

const nav = [
  { to: '/blog', label: 'Блог' },
  { to: '/shop', label: 'Магазин' },
  { to: '/encyclopedia', label: 'Энциклопедия' },
  { to: '/about', label: 'Обо мне' },
  { to: '/contacts', label: 'Контакты' },
]

const { data } = await useAsyncData('site-contacts', () => loadSiteContacts(), {
  default: () => defaultSiteContacts(),
})

const socialLinks = computed(() => {
  const fromApi = data.value?.social_links
  if (Array.isArray(fromApi) && fromApi.length) {
    return fromApi
      .filter((link) => link.is_visible !== false)
      .map((link) => ({
        label: link.aria_label || link.platform,
        href: link.url,
        platform: link.platform.toLowerCase(),
      }))
  }
  return [
    { label: 'Telegram', href: 'https://t.me/ivanmamonov', platform: 'telegram' },
    { label: 'Instagram', href: 'https://instagram.com/ivanmamonov', platform: 'instagram' },
    { label: 'YouTube', href: 'https://youtube.com/@ivanmamonov', platform: 'youtube' },
    {
      label: 'Email',
      href: `mailto:${data.value?.email || 'ivanmamonov.photo@gmail.com'}`,
      platform: 'email',
    },
  ]
})

function socialIcon(platform: string) {
  if (platform.includes('telegram') || platform.includes('send')) return Send
  if (platform.includes('instagram') || platform.includes('camera')) return Camera
  if (platform.includes('youtube')) return Play
  if (platform.includes('tiktok')) return Music2
  return AtSign
}
</script>

<template>
  <footer class="bg-ink text-paper">
    <div class="container-x">
      <div
        class="flex flex-col gap-8 border-b border-white/10 py-16 lg:flex-row lg:items-end lg:justify-between"
      >
        <div class="max-w-xl">
          <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-moss-soft">
            Рассылка
          </p>
          <h3 class="mt-4 font-display text-3xl font-medium leading-tight sm:text-4xl">
            Новые истории и снимки —
            <em class="font-display italic text-sand">раз в месяц</em>
          </h3>
          <p class="mt-4 text-[15px] leading-relaxed text-paper/60">
            Приморье, маршруты, закулисье съёмок и первые новости о печатных работах. Без спама.
          </p>
        </div>
        <div class="w-full max-w-md">
          <FormsSubscribeInline dark />
        </div>
      </div>

      <div class="grid gap-12 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div class="flex items-center gap-3">
            <img src="/images/logo-mark.png" alt="IM" class="h-10 w-10 rounded-[10px]" />
            <span class="flex flex-col leading-none">
              <span class="text-[16px] font-semibold tracking-tight">Иван Мамонов</span>
              <span class="mt-1 text-[10px] font-medium uppercase tracking-[0.24em] text-paper/50">
                Пейзажный фотограф
              </span>
            </span>
          </div>
          <p class="mt-5 max-w-xs text-sm leading-relaxed text-paper/55">
            Пейзажный фотограф и путешественник. Запечатлеваю красоту природы России и мира.
          </p>
        </div>

        <div>
          <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-paper/40">
            Навигация
          </p>
          <ul class="mt-5 space-y-3">
            <li v-for="item in nav" :key="item.to">
              <NuxtLink
                :to="item.to"
                class="text-[15px] text-paper/75 transition-colors hover:text-sand"
              >
                {{ item.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div v-if="socialLinks.length">
          <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-paper/40">
            Социальные сети
          </p>
          <ul class="mt-5 space-y-3">
            <li v-for="s in socialLinks" :key="s.href">
              <a
                :href="s.href"
                target="_blank"
                rel="noreferrer"
                class="group inline-flex items-center gap-3 text-[15px] text-paper/75 transition-colors hover:text-sand"
              >
                <component
                  :is="socialIcon(s.platform)"
                  class="h-4 w-4 text-paper/40 transition-colors group-hover:text-sand"
                />
                {{ s.label }}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div
        class="flex flex-col items-start justify-between gap-3 border-t border-white/10 py-7 text-[13px] text-paper/40 sm:flex-row sm:items-center"
      >
        <p>© {{ currentYear }} Иван Мамонов. Все права защищены.</p>
        <p>Владивосток, Приморский край</p>
      </div>
    </div>
  </footer>
</template>
