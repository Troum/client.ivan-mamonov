<script setup lang="ts">
const props = defineProps<{
  src: string
  alt: string
}>()

/** Портретные кадры в широком hero — contain + blur, не cover по центру с текстом. */
const useContain = ref(false)

function syncFit({ target }: Event) {
  const img = target as HTMLImageElement
  if (!img.naturalWidth || !img.naturalHeight) return
  useContain.value = img.naturalWidth / img.naturalHeight < 1.35
}

watch(
  () => props.src,
  () => {
    useContain.value = false
  }
)
</script>

<template>
  <div class="absolute inset-0">
    <img
      :src="props.src"
      alt=""
      aria-hidden="true"
      class="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl"
      :class="useContain ? 'opacity-70' : 'opacity-50'"
    />
    <img
      :key="props.src"
      :src="props.src"
      :alt="props.alt"
      class="relative z-[1] h-full w-full"
      :class="useContain ? 'object-contain object-center' : 'object-cover object-[center_30%]'"
      @load="syncFit"
    />
  </div>
</template>
