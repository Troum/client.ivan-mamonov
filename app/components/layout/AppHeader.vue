<script setup lang="ts">
const route = useRoute()
const isScrolled = ref(false)
const isMenuOpen = ref(false)

/** На главной — светлый текст на герое до скролла; на остальных страницах шапка всегда читаемая на белом фоне. */
const isHome = computed(() => route.path === '/')
const solidHeader = computed(() => !isHome.value || isScrolled.value || isMenuOpen.value)

/** Полоски гамбургера: group-hover меняет цвет вместе с кнопкой (hover:text-* на них не действует). */
const barLineClass = computed(() =>
  solidHeader.value
    ? 'bg-gray-900 group-hover:bg-olivine-600'
    : 'bg-white group-hover:bg-olivine-300'
)

const navItems = [
  { id: '/blog', label: 'БЛОГ' },
  { id: '/shop', label: 'МАГАЗИН' },
  { id: '/encyclopedia', label: 'ЭНЦИКЛОПЕДИЯ' },
  { id: '/about', label: 'ОБО МНЕ' },
  { id: '/contacts', label: 'КОНТАКТЫ' },
]

function navActive(path: string) {
  if (path === '/blog') return route.path.startsWith('/blog')
  if (path === '/shop') return route.path.startsWith('/shop')
  if (path === '/encyclopedia') return route.path.startsWith('/encyclopedia')
  return route.path === path || route.path.startsWith(`${path}/`)
}

function handleScroll() {
  isScrolled.value = window.scrollY > 50
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

watch(
  () => route.path,
  () => {
    isMenuOpen.value = false
    if (import.meta.client) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
)
</script>

<template>
  <div>
    <header
      :class="[
        'fixed top-0 left-0 right-0 z-50 transition-all duration-100',
        solidHeader ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent',
      ]"
    >
      <div class="w-full px-6 lg:px-12">
        <div class="flex h-16 w-full items-center gap-3 lg:h-20">
          <div class="flex min-w-0 flex-1 justify-start">
            <NuxtLink
              to="/contacts"
              :class="[
                'text-sm font-medium tracking-wider uppercase transition-colors duration-200 hover:text-olivine-500',
                solidHeader ? 'text-gray-900' : 'text-white',
              ]"
            >
              КОНТАКТЫ
            </NuxtLink>
          </div>

          <NuxtLink
            to="/"
            class="flex shrink-0 items-center justify-center rounded-sm outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-olivine-400/80 focus-visible:ring-offset-2"
            aria-label="На главную"
          >
            <img
              src="/logo.png"
              alt="Иван Мамонов"
              width="160"
              height="48"
              class="h-9 w-auto max-h-10 object-contain object-center transition-[filter] duration-100 ease-out sm:h-10 lg:max-h-11"
              :class="
                solidHeader
                  ? ''
                  : 'drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]'
              "
              :style="
                solidHeader
                  ? {
                      filter:
                        'brightness(0.84) contrast(1.08) saturate(1.16)',
                    }
                  : undefined
              "
            />
          </NuxtLink>

          <div class="flex min-w-0 flex-1 justify-end">
          <button
            type="button"
            :class="[
              'group flex items-center gap-3 text-sm font-medium tracking-wider uppercase transition-colors duration-200 rounded-lg px-2 py-1.5 -my-1 -mr-1',
              solidHeader
                ? 'text-gray-900 hover:text-olivine-600'
                : 'text-white hover:text-olivine-200',
            ]"
            :aria-expanded="isMenuOpen"
            aria-controls="site-nav-overlay"
            @click="isMenuOpen = !isMenuOpen"
          >
            <span>МЕНЮ</span>
            <div class="relative w-6 h-5 flex flex-col justify-between" aria-hidden="true">
              <span
                :class="[
                  'block h-0.5 w-full transition-all duration-100 origin-center',
                  barLineClass,
                  isMenuOpen ? 'rotate-45 translate-y-2' : '',
                ]"
              />
              <span
                :class="[
                  'block h-0.5 transition-all duration-100',
                  barLineClass,
                  isMenuOpen ? 'opacity-0 w-0' : 'w-full',
                ]"
              />
              <span
                :class="[
                  'block h-0.5 w-full transition-all duration-100 origin-center',
                  barLineClass,
                  isMenuOpen ? '-rotate-45 -translate-y-2' : '',
                ]"
              />
            </div>
          </button>
          </div>
        </div>
      </div>
    </header>

    <div
      id="site-nav-overlay"
      :class="[
        'fixed inset-0 z-40 bg-white transition-all duration-500',
        isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
      ]"
    >
      <div class="flex flex-col items-center justify-center h-full">
        <nav class="flex flex-col items-center gap-6 lg:gap-8">
          <NuxtLink
            v-for="(item, index) in navItems"
            :key="item.id"
            :to="item.id"
            :class="[
              'text-3xl lg:text-5xl font-bold tracking-wider uppercase transition-all duration-100 hover:text-olivine-500',
              navActive(item.id) ? 'text-olivine-500' : 'text-gray-900',
            ]"
            :style="{
              opacity: isMenuOpen ? 1 : 0,
              transform: isMenuOpen ? 'translateX(0)' : 'translateX(50px)',
              transition: `all 0.4s ease-in-out(0.4, 0, 0.2, 1) ${isMenuOpen ? index * 0.05 + 0.2 : 0}s`,
            }"
            @click="isMenuOpen = false"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>
      </div>
    </div>
  </div>
</template>
