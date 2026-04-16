<script setup lang="ts">
import {type Component, computed} from 'vue'
import {
  ArrowLeftIcon,
  ArrowLongLeftIcon,
  ArrowLongRightIcon,
  ArrowRightIcon,
  BuildingLibraryIcon,
  CalendarDaysIcon,
  CameraIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  HeartIcon,
  MapIcon,
  MapPinIcon,
  PhoneIcon,
  TagIcon,
} from '@heroicons/vue/24/outline'
import {StarIcon} from '@heroicons/vue/24/solid'
import {XMarkIcon} from "@heroicons/vue/16/solid";

const props = defineProps<{
  name: string
  iconClass?: string
}>()

const map: Record<string, Component> = {
  'i-heroicons-camera': CameraIcon,
  'i-heroicons-map-pin': MapPinIcon,
  'i-heroicons-map': MapIcon,
  'i-heroicons-trophy': StarIcon,
  'i-heroicons-heart': HeartIcon,
  'i-heroicons-globe-alt': GlobeAltIcon,
  'i-heroicons-calendar-days': CalendarDaysIcon,
  'i-heroicons-tag': TagIcon,
  'i-heroicons-building-library': BuildingLibraryIcon,
  'i-heroicons-envelope': EnvelopeIcon,
  'i-heroicons-phone': PhoneIcon,
  'i-heroicons-arrow-left': ArrowLeftIcon,
  'i-heroicons-arrow-right': ArrowRightIcon,
  'i-heroicons-arrow-long-left': ArrowLongLeftIcon,
  'i-heroicons-arrow-long-right': ArrowLongRightIcon,
  'i-heroicons-x-mark': XMarkIcon,
}

const Comp = computed(() => map[props.name] ?? MapPinIcon)
</script>

<template>
  <component :is="Comp" :class="iconClass"/>
</template>
