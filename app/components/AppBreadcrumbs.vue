<script setup lang="ts">
import { ChevronRightIcon } from '@heroicons/vue/20/solid'

export type BreadcrumbItem = {
  label: string
  /** Если нет — пункт считается текущей страницей */
  to?: string
}

defineProps<{
  items: BreadcrumbItem[]
}>()
</script>

<template>
  <div
    class="pointer-events-none fixed top-20 lg:top-24 left-6 lg:left-12 z-30 max-w-[min(calc(100vw-3rem),42rem)]"
  >
    <div
      class="pointer-events-auto flex items-center rounded-full border border-white/30 bg-white/80 px-4 py-2.5 shadow-sm backdrop-blur-sm"
    >
      <nav class="flex min-h-[1.25rem] items-center text-sm leading-none" aria-label="Навигационная цепочка">
        <ol class="flex flex-wrap items-center gap-x-1.5 gap-y-1">
          <li
            v-for="(item, i) in items"
            :key="i"
            class="flex min-w-0 max-w-full items-center gap-x-1.5"
          >
            <ChevronRightIcon
              v-if="i > 0"
              class="h-4 w-4 shrink-0 text-olivine-500/90"
              aria-hidden="true"
            />
            <NuxtLink
              v-if="item.to"
              :to="item.to"
              class="inline-flex items-center text-gray-600 transition-colors hover:text-olivine-600 max-w-[min(100%,24rem)] truncate"
            >
              {{ item.label }}
            </NuxtLink>
            <span
              v-else
              class="inline-flex items-center font-medium text-gray-900 max-w-[min(100%,24rem)] truncate"
              aria-current="page"
            >
              {{ item.label }}
            </span>
          </li>
        </ol>
      </nav>
    </div>
  </div>
</template>
