<script setup lang="ts">
import DOMPurify from 'dompurify'
import { renderToHTMLString } from '@tiptap/static-renderer'
import StarterKit from '@tiptap/starter-kit'

const props = withDefaults(
  defineProps<{
    content: object | null | undefined
    wrapperClass?: string
  }>(),
  {
    wrapperClass: 'tiptap-shop max-w-none text-gray-800',
  }
)

const html = computed(() => {
  if (!props.content || typeof props.content !== 'object') {
    return ''
  }
  try {
    return DOMPurify.sanitize(
      renderToHTMLString({ content: props.content as object, extensions: [StarterKit] })
    )
  } catch {
    return ''
  }
})
</script>

<template>
  <div v-if="html" :class="wrapperClass" v-html="html" />
</template>

<style scoped>
:deep(.tiptap-shop p) {
  margin-bottom: 0.75em;
}
</style>
