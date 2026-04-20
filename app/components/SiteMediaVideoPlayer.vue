<script setup lang="ts">
/**
 * Компактный кастомный видеоплеер (без нативных controls): прогресс, время, громкость, полный экран.
 */
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  PauseIcon,
  PlayIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from '@heroicons/vue/24/solid'

const props = withDefaults(
  defineProps<{
    src: string
    caption?: string
    /** Ограничение ширины плеера (Tailwind), по умолчанию компактный блок */
    maxWidthClass?: string
  }>(),
  { maxWidthClass: 'max-w-md' }
)

const rootRef = ref<HTMLElement | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)

const hasMetadata = ref(false)
const hasError = ref(false)
const isPlaying = ref(false)
const isWaiting = ref(false)
const duration = ref(0)
const currentTime = ref(0)
const volume = ref(1)
const isMuted = ref(false)
const isFs = ref(false)
/** Нижняя панель — только после первого успешного воспроизведения */
const controlBarVisible = ref(false)

const progressPercent = computed(() => {
  if (!duration.value || duration.value <= 0) return 0
  return (currentTime.value / duration.value) * 100
})

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00'
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.floor(sec % 60)
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${m}:${String(s).padStart(2, '0')}`
}

function onLoadedMetadata() {
  const el = videoRef.value
  if (!el) return
  hasMetadata.value = true
  duration.value = el.duration || 0
  volume.value = el.volume
  isMuted.value = el.muted
}

function onTimeUpdate() {
  const el = videoRef.value
  if (!el) return
  currentTime.value = el.currentTime
}

function onPlay() {
  isPlaying.value = true
  controlBarVisible.value = true
}

function onPause() {
  isPlaying.value = false
}

function onEnded() {
  isPlaying.value = false
  currentTime.value = duration.value
}

function onWaiting() {
  isWaiting.value = true
}

function onCanPlay() {
  isWaiting.value = false
}

function onError() {
  hasError.value = true
}

async function togglePlay() {
  const el = videoRef.value
  if (!el || hasError.value) return
  try {
    if (el.paused) {
      await el.play()
    } else {
      el.pause()
    }
  } catch {
    /* gesture / autoplay policy */
  }
}

function onSeekInput(e: Event) {
  const el = videoRef.value
  const input = e.target as HTMLInputElement
  if (!el || !duration.value) return
  const pct = Number.parseFloat(input.value)
  el.currentTime = (pct / 100) * duration.value
  currentTime.value = el.currentTime
}

function onVolumeInput(e: Event) {
  const el = videoRef.value
  const input = e.target as HTMLInputElement
  if (!el) return
  const v = Number.parseFloat(input.value) / 100
  el.volume = v
  volume.value = v
  if (v > 0 && el.muted) {
    el.muted = false
    isMuted.value = false
  }
}

function toggleMute() {
  const el = videoRef.value
  if (!el) return
  el.muted = !el.muted
  isMuted.value = el.muted
}

async function toggleFullscreen() {
  const el = rootRef.value
  if (!el) return
  try {
    if (!document.fullscreenElement) {
      await el.requestFullscreen()
    } else {
      await document.exitFullscreen()
    }
  } catch {
    /* Safari / permissions */
  }
}

function onFsChange() {
  isFs.value = Boolean(document.fullscreenElement)
}

watch(
  () => props.src,
  () => {
    hasMetadata.value = false
    hasError.value = false
    isPlaying.value = false
    duration.value = 0
    currentTime.value = 0
    isWaiting.value = false
    controlBarVisible.value = false
  }
)

onMounted(() => {
  document.addEventListener('fullscreenchange', onFsChange)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', onFsChange)
})
</script>

<template>
  <figure class="site-media-video w-full" :class="maxWidthClass">
    <div
      ref="rootRef"
      class="group relative aspect-video w-full overflow-hidden rounded-2xl bg-linear-to-br from-slate-800 via-slate-900 to-black shadow-lg ring-1 ring-slate-200/90 outline-none"
      tabindex="0"
      role="region"
      aria-label="Видеоплеер"
      @keydown.space.prevent="togglePlay"
    >
      <!-- Загрузка метаданных -->
      <div
        v-if="!hasMetadata && !hasError"
        class="absolute inset-0 z-1 bg-linear-to-br from-olivine-900/35 via-slate-900/90 to-slate-950"
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
        class="absolute inset-0 z-2 flex flex-col items-center justify-center gap-2 bg-slate-900 px-4 text-center"
      >
        <p class="text-sm font-medium text-white/90">Не удалось загрузить видео</p>
        <p class="max-w-sm text-xs text-white/55">Проверьте ссылку на файл или попробуйте позже.</p>
      </div>

      <video
        ref="videoRef"
        class="absolute inset-0 z-0 h-full w-full object-contain outline-none"
        :class="{ 'opacity-0': !hasMetadata && !hasError }"
        :src="src"
        playsinline
        preload="metadata"
        @click="togglePlay"
        @loadedmetadata="onLoadedMetadata"
        @timeupdate="onTimeUpdate"
        @play="onPlay"
        @pause="onPause"
        @ended="onEnded"
        @waiting="onWaiting"
        @canplay="onCanPlay"
        @error="onError"
      >
        Ваш браузер не поддерживает встроенное видео.
      </video>

      <!-- Буферизация -->
      <div
        v-if="isWaiting && hasMetadata && !hasError"
        class="pointer-events-none absolute inset-0 z-2 flex items-center justify-center bg-black/20"
        aria-hidden="true"
      >
        <div
          class="h-9 w-9 animate-spin rounded-full border-2 border-white/30 border-t-olivine-400"
        />
      </div>

      <!-- Центр: play до первого старта (панель ещё скрыта) -->
      <button
        v-if="hasMetadata && !isPlaying && !hasError && !controlBarVisible"
        type="button"
        class="absolute inset-0 z-3 flex cursor-pointer items-center justify-center border-0 bg-linear-to-t from-black/50 via-transparent to-transparent p-0 transition hover:from-black/60"
        aria-label="Воспроизвести"
        @click.stop="togglePlay"
      >
        <span
          class="flex h-14 w-14 items-center justify-center rounded-full bg-olivine-500 text-white shadow-lg ring-4 ring-white/15 transition group-hover:scale-105 sm:h-16 sm:w-16"
        >
          <PlayIcon class="h-7 w-7 translate-x-0.5 sm:h-8 sm:w-8" aria-hidden="true" />
        </span>
      </button>

      <!-- Кастомная панель — после первого play -->
      <div
        v-if="hasMetadata && !hasError && controlBarVisible"
        class="absolute inset-x-0 bottom-0 z-4 bg-linear-to-t from-black/85 via-black/50 to-transparent px-3 pb-3 pt-10 sm:px-4"
        @click.stop
      >
        <!-- Прогресс -->
        <label class="mb-2 block">
          <span class="sr-only">Позиция воспроизведения</span>
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            :value="progressPercent"
            class="site-video-range h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-olivine-400 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-olivine-400 [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-olivine-400"
            @input="onSeekInput"
          />
        </label>

        <div class="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-white/20"
            :aria-label="isPlaying ? 'Пауза' : 'Воспроизведение'"
            @click="togglePlay"
          >
            <PauseIcon v-if="isPlaying" class="h-5 w-5" />
            <PlayIcon v-else class="h-5 w-5 translate-x-0.5" />
          </button>

          <div class="min-w-0 flex-1 font-mono text-[11px] tabular-nums text-white/90 sm:text-xs">
            <span>{{ formatTime(currentTime) }}</span>
            <span class="text-white/45"> / </span>
            <span class="text-white/70">{{ formatTime(duration) }}</span>
          </div>

          <div class="flex items-center gap-1.5">
            <button
              type="button"
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20"
              :aria-label="isMuted ? 'Включить звук' : 'Выключить звук'"
              @click="toggleMute"
            >
              <SpeakerXMarkIcon v-if="isMuted" class="h-5 w-5" />
              <SpeakerWaveIcon v-else class="h-5 w-5" />
            </button>
            <label class="sr-only">Громкость</label>
            <input
              type="range"
              min="0"
              max="100"
              :value="isMuted ? 0 : volume * 100"
              class="site-video-range-vol hidden h-1 w-20 max-w-20 cursor-pointer appearance-none rounded-full bg-white/20 accent-olivine-400 sm:block [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-moz-range-thumb]:h-2.5 [&::-moz-range-thumb]:w-2.5 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white"
              @input="onVolumeInput"
            />
          </div>

          <button
            type="button"
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20"
            :aria-label="isFs ? 'Выйти из полного экрана' : 'Полный экран'"
            @click="toggleFullscreen"
          >
            <ArrowsPointingInIcon v-if="isFs" class="h-5 w-5" />
            <ArrowsPointingOutIcon v-else class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>

    <figcaption v-if="caption" class="mt-3 text-center text-sm text-gray-500">
      {{ caption }}
    </figcaption>
  </figure>
</template>

<style scoped>
/* Firefox: трек для ползунка громкости */
.site-video-range-vol::-moz-range-track {
  background: rgb(255 255 255 / 0.2);
  border-radius: 9999px;
  height: 4px;
}
</style>
