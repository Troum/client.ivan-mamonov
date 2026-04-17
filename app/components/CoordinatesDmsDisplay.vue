<script setup lang="ts">
import { computed } from 'vue'
import { latitudeToDisplay, longitudeToDisplay } from '~/utils/geoDmsFormat'

const props = withDefaults(
  defineProps<{
    latitude: number
    longitude: number
    /** hero — герой статьи; card — плитка статистики; inline — под картой; map-list — карточки на странице карты */
    variant?: 'hero' | 'card' | 'inline' | 'map-list'
  }>(),
  { variant: 'inline' },
)

const lat = computed(() => latitudeToDisplay(props.latitude))
const lng = computed(() => longitudeToDisplay(props.longitude))

const rootClass = computed(() => {
  switch (props.variant) {
    case 'hero':
      return 'coords-dms coords-dms--hero'
    case 'card':
      return 'coords-dms coords-dms--card'
    case 'map-list':
      return 'coords-dms coords-dms--map-list'
    default:
      return 'coords-dms coords-dms--inline'
  }
})
</script>

<template>
  <div
    :class="rootClass"
    role="group"
    aria-label="Координаты: широта и долгота в градусах, минутах и секундах"
  >
    <p class="coords-dms__line">
      <span class="coords-dms__segment">
        <span class="coords-dms__abbrev">Ш:</span>
        <span class="coords-dms__dms">
          <span class="coords-dms__num tabular-nums">{{ lat.deg }}</span>
          <span class="coords-dms__sym" aria-hidden="true">°</span>
          <span class="coords-dms__sp" />
          <span class="coords-dms__num tabular-nums">{{ String(lat.min).padStart(2, '0') }}</span>
          <span class="coords-dms__sym" aria-hidden="true">′</span>
          <span class="coords-dms__sp" />
          <span class="coords-dms__num tabular-nums">{{ lat.secDisplay }}</span>
          <span class="coords-dms__sym" aria-hidden="true">″</span>
          <span class="coords-dms__sp" />
          <span class="coords-dms__hem">{{ lat.hem }}</span>
        </span>
      </span>
      <span class="coords-dms__segment">
        <span class="coords-dms__abbrev">Д:</span>
        <span class="coords-dms__dms">
          <span class="coords-dms__num tabular-nums">{{ lng.deg }}</span>
          <span class="coords-dms__sym" aria-hidden="true">°</span>
          <span class="coords-dms__sp" />
          <span class="coords-dms__num tabular-nums">{{ String(lng.min).padStart(2, '0') }}</span>
          <span class="coords-dms__sym" aria-hidden="true">′</span>
          <span class="coords-dms__sp" />
          <span class="coords-dms__num tabular-nums">{{ lng.secDisplay }}</span>
          <span class="coords-dms__sym" aria-hidden="true">″</span>
          <span class="coords-dms__sp" />
          <span class="coords-dms__hem">{{ lng.hem }}</span>
        </span>
      </span>
    </p>
  </div>
</template>

<style scoped>
.coords-dms {
  width: 100%;
  min-width: 0;
}

.coords-dms__line {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.5rem 1rem;
  margin: 0;
  line-height: 1.45;
  font-variant-numeric: tabular-nums;
}

.coords-dms__segment {
  display: inline-flex;
  flex-wrap: nowrap;
  align-items: baseline;
  gap: 0.25rem;
  min-width: 0;
}

.coords-dms__abbrev {
  flex-shrink: 0;
  font-weight: 600;
}

.coords-dms__dms {
  display: inline;
  white-space: nowrap;
}

.coords-dms__sym {
  font-weight: 500;
  margin: 0 0.05em;
}

.coords-dms__sp {
  display: inline-block;
  width: 0.2em;
}

.coords-dms__hem {
  font-weight: 600;
  margin-left: 0.1em;
}

/* Hero */
.coords-dms--hero .coords-dms__line {
  font-size: 0.875rem;
  font-weight: 500;
  gap: 0.5rem 1.25rem;
}

@media (min-width: 640px) {
  .coords-dms--hero .coords-dms__line {
    font-size: 1rem;
  }
}

.coords-dms--hero .coords-dms__abbrev {
  color: rgb(255 255 255 / 0.65);
  font-weight: 600;
}

.coords-dms--hero .coords-dms__dms {
  color: rgb(255 255 255 / 0.96);
}

.coords-dms--hero .coords-dms__sym {
  color: rgb(255 255 255 / 0.55);
  font-weight: 400;
}

.coords-dms--hero .coords-dms__hem {
  color: rgb(255 255 255 / 0.96);
  font-weight: 500;
}

/* Карточка статистики: на широком экране — одна строка со скроллом; на узком — две строки (Ш / Д) */
.coords-dms--card {
  max-width: 100%;
}

@media (min-width: 640px) {
  .coords-dms--card {
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
  }
}

.coords-dms--card .coords-dms__line {
  width: 100%;
  min-width: 0;
  font-size: clamp(0.625rem, 0.5rem + 0.9vw, 0.75rem);
  font-weight: 600;
  line-height: 1.3;
  gap: 0.35rem 0.45rem;
  letter-spacing: -0.01em;
}

@media (max-width: 639px) {
  .coords-dms--card .coords-dms__line {
    flex-direction: column;
    align-items: flex-start;
    flex-wrap: nowrap;
  }
}

@media (min-width: 640px) {
  .coords-dms--card .coords-dms__line {
    flex-wrap: nowrap;
    width: max-content;
    min-width: 100%;
    gap: 0.15rem 0.45rem;
  }
}

.coords-dms--card .coords-dms__segment {
  gap: 0.15rem;
}

.coords-dms--card .coords-dms__abbrev {
  color: rgb(107 114 128);
}

.coords-dms--card .coords-dms__dms {
  color: rgb(17 24 39);
}

.coords-dms--card .coords-dms__sym {
  color: rgb(156 163 175);
  font-weight: 500;
  margin: 0 0.02em;
}

.coords-dms--card .coords-dms__sp {
  width: 0.12em;
}

.coords-dms--card .coords-dms__hem {
  color: rgb(17 24 39);
  font-weight: 600;
}

/* Под картой / блог */
.coords-dms--inline .coords-dms__line {
  font-size: 0.875rem;
  gap: 0.5rem 1rem;
}

.coords-dms--inline .coords-dms__abbrev {
  color: rgb(107 114 128);
  font-weight: 600;
}

.coords-dms--inline .coords-dms__dms {
  color: rgb(55 65 81);
}

.coords-dms--inline .coords-dms__sym {
  color: rgb(156 163 175);
}

.coords-dms--inline .coords-dms__hem {
  color: rgb(17 24 39);
  font-weight: 600;
}

/* Список на странице карты */
.coords-dms--map-list .coords-dms__line {
  font-size: 0.75rem;
  line-height: 1.4;
  gap: 0.375rem 0.75rem;
}

.coords-dms--map-list .coords-dms__abbrev {
  color: rgb(156 163 175);
  font-weight: 600;
}

.coords-dms--map-list .coords-dms__dms {
  color: rgb(75 85 99);
}

.coords-dms--map-list .coords-dms__sym {
  color: rgb(156 163 175);
}

.coords-dms--map-list .coords-dms__hem {
  color: rgb(75 85 99);
  font-weight: 600;
}
</style>
