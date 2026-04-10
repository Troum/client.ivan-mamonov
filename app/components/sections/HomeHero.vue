<script setup lang="ts">
const hoveredColumn = ref<string | null>(null)

const columns = [
  {
    id: '/shop',
    title: 'МАГАЗИН',
    subtitle: 'КАРТИНЫ, КУРСЫ, ПРЕСЕТЫ',
    image: '/hero-shop.jpg',
  },
  {
    id: '/blog',
    title: 'БЛОГ',
    subtitle: 'ИВАН МАМОНОВ — ПЕЙЗАЖНЫЙ ФОТОГРАФ',
    subtitle2: 'ПРИМОРЬЕ И РОССИЯ',
    image: '/hero-blog.jpg',
  },
  {
    id: '/encyclopedia',
    title: 'ЭНЦИКЛОПЕДИЯ',
    subtitle: 'ПРИМОРЬЯ',
    subtitle2: 'ИСТОРИЧЕСКИЕ МЕСТА, ПРИРОДНЫЕ ЛОКАЦИИ, СОБЫТИЯ',
    image: '/hero-encyclopedia.jpg',
  },
]
</script>

<template>
  <section class="relative h-screen w-full overflow-hidden">
    <div class="flex flex-col lg:flex-row h-full">
      <NuxtLink
        v-for="(column, index) in columns"
        :key="column.id"
        :to="column.id"
        class="relative flex-1 h-1/3 lg:h-full overflow-hidden group cursor-pointer border-b lg:border-b-0 lg:border-r border-white/10 last:border-0 transition-all duration-500"
        :style="{ transitionDelay: `${index * 50}ms` }"
        @mouseenter="hoveredColumn = column.id"
        @mouseleave="hoveredColumn = null"
      >
        <div
          class="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out"
          :style="{
            backgroundImage: `url(${column.image})`,
            transform: hoveredColumn === column.id ? 'scale(1.08)' : 'scale(1)',
          }"
        />

        <div
          :class="[
            'absolute inset-0 transition-all duration-500',
            hoveredColumn === column.id ? 'bg-black/30' : 'bg-black/50',
          ]"
        />

        <div class="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
          <h2
            :class="[
              'text-3xl sm:text-4xl lg:text-4xl xl:text-5xl font-extrabold text-white tracking-wider transition-all duration-500',
              hoveredColumn === column.id ? '-translate-y-2' : '',
            ]"
          >
            {{ column.title }}
          </h2>

          <p
            v-if="column.subtitle"
            :class="[
              'mt-3 text-[0.65rem] sm:text-xs lg:text-sm text-white/80 tracking-widest uppercase max-w-xs transition-all duration-500 delay-100',
              hoveredColumn === column.id ? 'opacity-100 translate-y-0' : 'opacity-70',
            ]"
          >
            {{ column.subtitle }}
          </p>

          <p
            v-if="column.subtitle2"
            :class="[
              'mt-1.5 text-[0.65rem] sm:text-xs lg:text-sm text-white/70 tracking-wider uppercase max-w-xs transition-all duration-500 delay-150',
              hoveredColumn === column.id ? 'opacity-100' : 'opacity-60',
            ]"
          >
            {{ column.subtitle2 }}
          </p>

          <div
            :class="[
              'mt-6 h-0.5 bg-olivine-400 transition-all duration-500',
              hoveredColumn === column.id ? 'w-16 opacity-100' : 'w-0 opacity-0',
            ]"
          />
        </div>
      </NuxtLink>
    </div>

    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 hidden lg:flex flex-col items-center gap-2">
      <div class="w-px h-12 bg-gradient-to-b from-transparent via-white/50 to-white/80 animate-pulse" />
    </div>
  </section>
</template>
