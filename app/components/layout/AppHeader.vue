<script setup lang="ts">
import { ArrowUpRight, Menu, X } from '@lucide/vue'

const route = useRoute()
const isScrolled = ref(false)
const isMenuOpen = ref(false)

const navItems = [
  { to: '/shop', label: 'Магазин' },
  { to: '/encyclopedia', label: 'Энциклопедия' },
  { to: '/blog', label: 'Блог' },
  { to: '/about', label: 'Обо мне' },
  { to: '/contacts', label: 'Контакты' },
]

/** Статья энциклопедии / блога с full-bleed тёмным hero — светлый nav до скролла. */
const isDarkHeroPage = computed(() => {
  const p = route.path
  if (p === '/encyclopedia/map') return false
  if (/^\/encyclopedia\/[^/]+$/.test(p)) return true
  if (/^\/blog\/[^/]+$/.test(p)) return true
  return false
})

const lightNav = computed(
  () => isDarkHeroPage.value && !isScrolled.value && !isMenuOpen.value,
)

function navActive(path: string) {
  if (path === '/blog') return route.path.startsWith('/blog')
  if (path === '/shop') return route.path.startsWith('/shop')
  if (path === '/encyclopedia') return route.path.startsWith('/encyclopedia')
  return route.path === path || route.path.startsWith(`${path}/`)
}

function handleScroll() {
  isScrolled.value = window.scrollY > 24
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

watch(
  () => route.path,
  () => {
    isMenuOpen.value = false
    isScrolled.value = false
    if (import.meta.client) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      requestAnimationFrame(handleScroll)
    }
  },
)

watch(isMenuOpen, (open) => {
  if (import.meta.client) {
    document.body.style.overflow = open ? 'hidden' : ''
  }
})

onUnmounted(() => {
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <div>
    <header
      :class="[
        'fixed inset-x-0 top-0 z-50 transition-all duration-500',
        isScrolled || isMenuOpen
          ? 'border-b border-line/80 bg-paper/85 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent',
      ]"
    >
      <div class="container-x flex h-[72px] items-center justify-between">
        <NuxtLink to="/" class="group flex items-center gap-3">
          <img
            src="/images/logo-mark.png"
            alt="IM"
            class="h-9 w-9 rounded-[10px] transition-transform duration-500 group-hover:rotate-[-6deg]"
          />
          <span class="flex flex-col leading-none">
            <span
              :class="[
                'text-[15px] font-semibold tracking-tight transition-colors',
                lightNav ? 'text-white' : 'text-ink',
              ]"
            >
              Иван Мамонов
            </span>
            <span
              :class="[
                'mt-1 text-[10px] font-medium uppercase tracking-[0.24em] transition-colors',
                lightNav ? 'text-white/65' : 'text-muted-foreground',
              ]"
            >
              Пейзажный фотограф
            </span>
          </span>
        </NuxtLink>

        <nav class="hidden items-center gap-8 lg:flex">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            :class="[
              'link-underline pb-0.5 text-[13.5px] font-medium transition-colors',
              lightNav
                ? navActive(item.to)
                  ? 'text-sand'
                  : 'text-white/85 hover:text-white'
                : navActive(item.to)
                  ? 'text-moss'
                  : 'text-ink-soft hover:text-ink',
            ]"
          >
            {{ item.label }}
          </NuxtLink>
          <NuxtLink
            to="/contacts"
            :class="[
              'group inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium transition-colors',
              lightNav
                ? 'bg-white text-ink hover:bg-moss hover:text-white'
                : 'bg-ink text-paper hover:bg-moss',
            ]"
          >
            Связаться
            <ArrowUpRight
              class="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </NuxtLink>
        </nav>

        <button
          type="button"
          :class="[
            'flex h-10 w-10 items-center justify-center rounded-full border transition-colors lg:hidden',
            lightNav
              ? 'border-white/30 bg-white/15 text-white'
              : 'border-line bg-white/70 text-ink',
          ]"
          aria-label="Меню"
          :aria-expanded="isMenuOpen"
          @click="isMenuOpen = !isMenuOpen"
        >
          <X v-if="isMenuOpen" class="h-5 w-5" />
          <Menu v-else class="h-5 w-5" />
        </button>
      </div>
    </header>

    <Transition
      enter-active-class="transition-opacity duration-300"
      leave-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isMenuOpen"
        class="fixed inset-0 z-40 bg-paper/98 backdrop-blur-sm lg:hidden"
      >
        <div class="container-x flex h-full flex-col justify-center gap-2 pt-16">
          <NuxtLink
            v-for="(item, i) in navItems"
            :key="item.to"
            :to="item.to"
            :class="[
              'group flex items-center justify-between border-b border-line py-5 transition-all duration-500',
              navActive(item.to) ? 'text-moss' : 'text-ink',
            ]"
            :style="{ transitionDelay: `${0.06 * i}s` }"
            @click="isMenuOpen = false"
          >
            <span class="font-display text-3xl font-medium">{{ item.label }}</span>
            <ArrowUpRight
              class="h-6 w-6 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
            />
          </NuxtLink>
          <p class="mt-8 text-sm text-muted-foreground">
            Пейзажный фотограф · Владивосток, Приморский край
          </p>
        </div>
      </div>
    </Transition>
  </div>
</template>
