/**
 * Публичные вызовы Laravel API (без авторизации).
 */
export function usePublicApi() {
  const config = useRuntimeConfig()

  function apiUrl(path: string): string {
    const base = (config.public.apiBase as string).replace(/\/$/, '')
    const p = path.startsWith('/') ? path : `/${path}`
    return `${base}${p}`
  }

  async function submitFeedback(body: {
    email: string
    name?: string
    theme: string
    message: string
  }) {
    return await $fetch(apiUrl('/feedback'), {
      method: 'POST',
      body,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
  }

  async function subscribeNewsletter(email: string) {
    return await $fetch(apiUrl('/subscribers/subscribe'), {
      method: 'POST',
      body: { email },
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
  }

  return {
    submitFeedback,
    subscribeNewsletter,
  }
}
