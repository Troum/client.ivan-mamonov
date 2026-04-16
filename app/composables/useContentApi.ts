import type { MapLocation } from '~/interfaces/MapLocation'

/**
 * Публичные материалы блога и энциклопедии с Laravel API.
 */
export function useContentApi() {
  const config = useRuntimeConfig()

  function apiUrl(path: string): string {
    const base = (config.public.apiBase as string).replace(/\/$/, '')
    const p = path.startsWith('/') ? path : `/${path}`
    return `${base}${p}`
  }

  function extractPaginated(res: unknown): Record<string, unknown>[] {
    if (!res || typeof res !== 'object') return []
    const r = res as Record<string, unknown>
    if (Array.isArray(r.data)) {
      return r.data as Record<string, unknown>[]
    }
    const root = (r.data ?? r) as Record<string, unknown>
    const paginated = root.paginated as Record<string, unknown> | unknown[] | undefined
    if (Array.isArray(paginated)) return paginated as Record<string, unknown>[]
    if (paginated && typeof paginated === 'object' && 'data' in paginated) {
      const data = (paginated as { data?: unknown }).data
      if (Array.isArray(data)) return data as Record<string, unknown>[]
    }
    if (Array.isArray(root.data)) return root.data as Record<string, unknown>[]
    return []
  }

  /** SuccessDto + JsonResource collection: `data` или `data.data`. */
  function extractResourceArray(res: unknown): Record<string, unknown>[] {
    if (!res || typeof res !== 'object') return []
    const r = res as Record<string, unknown>
    const d = r.data
    if (Array.isArray(d)) return d as Record<string, unknown>[]
    if (d && typeof d === 'object' && 'data' in d) {
      const inner = (d as { data?: unknown }).data
      if (Array.isArray(inner)) return inner as Record<string, unknown>[]
    }
    return []
  }

  function extractOne(res: unknown): Record<string, unknown> | null {
    if (!res || typeof res !== 'object') return null
    const r = res as Record<string, unknown>
    const d = r.data
    if (d && typeof d === 'object' && !Array.isArray(d)) {
      const inner = d as Record<string, unknown>
      if (inner.data && typeof inner.data === 'object' && !Array.isArray(inner.data)) {
        return inner.data as Record<string, unknown>
      }
      return inner as Record<string, unknown>
    }
    return null
  }

  /** Старый баг API: main_images приходил как `{ data: [...] }` вместо массива. */
  function normalizeImageListField(payload: Record<string, unknown>, key: string) {
    const raw = payload[key]
    if (Array.isArray(raw)) return
    if (raw && typeof raw === 'object' && !Array.isArray(raw) && 'data' in raw) {
      const d = (raw as { data?: unknown }).data
      if (Array.isArray(d)) payload[key] = d
    }
  }

  async function fetchPosts(perPage = 500) {
    return extractPaginated(
      await $fetch(apiUrl(`/posts?per_page=${perPage}`), {
        headers: { Accept: 'application/json' },
      })
    )
  }

  async function fetchPostBySlug(slug: string) {
    const one = extractOne(
      await $fetch(apiUrl(`/posts/${encodeURIComponent(slug)}`), {
        headers: { Accept: 'application/json' },
      })
    )
    if (one) normalizeImageListField(one, 'main_images')
    return one
  }

  async function fetchEncyclopedia(perPage = 500) {
    return extractPaginated(
      await $fetch(apiUrl(`/encyclopedia?per_page=${perPage}`), {
        headers: { Accept: 'application/json' },
      })
    )
  }

  async function fetchMapLocations(): Promise<MapLocation[]> {
    try {
      const raw = extractResourceArray(
        await $fetch(apiUrl('/map-locations'), {
          headers: { Accept: 'application/json' },
        })
      )
      return raw.map((row) => ({
        id: Number(row.id),
        title: String(row.title ?? ''),
        latitude: Number(row.latitude),
        longitude: Number(row.longitude),
        encyclopedia_slug:
          row.encyclopedia_slug === null || row.encyclopedia_slug === undefined
            ? null
            : String(row.encyclopedia_slug),
        description:
          row.description === null || row.description === undefined
            ? null
            : String(row.description),
        sort_order: Number(row.sort_order ?? 0),
        is_published: row.is_published === true,
      }))
    } catch {
      return []
    }
  }

  async function fetchEncyclopediaBySlug(slug: string) {
    const one = extractOne(
      await $fetch(apiUrl(`/encyclopedia/${encodeURIComponent(slug)}`), {
        headers: { Accept: 'application/json' },
      })
    )
    if (one) normalizeImageListField(one, 'main_images')
    return one
  }

  async function fetchSiteAbout() {
    try {
      return extractOne(
        await $fetch(apiUrl('/site/about'), {
          headers: { Accept: 'application/json' },
        })
      )
    } catch {
      return null
    }
  }

  async function fetchSiteContacts() {
    try {
      return extractOne(
        await $fetch(apiUrl('/site/contacts'), {
          headers: { Accept: 'application/json' },
        })
      )
    } catch {
      return null
    }
  }

  async function fetchSiteBlog() {
    try {
      return extractOne(
        await $fetch(apiUrl('/site/blog'), {
          headers: { Accept: 'application/json' },
        })
      )
    } catch {
      return null
    }
  }

  async function fetchSiteEncyclopediaSection() {
    try {
      return extractOne(
        await $fetch(apiUrl('/site/encyclopedia-section'), {
          headers: { Accept: 'application/json' },
        })
      )
    } catch {
      return null
    }
  }

  async function fetchSiteHome() {
    try {
      return extractOne(
        await $fetch(apiUrl('/site/home'), {
          headers: { Accept: 'application/json' },
        })
      )
    } catch {
      return null
    }
  }

  async function fetchSiteShopPage() {
    try {
      return extractOne(
        await $fetch(apiUrl('/site/shop-page'), {
          headers: { Accept: 'application/json' },
        })
      )
    } catch {
      return null
    }
  }

  return {
    apiUrl,
    fetchPosts,
    fetchPostBySlug,
    fetchEncyclopedia,
    fetchMapLocations,
    fetchEncyclopediaBySlug,
    fetchSiteAbout,
    fetchSiteContacts,
    fetchSiteBlog,
    fetchSiteEncyclopediaSection,
    fetchSiteHome,
    fetchSiteShopPage,
  }
}
