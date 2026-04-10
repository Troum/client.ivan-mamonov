<script setup lang="ts">
defineProps<{
  options: { value: number; label: string }[]
  /** id заголовка секции на странице (для aria-labelledby) */
  headingId?: string
}>()

const selected = defineModel<number>({ required: true })
</script>

<template>
  <!-- Паттерн Tailwind UI «Small cards»: сегменты в ряд, выбранный — заливка + белый текст -->
  <div
    class="flex flex-wrap gap-2 sm:gap-2.5"
    role="radiogroup"
    :aria-labelledby="headingId"
  >
    <label
      v-for="opt in options"
      :key="opt.value"
      :for="`contact-theme-${opt.value}`"
      class="group inline-flex cursor-pointer"
    >
      <input
        :id="`contact-theme-${opt.value}`"
        v-model="selected"
        type="radio"
        name="contact-theme"
        :value="opt.value"
        class="peer sr-only"
      />
      <span
        class="inline-flex min-h-10 max-w-full items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-center text-sm font-medium leading-snug text-gray-900 shadow-xs transition-colors select-none hover:border-olivine-300 peer-checked:border-transparent peer-checked:bg-olivine-500 peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-olivine-500 sm:px-4 sm:py-2.5"
      >
        {{ opt.label }}
      </span>
    </label>
  </div>
</template>
