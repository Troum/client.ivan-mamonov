<script setup lang="ts">
defineProps<{
  options: { value: number; label: string }[]
  headingId?: string
}>()

const selected = defineModel<number>({ required: true })
</script>

<template>
  <div>
    <p
      :id="headingId"
      class="mt-7 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
    >
      Тема обращения
    </p>
    <div class="mt-3.5 flex flex-wrap gap-2" role="radiogroup" :aria-labelledby="headingId">
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
          class="rounded-full border border-line bg-paper px-4 py-2 text-[13px] font-medium text-ink-soft transition-all duration-300 select-none hover:border-moss/50 hover:text-moss peer-checked:border-moss peer-checked:bg-moss peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-moss"
        >
          {{ opt.label }}
        </span>
      </label>
    </div>
  </div>
</template>
