<script setup lang="ts">
const route = useRoute()
const isHome = computed(() => route.path === '/')
</script>

<template>
  <div class="min-h-screen bg-white">
    <LayoutAppHeader />
    <main :class="isHome ? '' : 'pt-16 lg:pt-20'">
      <slot />
    </main>
    <LayoutAppFooter v-if="!isHome" />
  </div>
</template>
