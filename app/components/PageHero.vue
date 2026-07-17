<script setup lang="ts">
import { ChevronRight } from '@lucide/vue'

defineProps<{
  eyebrow: string
  title: string
  titleHtml?: string
  subtitle?: string
  image?: string
  current: string
}>()
</script>

<template>
  <section class="relative overflow-hidden pt-[72px]">
    <div v-if="image" class="pointer-events-none absolute inset-0" aria-hidden="true">
      <img :src="image" alt="" class="h-full w-full object-cover object-center opacity-[0.16]" />
      <div class="absolute inset-0 bg-gradient-to-b from-paper/40 via-paper/70 to-paper" />
    </div>
    <div class="container-x relative pb-14 pt-14 sm:pb-20 sm:pt-20">
      <Reveal>
        <nav class="flex items-center gap-1.5 text-[13px] text-muted-foreground">
          <NuxtLink to="/" class="transition-colors hover:text-moss">Главная</NuxtLink>
          <ChevronRight class="h-3.5 w-3.5" />
          <span class="text-ink">{{ current }}</span>
        </nav>
      </Reveal>
      <Reveal :delay="0.08">
        <p class="eyebrow mt-10">{{ eyebrow }}</p>
      </Reveal>
      <Reveal :delay="0.14">
        <h1 v-if="titleHtml" class="display-1 mt-4 max-w-4xl text-5xl sm:text-6xl lg:text-7xl" v-html="titleHtml" />
        <h1 v-else class="display-1 mt-4 max-w-4xl text-5xl sm:text-6xl lg:text-7xl">
          {{ title }}
        </h1>
      </Reveal>
      <Reveal v-if="subtitle" :delay="0.2">
        <p class="mt-6 max-w-xl text-[17px] leading-relaxed text-ink-soft">{{ subtitle }}</p>
      </Reveal>
      <Reveal v-if="$slots.default" :delay="0.26">
        <slot />
      </Reveal>
    </div>
  </section>
</template>
