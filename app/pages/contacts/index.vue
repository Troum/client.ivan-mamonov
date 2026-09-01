<script setup lang="ts">
import { Camera, Mail, MapPin, Music2, Phone, Play, Send } from '@lucide/vue'
import { defaultSiteContacts, loadSiteContacts } from '~/composables/useSiteContent'

definePageMeta({
  name: 'contacts',
})

const { data } = await useAsyncData('site-contacts', () => loadSiteContacts(), {
  default: () => defaultSiteContacts(),
})

const site = computed(() => data.value ?? defaultSiteContacts())

const s0 = site.value
usePageSeo(s0.seo, {
  title: s0.seo.meta_title?.trim() || s0.hero_title || 'Контакты',
  description: s0.seo.meta_description?.trim() || s0.hero_subtitle,
  ogImage: s0.seo.og_image?.trim() || s0.hero_background_image,
})

const options = computed(() =>
  site.value.feedback_themes.map((t) => ({ value: t.value, label: t.label })),
)

const selected = ref(options.value[0]?.value ?? 1)
const theme = ref<string>()

watch(
  options,
  (opts) => {
    if (!opts.length) return
    if (!opts.some((o) => o.value === selected.value)) {
      selected.value = opts[0].value
    }
  },
  { immediate: true },
)

watch(
  [selected, options],
  () => {
    theme.value = options.value.find((o) => o.value === selected.value)?.label
  },
  { immediate: true },
)

const visibleSocialLinks = computed(() =>
  site.value.social_links.filter((link) => link.is_visible !== false),
)

const socialIcon = (platform: string) => {
  const p = platform.toLowerCase()
  if (p.includes('telegram')) return Send
  if (p.includes('instagram')) return Camera
  if (p.includes('youtube')) return Play
  if (p.includes('tiktok')) return Music2
  return Mail
}
</script>

<template>
  <div>
    <PageHero
      eyebrow="Контакты"
      current="Контакты"
      title-html="Давайте создадим что-то <em class=&quot;italic text-moss&quot;>прекрасное</em> вместе"
      title="Давайте создадим что-то прекрасное вместе"
      :subtitle="
        site.hero_subtitle ||
        'Открыт для сотрудничества, съёмок и интересных идей — отвечаю обычно в течение дня.'
      "
    />

    <section class="container-x pb-24">
      <div class="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div>
          <Reveal>
            <h2 class="font-display text-2xl font-semibold text-ink sm:text-3xl">
              {{ site.section_title || 'Свяжитесь со мной' }}
            </h2>
          </Reveal>

          <div class="mt-8 space-y-4">
            <Reveal>
              <div
                class="group flex items-center gap-5 rounded-2xl border border-line bg-white p-5 transition-colors hover:border-moss/40"
              >
                <span
                  class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-moss-wash text-moss transition-colors duration-500 group-hover:bg-moss group-hover:text-white"
                >
                  <Mail class="h-5 w-5" />
                </span>
                <div class="min-w-0">
                  <p
                    class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
                  >
                    Email
                  </p>
                  <a
                    :href="`mailto:${site.email}`"
                    class="mt-1 block truncate text-[15.5px] font-medium text-ink transition-colors hover:text-moss"
                  >
                    {{ site.email }}
                  </a>
                </div>
              </div>
            </Reveal>

            <Reveal :delay="0.05">
              <div
                class="group flex items-center gap-5 rounded-2xl border border-line bg-white p-5 transition-colors hover:border-moss/40"
              >
                <span
                  class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-moss-wash text-moss transition-colors duration-500 group-hover:bg-moss group-hover:text-white"
                >
                  <Phone class="h-5 w-5" />
                </span>
                <div class="min-w-0">
                  <p
                    class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
                  >
                    Телефон
                  </p>
                  <a
                    :href="site.phone_href"
                    class="mt-1 block truncate text-[15.5px] font-medium text-ink transition-colors hover:text-moss"
                  >
                    {{ site.phone_display }}
                  </a>
                </div>
              </div>
            </Reveal>

            <Reveal :delay="0.1">
              <div
                class="group flex items-center gap-5 rounded-2xl border border-line bg-white p-5 transition-colors hover:border-moss/40"
              >
                <span
                  class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-moss-wash text-moss transition-colors duration-500 group-hover:bg-moss group-hover:text-white"
                >
                  <MapPin class="h-5 w-5" />
                </span>
                <div class="min-w-0">
                  <p
                    class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
                  >
                    Локация
                  </p>
                  <p class="mt-1 text-[15.5px] font-medium text-ink">{{ site.location }}</p>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal v-if="visibleSocialLinks.length" :delay="0.15">
            <p
              class="mt-10 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
            >
              Социальные сети
            </p>
            <div class="mt-4 flex flex-wrap gap-3">
              <a
                v-for="(link, i) in visibleSocialLinks"
                :key="i"
                :href="link.url"
                target="_blank"
                rel="noreferrer"
                class="group inline-flex items-center gap-2.5 rounded-full border border-line bg-white px-5 py-2.5 text-[13.5px] font-semibold text-ink transition-all hover:border-moss hover:text-moss"
              >
                <component
                  :is="socialIcon(link.platform)"
                  class="h-4 w-4 text-muted-foreground transition-colors group-hover:text-moss"
                />
                {{ link.aria_label || link.platform }}
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal :delay="0.1">
          <div class="rounded-[2rem] border border-line bg-white p-7 sm:p-10">
            <FormsFeedbackForm :theme="theme" :theme-label="theme">
              <template #themes>
                <FormsContactThemeRadios
                  v-model="selected"
                  :options="options"
                  heading-id="contact-theme-heading"
                />
              </template>
            </FormsFeedbackForm>
          </div>
        </Reveal>
      </div>
    </section>
  </div>
</template>
