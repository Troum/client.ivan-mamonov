<script setup lang="ts">
const currentYear = new Date().getFullYear()

const nav = [
  { id: '/blog', label: 'Блог' },
  { id: '/shop', label: 'Магазин' },
  { id: '/encyclopedia', label: 'Энциклопедия' },
  { id: '/about', label: 'Обо мне' },
  { id: '/contacts', label: 'Контакты' },
]
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

          <div>
            <h4 class="text-sm font-medium text-olivine-300 uppercase tracking-wider mb-4">Социальные сети</h4>
            <div class="flex gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                class="w-10 h-10 bg-olivine-900 rounded-full flex items-center justify-center text-olivine-200 hover:bg-olivine-500 hover:text-white transition-all duration-300"
                aria-label="Instagram"
              >
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://telegram.org"
                target="_blank"
                rel="noopener noreferrer"
                class="w-10 h-10 bg-olivine-900 rounded-full flex items-center justify-center text-olivine-200 hover:bg-olivine-500 hover:text-white transition-all duration-300"
                aria-label="Telegram"
              >
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                </svg>
              </a>
              <a
                href="mailto:hello@ivanmamonov.ru"
                class="w-10 h-10 bg-olivine-900 rounded-full flex items-center justify-center text-olivine-200 hover:bg-olivine-500 hover:text-white transition-all duration-300"
                aria-label="Email"
              >
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                </svg>
              </a>
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
