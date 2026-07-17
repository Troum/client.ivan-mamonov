<template>
  <div class="flex min-h-screen flex-col bg-paper">
    <LayoutAppHeader />
    <main class="flex-1">
      <slot />
    </main>
    <LayoutAppFooter />
  </div>
</template>
