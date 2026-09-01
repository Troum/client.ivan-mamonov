/**
 * Публичный контент страниц из API с запасными значениями.
 */

export interface SiteSeo {
  meta_title: string
  meta_description: string
  og_title: string
  og_description: string
  og_image: string
}

function emptySeo(): SiteSeo {
  return {
    meta_title: '',
    meta_description: '',
    og_title: '',
    og_description: '',
    og_image: '',
  }
}

function mergeSeo(partial: unknown): SiteSeo {
  if (!partial || typeof partial !== 'object') return emptySeo()
  const p = partial as Record<string, unknown>
  return {
    meta_title: typeof p.meta_title === 'string' ? p.meta_title : '',
    meta_description: typeof p.meta_description === 'string' ? p.meta_description : '',
    og_title: typeof p.og_title === 'string' ? p.og_title : '',
    og_description: typeof p.og_description === 'string' ? p.og_description : '',
    og_image: typeof p.og_image === 'string' ? p.og_image : '',
  }
}

export interface SiteAboutContent {
  portrait_image: string
  role_label: string
  name_title: string
  bio_paragraphs: string[]
  stats: { icon: string; value: string; label: string }[]
  quote: string
  equipment_title: string
  equipment: { category: string; items: string }[]
  seo: SiteSeo
}

export interface SiteContactsContent {
  hero_title: string
  hero_subtitle: string
  hero_background_image: string
  section_title: string
  email: string
  phone_display: string
  phone_href: string
  location: string
  feedback_themes: { value: number; label: string }[]
  social_links: { platform: string; url: string; aria_label?: string | null; is_visible?: boolean }[]
  seo: SiteSeo
}

export interface SiteBlogSectionContent {
  hero_background_image: string
  hero_title: string
  hero_subtitle: string
  seo: SiteSeo
}

/** Категории фильтра на странице энциклопедии; value совпадает с полем encyclopedia.category в API */
export interface SiteEncyclopediaCategoryItem {
  value: string
  label: string
  icon: string
}

export interface SiteEncyclopediaSectionContent {
  hero_background_image: string
  hero_title: string
  hero_subtitle: string
  categories: SiteEncyclopediaCategoryItem[]
  seo: SiteSeo
}

export interface SiteHomeContent {
  seo: SiteSeo
}

export interface SiteShopPageContent {
  seo: SiteSeo
}

export function defaultSiteAbout(): SiteAboutContent {
  return {
    portrait_image: '/images/about-portrait.jpg',
    role_label: 'Фотограф / Путешественник',
    name_title: 'ИВАН МАМОНОВ',
    bio_paragraphs: [
      'Я — пейзажный фотограф из Приморского края. Более десяти лет я путешествую по России и миру, запечатлевая красоту природы в её самых разных проявлениях.',
      'Моя страсть — это горы, озёра и леса. Я верю, что фотография способна не только сохранить момент, но и передать эмоции, которые мы испытываем, находясь наедине с природой.',
      'За годы работы я побывал в самых отдалённых уголках Дальнего Востока, Сибири и Северного Кавказа. Мои фотографии публиковались в National Geographic, Russia Geographic и других изданиях.',
    ],
    stats: [
      { icon: 'i-heroicons-camera', value: '10+', label: 'Лет опыта' },
      { icon: 'i-heroicons-map-pin', value: '50+', label: 'Мест съемок' },
      { icon: 'i-heroicons-trophy', value: '15', label: 'Наград' },
      { icon: 'i-heroicons-heart', value: '1000+', label: 'Довольных клиентов' },
    ],
    quote:
      '«Фотография — это способ остановить время и сохранить то, что исчезнет через мгновение.»',
    equipment_title: 'Оборудование',
    equipment: [
      { category: 'Камера', items: 'Sony A7R V, Sony A7 IV' },
      {
        category: 'Объективы',
        items: 'Sony 16-35mm f/2.8 GM, Sony 24-70mm f/2.8 GM, Sony 70-200mm f/2.8 GM',
      },
      { category: 'Штативы', items: 'Gitzo Systematic GT5543LS, Really Right Stuff BH-55' },
      { category: 'Фильтры', items: 'LEE Filters, NISI, PolarPro' },
    ],
    seo: mergeSeo({
      meta_title: 'Иван Мамонов — пейзажный фотограф',
      meta_description:
        'Пейзажный фотограф из Приморья: путешествия, съёмка природы, печать и обучение.',
      og_title: 'Иван Мамонов — пейзажный фотограф',
      og_description:
        'Пейзажный фотограф из Приморья: путешествия, съёмка природы, печать и обучение.',
    }),
  }
}

