<script setup lang="ts">
/**
 * Полноширинный герой раздела (блог, энциклопедия): фон, заголовок, подзаголовок.
 */
const props = withDefaults(
  defineProps<{
    backgroundImage: string
    title: string
    subtitle: string
    /** Блог: 60vh + плотный оверлей + запасной фон без картинки. Энциклопедия: 50vh + градиент. */
    variant?: 'blog' | 'encyclopedia'
  }>(),
  { variant: 'encyclopedia' }
)

const resolvedSrc = computed(() => resolvePublicMediaUrl(props.backgroundImage?.trim() || ''))
const hasImage = computed(() => Boolean(resolvedSrc.value))

const sectionMinClass = computed(() =>
  props.variant === 'blog' ? 'min-h-[60vh]' : 'min-h-[50vh]'
)

const imgMinClass = computed(() => sectionMinClass.value)
</script>

<template>
  <section
    class="relative flex items-center justify-center overflow-hidden"
    :class="sectionMinClass"
  >
    <template v-if="hasImage">
      <div class="absolute inset-0">
        <img
          :src="resolvedSrc"
          alt=""
          class="w-full h-full object-cover"
          :class="imgMinClass"
        />
        <div
          v-if="variant === 'encyclopedia'"
          class="absolute inset-0 bg-linear-to-b from-olivine-900/40 to-olivine-900/80"
        />
        <div v-else class="absolute inset-0 bg-olivine-950/80" />
      </div>
    </template>
    <template v-else-if="variant === 'blog'">
      <div class="absolute inset-0 bg-olivine-950" />
      <div class="absolute inset-0 opacity-10">
        <div
          class="absolute inset-0"
          style="
            background-image: url(&quot;data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E&quot;);
          "
        />
      </div>
    </template>
    <template v-else>
      <div class="absolute inset-0 bg-olivine-950" />
    </template>

    <div class="relative z-10 text-center px-6 py-24">
      <h1 class="text-5xl lg:text-7xl xl:text-8xl font-extrabold text-white tracking-tight leading-none">
        {{ title }}
      </h1>
      <p
        v-if="subtitle"
        class="mt-6 text-lg lg:text-xl max-w-2xl mx-auto"
        :class="
          variant === 'blog'
            ? 'text-olivine-200'
            : 'text-olivine-100 leading-relaxed'
        "
      >
        {{ subtitle }}
      </p>
    </div>
  </section>
</template>
