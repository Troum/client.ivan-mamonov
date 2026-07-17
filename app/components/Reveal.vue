<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    delay?: number
    y?: number
    once?: boolean
  }>(),
  {
    delay: 0,
    y: 28,
    once: true,
  },
)

const el = ref<HTMLElement | null>(null)
const visible = ref(false)
const reduceMotion = ref(false)

onMounted(() => {
  reduceMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduceMotion.value) {
    visible.value = true
    return
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting) {
        visible.value = true
        if (props.once) observer.disconnect()
      } else if (!props.once) {
        visible.value = false
      }
    },
    { rootMargin: '-60px', threshold: 0.05 },
  )

  if (el.value) observer.observe(el.value)
  onUnmounted(() => observer.disconnect())
})
</script>

<template>
  <div
    ref="el"
    :class="[
      'transition-all duration-800 ease-[cubic-bezier(0.22,1,0.36,1)]',
      visible || reduceMotion ? 'translate-y-0 opacity-100' : 'opacity-0',
    ]"
    :style="{
      transitionDelay: `${delay}s`,
      transform: visible || reduceMotion ? undefined : `translateY(${y}px)`,
    }"
  >
    <slot />
  </div>
</template>

<style scoped>
.duration-800 {
  transition-duration: 800ms;
}
</style>
