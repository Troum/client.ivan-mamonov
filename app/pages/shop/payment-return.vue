<script setup lang="ts">
const route = useRoute()
const shopCart = useShopCart()

const publicId = computed(() => (route.query.order as string) || '')
const loading = ref(true)
const paymentStatus = ref<string | null>(null)
const orderNumber = ref<string | null>(null)

let timer: ReturnType<typeof setInterval> | null = null

async function poll() {
  if (!publicId.value) {
    loading.value = false
    return
  }
  try {
    const res = (await shopCart.orderStatus(publicId.value)) as Record<string, unknown>
    const d = (res['data'] as Record<string, unknown> | undefined) ?? res
    if (d && typeof d === 'object') {
      paymentStatus.value = (d['payment_status'] as string | undefined) ?? null
      orderNumber.value = (d['order_number'] as string | undefined) ?? null
      if (d.payment_status === 'succeeded') {
        if (timer) clearInterval(timer)
        loading.value = false
        return
      }
    }
  } catch {
    /* retry */
  }
  loading.value = false
}

onMounted(async () => {
  await poll()
  if (publicId.value && paymentStatus.value !== 'succeeded') {
    timer = setInterval(poll, 3000)
  }
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const breadcrumbs = [
  { label: 'Главная', to: '/' },
  { label: 'Магазин', to: '/shop' },
  { label: 'Оплата' },
]
</script>

<template>
  <div class="min-h-screen bg-white">
    <AppBreadcrumbs :items="breadcrumbs" />
    <div class="p-8 md:px-12 md:py-16 max-w-lg mx-auto text-center">
      <h1 class="text-2xl font-extrabold uppercase text-gray-900 mb-6">Оплата</h1>

      <div v-if="!publicId" class="text-gray-600">
        Не указан заказ. Перейдите в
        <NuxtLink to="/shop" class="underline text-olivine-600">магазин</NuxtLink>.
      </div>

      <div v-else class="space-y-4 text-gray-800">
        <p v-if="orderNumber">Заказ <strong>{{ orderNumber }}</strong></p>

        <p v-if="loading && paymentStatus !== 'succeeded'" class="text-gray-500">Проверяем статус оплаты…</p>

        <template v-if="paymentStatus === 'succeeded'">
          <p class="text-xl text-emerald-600">Оплата прошла успешно. Спасибо!</p>
          <NuxtLink to="/shop" class="inline-block mt-6 underline text-olivine-600"> В каталог </NuxtLink>
        </template>

        <template v-else-if="!loading">
          <p class="text-gray-600">
            Если вы уже оплатили, статус обновится через несколько секунд. Иначе завершите оплату в окне банка или
            начните заново.
          </p>
          <NuxtLink to="/shop/cart" class="inline-block mt-4 underline text-olivine-600"> Корзина </NuxtLink>
        </template>
      </div>
    </div>
  </div>
</template>