export function defaultSiteContacts(): SiteContactsContent {
  return {
    hero_title: 'КОНТАКТЫ',
    hero_subtitle: 'Давайте создадим что-то прекрасное вместе',
    hero_background_image: '/images/hero-blog.jpg',
    section_title: 'Свяжитесь со мной',
    email: 'hello@ivanmamonov.ru',
    phone_display: '+7 (900) 123-45-67',
    phone_href: 'tel:+79001234567',
    location: 'Владивосток, Приморский край',
    feedback_themes: [
      { value: 1, label: 'Сотрудничество и реклама' },
      { value: 2, label: 'Фотосессии и съёмки' },
      { value: 3, label: 'Продажа фотографий' },
      { value: 4, label: 'О турах по Приморью' },
      { value: 5, label: 'Иные вопросы' },
    ],
    social_links: [
      { platform: 'instagram', url: 'https://instagram.com', aria_label: 'Instagram', is_visible: true },
      { platform: 'telegram', url: 'https://telegram.org', aria_label: 'Telegram', is_visible: true },
    ],
    seo: mergeSeo({
      meta_title: 'Контакты — Иван Мамонов',
      meta_description: 'Свяжитесь для сотрудничества, съёмок и вопросов по турам и печати.',
      og_title: 'Контакты — Иван Мамонов',
      og_description: 'Свяжитесь для сотрудничества, съёмок и вопросов по турам и печати.',
    }),
  }
}

export function defaultSiteBlogSection(): SiteBlogSectionContent {
  return {
    hero_background_image: '/images/hero-blog.jpg',
    hero_title: 'БЛОГ',
    hero_subtitle:
      'Истории путешествий, фотографии и впечатления из самых красивых уголков России',
    seo: mergeSeo({
      meta_title: 'Блог — Иван Мамонов',
      meta_description:
        'Истории путешествий, фотографии и впечатления из самых красивых уголков России.',
      og_title: 'Блог — Иван Мамонов',
      og_description:
        'Истории путешествий, фотографии и впечатления из самых красивых уголков России.',
    }),
  }
}

export function defaultSiteEncyclopediaSection(): SiteEncyclopediaSectionContent {
  return {
    hero_background_image: '/images/hero-encyclopedia.jpg',
    hero_title: 'ЭНЦИКЛОПЕДИЯ',
    hero_subtitle: 'ПРИМОРЬЯ — исторические места, природные локации и события Дальнего Востока',
    categories: [
      { value: 'nature', label: 'ПРИРОДА', icon: 'i-heroicons-globe-alt' },
      { value: 'history', label: 'ИСТОРИЯ', icon: 'i-heroicons-building-library' },
      { value: 'events', label: 'СОБЫТИЯ', icon: 'i-heroicons-calendar-days' },
    ],
    seo: mergeSeo({
      meta_title: 'Энциклопедия Приморья — Иван Мамонов',
      meta_description:
        'Исторические места, природные локации и события Дальнего Востока.',
      og_title: 'Энциклопедия Приморья — Иван Мамонов',
      og_description:
        'Исторические места, природные локации и события Дальнего Востока.',
    }),
  }
}

function normalizeEncyclopediaCategories(
  raw: unknown,
  fallback: SiteEncyclopediaCategoryItem[]
): SiteEncyclopediaCategoryItem[] {
  if (!Array.isArray(raw) || raw.length === 0) return fallback
  const out: SiteEncyclopediaCategoryItem[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const o = item as Record<string, unknown>
    const value = typeof o.value === 'string' ? o.value.trim() : ''
    const label = typeof o.label === 'string' ? o.label.trim() : ''
    if (!value || !label) continue
    const icon =
      typeof o.icon === 'string' && o.icon.trim() ? o.icon.trim() : 'i-heroicons-tag'
    out.push({ value, label, icon })
  }
  return out.length > 0 ? out : fallback
}

export function defaultSiteHome(): SiteHomeContent {
  return {
    seo: mergeSeo({
      meta_title: 'Иван Мамонов — пейзажный фотограф',
      meta_description:
        'Пейзажная фотография, блог путешествий, энциклопедия Приморья и магазин печатных работ.',
      og_title: 'Иван Мамонов — пейзажный фотограф',
      og_description:
        'Пейзажная фотография, блог путешествий, энциклопедия Приморья и магазин печатных работ.',
    }),
  }
}

