<script setup lang="ts">
const shopCart = useShopCart()

const loading = ref(false)
const error = ref<string | null>(null)

const email = ref('')
const phone = ref('')
const name = ref('')

const siteOrigin = computed(() => {
  if (typeof window !== 'undefined') return window.location.origin
  return ''
})

async function submit() {
  loading.value = true
  error.value = null
  try {
    const returnUrl = `${siteOrigin.value}/shop/payment-return`
    const res = (await shopCart.checkout({
      email: email.value.trim(),
      phone: phone.value.trim() || undefined,
      name: name.value.trim() || undefined,
      return_url: returnUrl,
      payment_gateway: 'yookassa',
    })) as { data?: { payment_url?: string }; message?: string }

    const url = res.data?.payment_url
    if (url) {
      window.location.href = url
      return
    }
    error.value = res.message ?? 'Не удалось получить ссылку на оплату'
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }; message?: string }
    error.value = err?.data?.message ?? err?.message ?? 'Ошибка оформления'
  } finally {
    loading.value = false
  }
}

const breadcrumbs = [
  { label: 'Главная', to: '/' },
  { label: 'Магазин', to: '/shop' },
  { label: 'Оформление' },
]
</script>

<template>
  <div class="min-h-screen bg-white">
    <AppBreadcrumbs :items="breadcrumbs" />
    <div class="p-8 md:px-12 md:py-16 max-w-lg mx-auto">
      <h1 class="text-3xl font-extrabold uppercase text-gray-900 mb-4">Оформление</h1>
      <p class="text-gray-600 text-sm mb-8">
        Оплата через ЮKassa (банковские карты, СБП и другие способы из кабинета ЮKassa).
      </p>

      <form class="space-y-4" @submit.prevent="submit">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1" for="chk-email">Email</label>
          <input
            id="chk-email"
            v-model="email"
            type="email"
            required
            placeholder="you@example.com"
            class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-olivine-400"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1" for="chk-phone">Телефон</label>
          <input
            id="chk-phone"
            v-model="phone"
            type="tel"
            placeholder="+7 …"
            class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-olivine-400"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1" for="chk-name">Имя</label>
          <input
            id="chk-name"
            v-model="name"
            type="text"
            placeholder="Как к вам обращаться"
            class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-olivine-400"
          />
        </div>

        <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>

        <div class="flex flex-col sm:flex-row gap-4 pt-4">
          <NuxtLink
            to="/shop/cart"
            class="inline-flex justify-center px-6 py-3 rounded-lg border border-gray-300 text-gray-800 hover:bg-gray-50"
          >
            Назад в корзину
          </NuxtLink>
          <button
            type="submit"
            :disabled="loading"
            class="inline-flex justify-center px-6 py-3 rounded-lg bg-olivine-500 text-white font-medium hover:bg-olivine-600 disabled:opacity-50 uppercase"
          >
            {{ loading ? '…' : 'Перейти к оплате' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
