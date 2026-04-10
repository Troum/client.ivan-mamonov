import type { SiteSeo } from '~/composables/useSiteContent'

/**
 * URL картинки для img / og: полный URL, `/storage` с API, остальные пути — с origin сайта (public Nuxt).
 */
export function resolvePublicMediaUrl(path: string): string {
  const p = path?.trim()
  if (!p) return ''
  if (/^https?:\/\//i.test(p)) return p
  const config = useRuntimeConfig()
  if (p.startsWith('/storage')) {
    const apiOrigin = String(config.public.apiBase || '').replace(/\/api\/?$/, '')
    return `${apiOrigin}${p}`
  }
  if (import.meta.client && typeof window !== 'undefined') {
    return `${window.location.origin}${p.startsWith('/') ? p : `/${p}`}`
  }
  return p
}

/** @deprecated используйте resolvePublicMediaUrl */
export function resolveOgImageUrl(path: string): string {
  return resolvePublicMediaUrl(path)
}

export function usePageSeo(
  seo: SiteSeo | null | undefined,
  fallback: { title: string; description: string; ogImage?: string }
) {
  const title = (seo?.meta_title?.trim() || fallback.title).slice(0, 500)
  const description = (seo?.meta_description?.trim() || fallback.description).slice(0, 2000)
  const ogTitle = (seo?.og_title?.trim() || title).slice(0, 500)
  const ogDescription = (seo?.og_description?.trim() || description).slice(0, 2000)
  const ogFromSeo = seo?.og_image?.trim()
  const ogFallback = fallback.ogImage?.trim()
  const ogImageRaw = ogFromSeo || ogFallback || ''
  const ogImage = ogImageRaw ? resolvePublicMediaUrl(ogImageRaw) : undefined

  useSeoMeta({
    title,
    description,
    ogTitle,
    ogDescription,
    twitterCard: 'summary_large_image',
    ...(ogImage ? { ogImage, twitterImage: ogImage } : {}),
  })
}