export function defaultSiteShopPage(): SiteShopPageContent {
  return {
    seo: mergeSeo({
      meta_title: 'Магазин — Иван Мамонов',
      meta_description:
        'Печатные работы и материалы. Оформление и доставка по договоренности.',
      og_title: 'Магазин — Иван Мамонов',
      og_description:
        'Печатные работы и материалы. Оформление и доставка по договоренности.',
    }),
  }
}

function isAboutPayload(row: Record<string, unknown>): boolean {
  return (
    typeof row.portrait_image === 'string' &&
    Array.isArray(row.bio_paragraphs) &&
    row.bio_paragraphs.length > 0
  )
}

function isContactsPayload(row: Record<string, unknown>): boolean {
  return (
    typeof row.hero_title === 'string' &&
    Array.isArray(row.feedback_themes) &&
    row.feedback_themes.length > 0
  )
}

function isBlogSectionPayload(row: Record<string, unknown>): boolean {
  return typeof row.hero_title === 'string' && typeof row.hero_background_image === 'string'
}

function isEncyclopediaSectionPayload(row: Record<string, unknown>): boolean {
  return typeof row.hero_title === 'string' && typeof row.hero_background_image === 'string'
}

export async function loadSiteAbout(): Promise<SiteAboutContent> {
  const { fetchSiteAbout } = useContentApi()
  const defaults = defaultSiteAbout()
  const row = await fetchSiteAbout()
  if (row && isAboutPayload(row)) {
    const r = row as Record<string, unknown>
    return {
      ...defaults,
      ...r,
      seo: mergeSeo(r.seo),
    } as SiteAboutContent
  }
  return defaults
}

export async function loadSiteContacts(): Promise<SiteContactsContent> {
  const { fetchSiteContacts } = useContentApi()
  const defaults = defaultSiteContacts()
  const row = await fetchSiteContacts()
  if (row && isContactsPayload(row)) {
    const r = row as Record<string, unknown>
    return {
      ...defaults,
      ...r,
      seo: mergeSeo(r.seo),
    } as SiteContactsContent
  }
  return defaults
}

export async function loadSiteBlogSection(): Promise<SiteBlogSectionContent> {
  const { fetchSiteBlog } = useContentApi()
  const defaults = defaultSiteBlogSection()
  try {
    const row = await fetchSiteBlog()
    if (row && isBlogSectionPayload(row)) {
      const r = row as Record<string, unknown>
      return {
        ...defaults,
        ...r,
        seo: mergeSeo(r.seo),
      } as SiteBlogSectionContent
    }
  } catch {
    /* API недоступен */
  }
  return defaults
}

export async function loadSiteEncyclopediaSection(): Promise<SiteEncyclopediaSectionContent> {
  const { fetchSiteEncyclopediaSection } = useContentApi()
  const defaults = defaultSiteEncyclopediaSection()
  try {
    const row = await fetchSiteEncyclopediaSection()
    if (row && isEncyclopediaSectionPayload(row)) {
      const r = row as Record<string, unknown>
      return {
        ...defaults,
        ...r,
        categories: normalizeEncyclopediaCategories(r.categories, defaults.categories),
        seo: mergeSeo(r.seo),
      } as SiteEncyclopediaSectionContent
    }
  } catch {
    /* API недоступен */
  }
  return defaults
}

export async function loadSiteHome(): Promise<SiteHomeContent> {
  const { fetchSiteHome } = useContentApi()
  const defaults = defaultSiteHome()
  try {
    const row = await fetchSiteHome()
    if (row && typeof row === 'object' && row !== null && 'seo' in row) {
      return {
        seo: mergeSeo((row as Record<string, unknown>).seo),
      }
    }
  } catch {
    /* */
  }
  return defaults
}

export async function loadSiteShopPage(): Promise<SiteShopPageContent> {
  const { fetchSiteShopPage } = useContentApi()
  const defaults = defaultSiteShopPage()
  try {
    const row = await fetchSiteShopPage()
    if (row && typeof row === 'object' && row !== null && 'seo' in row) {
      return {
        seo: mergeSeo((row as Record<string, unknown>).seo),
      }
    }
  } catch {
    /* */
  }
  return defaults
}
