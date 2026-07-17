<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    platform: string
    url: string
    ariaLabel?: string | null
    variant?: 'default' | 'footer'
  }>(),
  { variant: 'default' }
)

const hoverClass = computed(() => {
  if (props.variant === 'footer') return ''
  const m: Record<string, string> = {
    instagram: 'hover:bg-pink-50 hover:text-pink-600',
    telegram: 'hover:bg-moss-100 hover:text-blue-500',
    vk: 'hover:bg-blue-50 hover:text-blue-700',
    youtube: 'hover:bg-red-50 hover:text-red-600',
    website: 'hover:bg-moss-100 hover:text-moss-700',
  }
  return m[props.platform] ?? 'hover:bg-gray-200 hover:text-gray-900'
})

const buttonClass = computed(() => {
  if (props.variant === 'footer') {
    return 'w-10 h-10 bg-moss-900 rounded-full flex items-center justify-center text-moss-200 hover:bg-moss-500 hover:text-white transition-all duration-300'
  }
  return `w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 transition-all duration-300 ${hoverClass.value}`
})
</script>

<template>
  <a
    :href="url"
    target="_blank"
    rel="noopener noreferrer"
    :class="buttonClass"
    :aria-label="ariaLabel || platform"
  >
    <svg
      v-if="platform === 'instagram'"
      class="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>

    <svg
      v-else-if="platform === 'telegram'"
      class="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>

    <svg
      v-else-if="platform === 'vk'"
      class="w-5 h-5"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path
        d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.391 0 15.684 0zm3.692 17.123h-1.744c-.21 0-.272-.17-.456-.585-.486-1.122-1.13-2.005-2.149-2.005-.94 0-1.51.592-2.149 2.005-.153.375-.238.585-.459.585h-1.11V6.883h1.11c.68 0 .883.523 1.754 2.008.57.99 1.01 1.672 1.01 2.008 0 .317-.44.98-1.01 1.99-.89 1.534-1.097 2.008-1.754 2.008h1.744c.517 0 .722.41.722.93v6.39c0 .52-.205.93-.722.93z"
      />
    </svg>

    <svg
      v-else-if="platform === 'youtube'"
      class="w-5 h-5"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path
        d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
      />
    </svg>

    <svg
      v-else
      class="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  </a>
</template>
