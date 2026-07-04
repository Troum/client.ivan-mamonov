<script setup lang="ts">
import { ChevronRightIcon } from '@heroicons/vue/20/solid'

export type BreadcrumbItem = {
  label: string
  /** Если нет — пункт считается текущей страницей */
  to?: string
}

withDefaults(
  defineProps<{
    items: BreadcrumbItem[]
    /** false — только «таблетка», без fixed-обёртки */
    fixed?: boolean
  }>(),
  { fixed: true }
)

const pillClass =
  'inline-flex w-fit max-w-[calc(100vw-2rem)] lg:max-w-[calc(100vw-6rem)] rounded-2xl border border-white/30 bg-white/85 px-4 py-2.5 shadow-sm backdrop-blur-sm'
</script>

<template>
  <div
    v-if="fixed"
    class="pointer-events-none fixed top-28 lg:top-32 left-4 z-30 lg:left-12"
  >
    <div :class="[pillClass, 'pointer-events-auto']">
      <nav class="max-w-full text-sm leading-snug" aria-label="Навигационная цепочка">
        <ol class="flex max-w-full flex-wrap items-center gap-x-1.5 gap-y-1">
          <li
            v-for="(item, i) in items"
            :key="i"
            class="inline-flex items-center gap-x-1.5"
          >
            <ChevronRightIcon
              v-if="i > 0"
              class="h-4 w-4 shrink-0 text-olivine-500/90"
              aria-hidden="true"
            />
            <NuxtLink
              v-if="item.to"
              :to="item.to"
              class="text-gray-600 transition-colors hover:text-olivine-600"
            >
              {{ item.label }}
            </NuxtLink>
            <span
              v-else
              class="font-medium text-gray-900"
              aria-current="page"
            >
              {{ item.label }}
            </span>
          </li>
        </ol>
      </nav>
    </div>
  </div>
  <div v-else :class="pillClass">
    <nav class="max-w-full text-sm leading-snug" aria-label="Навигационная цепочка">
      <ol class="flex max-w-full flex-wrap items-center gap-x-1.5 gap-y-1">
        <li
          v-for="(item, i) in items"
          :key="i"
          class="inline-flex items-center gap-x-1.5"
        >
          <ChevronRightIcon
            v-if="i > 0"
            class="h-4 w-4 shrink-0 text-olivine-500/90"
            aria-hidden="true"
          />
          <NuxtLink
            v-if="item.to"
            :to="item.to"
            class="text-gray-600 transition-colors hover:text-olivine-600"
          >
            {{ item.label }}
          </NuxtLink>
          <span
            v-else
            class="font-medium text-gray-900"
            aria-current="page"
          >
            {{ item.label }}
          </span>
        </li>
      </ol>
    </nav>
  </div>
</template>
