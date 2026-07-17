<script setup lang="ts">
import { ArrowUpRight } from '@lucide/vue'
import { resolvePublicMediaUrl } from '~/composables/usePageSeo'

const props = defineProps<{
  slug: string
  title: string
  subtitle?: string | null
  image?: string | null
  category?: string | null
  categoryLabel?: string | null
}>()

const CATEGORY_STYLES: Record<string, string> = {
  history: 'bg-moss-wash text-moss-dark',
  events: 'bg-[#F4E9DC] text-[#8A5A2B]',
  nature: 'bg-[#E4EEF2] text-[#3D6073]',
  история: 'bg-moss-wash text-moss-dark',
  события: 'bg-[#F4E9DC] text-[#8A5A2B]',
  природа: 'bg-[#E4EEF2] text-[#3D6073]',
}

const imageUrl = computed(() => resolvePublicMediaUrl(props.image) || '/images/hero-encyclopedia.jpg')

const categoryKey = computed(() => (props.category || '').toLowerCase().trim())

const chipClass = computed(
  () => CATEGORY_STYLES[categoryKey.value] || 'bg-moss-wash text-moss-dark',
)

const label = computed(() => {
  if (props.categoryLabel) return props.categoryLabel
  const map: Record<string, string> = {
    history: 'История',
    events: 'События',
    nature: 'Природа',
  }
  return map[categoryKey.value] || props.category || ''
})
</script>

<template>
  <NuxtLink
    :to="`/encyclopedia/${slug}`"
    class="group card-hover block h-full overflow-hidden rounded-3xl border border-line bg-white"
  >
    <div class="relative aspect-[16/10] overflow-hidden">
      <img
        :src="imageUrl"
        :alt="title"
        loading="lazy"
        class="img-zoom h-full w-full object-cover"
      />
      <span
        v-if="label"
        :class="[
          'absolute left-4 top-4 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]',
          chipClass,
        ]"
      >
        {{ label }}
      </span>
    </div>
    <div class="p-6">
      <h3
        class="font-display text-[21px] font-semibold leading-snug text-ink transition-colors group-hover:text-moss"
      >
        {{ title }}
      </h3>
      <p
        v-if="subtitle"
        class="mt-3 line-clamp-2 text-[14.5px] leading-relaxed text-muted-foreground"
      >
        {{ subtitle }}
      </p>
      <span class="mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-moss">
        Читать
        <ArrowUpRight
          class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </span>
    </div>
  </NuxtLink>
</template>
