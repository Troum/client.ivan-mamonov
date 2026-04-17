<script setup lang="ts">
/**
 * Встраиваемое видео для материалов сайта: 16:9, акцент olivine, нативные controls после старта.
 */
import { ref, watch } from 'vue'
import { PlayIcon } from '@heroicons/vue/24/solid'

const props = defineProps<{
  src: string
  /** Подпись под рамкой (например «Фрагмент 1») */
  caption?: string
}>()

const videoRef = ref<HTMLVideoElement | null>(null)
const hasMetadata = ref(false)
const hasStarted = ref(false)
const hasError = ref(false)

function onLoadedMetadata() {
  hasMetadata.value = true
}

function onPlay() {
  hasStarted.value = true
}

function onError() {
  hasError.value = true
}

async function startPlayback() {
  const el = videoRef.value
  if (!el || hasError.value) return
  try {
    await el.play()
  } catch {
    // Автовоспроизведение может быть заблокировано — пользователь нажмёт play на панели
    hasStarted.value = true
  }
}

watch(
  () => props.src,
  () => {
    hasMetadata.value = false
    hasStarted.value = false
    hasError.value = false
  }
)
</script>

<template>
  <figure class="site-media-video w-full">
    <div
      class="relative aspect-video w-full overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-black shadow-[0_25px_50px_-12px_rgba(15,23,42,0.35)] ring-1 ring-slate-200/90"
    >
      <!-- Пока нет метаданных — мягкий скелетон вместо «чёрного ящика» -->
      <div
        v-if="!hasMetadata && !hasError"
        class="absolute inset-0 z-[1] bg-gradient-to-br from-olivine-900/35 via-slate-900/90 to-slate-950"
        aria-hidden="true"
      >
        <div
          class="absolute inset-0 opacity-40"
          style="
            background-image: radial-gradient(
              circle at 30% 20%,
              rgb(134 166 99 / 0.25),
              transparent 50%
            );
          "
        />
      </div>

      <div
        v-if="hasError"
        class="absolute inset-0 z-[2] flex flex-col items-center justify-center gap-2 bg-slate-900 px-4 text-center"
      >
        <p class="text-sm font-medium text-white/90">Не удалось загрузить видео</p>
        <p class="max-w-sm text-xs text-white/55">Проверьте ссылку на файл или попробуйте позже.</p>
      </div>

      <video
        ref="videoRef"
        class="relative z-0 h-full w-full object-contain outline-none"
        :class="{ 'opacity-0': !hasMetadata && !hasError }"
        :src="src"
        controls
        playsinline
        preload="metadata"
        controlslist="nodownload"
        @loadedmetadata="onLoadedMetadata"
        @play="onPlay"
        @error="onError"
      >
        Ваш браузер не поддерживает встроенное видео.
      </video>

      <!-- Крупный старт: до первого воспроизведения -->
      <button
        v-if="hasMetadata && !hasStarted && !hasError"
        type="button"
        class="group absolute inset-0 z-[3] flex cursor-pointer items-center justify-center border-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent p-0 transition hover:from-black/65"
        aria-label="Воспроизвести видео"
        @click="startPlayback"
      >
        <span
          class="flex h-16 w-16 items-center justify-center rounded-full bg-olivine-500 text-white shadow-lg shadow-olivine-900/40 ring-4 ring-white/15 transition group-hover:scale-105 sm:h-20 sm:w-20"
        >
          <PlayIcon class="h-8 w-8 translate-x-0.5 sm:h-10 sm:w-10" aria-hidden="true" />
        </span>
      </button>
    </div>

    <figcaption
      v-if="caption"
      class="mt-3 text-center text-sm text-gray-500"
    >
      {{ caption }}
    </figcaption>
  </figure>
</template>
