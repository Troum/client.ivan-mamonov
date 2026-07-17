<script setup lang="ts">
import { ArrowRight, CheckCircle2, Clock3, LoaderCircle, ShoppingBag } from '@lucide/vue'

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

</script>

<template>
  <div>
    <PageHero
      eyebrow="Статус заказа"
      current="Оплата"
      title="Статус оплаты"
      title-html="Статус <em class=&quot;italic text-moss&quot;>оплаты</em>"
      subtitle="Проверяем результат платежа и обновляем статус заказа автоматически."
    />

    <section class="container-x pb-24">
      <Reveal>
        <div class="mx-auto max-w-2xl overflow-hidden rounded-[2rem] border border-line bg-white">
          <div v-if="!publicId" class="px-8 py-16 text-center sm:px-14">
            <span class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-moss-wash text-moss">
              <ShoppingBag class="h-7 w-7" />
            </span>
            <h2 class="mt-6 font-display text-3xl font-semibold text-ink">Заказ не указан</h2>
            <p class="mt-3 text-sm leading-relaxed text-muted-foreground">
              Вернитесь в магазин и оформите заказ, чтобы перейти к оплате.
            </p>
            <NuxtLink to="/shop" class="btn-moss mt-8">
              В магазин
              <ArrowRight class="h-4 w-4" />
            </NuxtLink>
          </div>

          <div v-else class="px-8 py-16 text-center sm:px-14">
            <template v-if="paymentStatus === 'succeeded'">
              <span class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-moss text-white">
                <CheckCircle2 class="h-8 w-8" />
              </span>
              <p class="eyebrow mt-7">Платёж подтверждён</p>
              <h2 class="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
                Спасибо за покупку!
              </h2>
              <p v-if="orderNumber" class="mt-4 text-sm text-muted-foreground">
                Заказ <strong class="font-semibold text-ink">{{ orderNumber }}</strong>
              </p>
              <p class="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                Оплата прошла успешно. Информацию о заказе и дальнейших шагах отправим на указанный email.
              </p>
              <NuxtLink to="/shop" class="btn-moss mt-8">
                Вернуться в каталог
                <ArrowRight class="h-4 w-4" />
              </NuxtLink>
            </template>

            <template v-else>
              <span class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-moss-wash text-moss">
                <LoaderCircle v-if="loading" class="h-8 w-8 animate-spin" />
                <Clock3 v-else class="h-8 w-8" />
              </span>
              <p class="eyebrow mt-7">Ожидаем подтверждение</p>
              <h2 class="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
                Проверяем оплату
              </h2>
              <p v-if="orderNumber" class="mt-4 text-sm text-muted-foreground">
                Заказ <strong class="font-semibold text-ink">{{ orderNumber }}</strong>
              </p>
              <p class="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                Если вы уже оплатили, статус обновится через несколько секунд. Не закрывайте эту страницу.
              </p>
              <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <NuxtLink to="/shop/cart" class="btn-outline justify-center">
                  <ShoppingBag class="h-4 w-4" />
                  Вернуться в корзину
                </NuxtLink>
              </div>
            </template>
          </div>
          <div class="border-t border-line bg-paper-deep/50 px-6 py-4 text-center">
            <p class="text-xs text-muted-foreground">
              Статус обновляется автоматически каждые несколько секунд
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  </div>
</template>
