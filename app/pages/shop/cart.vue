<script setup lang="ts">
import { ArrowLeft, ArrowRight, ShoppingBag, Trash2 } from '@lucide/vue'
import type { CartLine } from '~/interfaces/Cart'

const shopCart = useShopCart()
const loading = ref(true)
const error = ref<string | null>(null)
const lines = ref<CartLine[]>([])
const total = ref('0')
const currency = ref<string | null>(null)

async function load() {
  loading.value = true
  error.value = null
  try {
    const data = await shopCart.fetchCart()
    lines.value = data?.items ?? []
    total.value = data?.total ?? '0'
    currency.value = data?.currency ?? null
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Ошибка загрузки корзины'
  } finally {
    loading.value = false
  }
}

onMounted(load)

function formatMoney(amount: string, cur: string | null) {
  const n = Number(amount)
  const formatted = Number.isFinite(n) ? n.toLocaleString('ru-RU') : amount
  const sym = cur === 'RUB' ? '₽' : cur === 'USD' ? '$' : cur === 'EUR' ? '€' : cur ?? ''
  return `${formatted} ${sym}`.trim()
}
</script>

<template>
  <div>
    <PageHero
      eyebrow="Ваш выбор"
      current="Корзина"
      title="Корзина"
      title-html="Ваша <em class=&quot;italic text-moss&quot;>корзина</em>"
      subtitle="Проверьте состав заказа и количество товаров перед оформлением."
    />

    <section class="container-x pb-24">
      <div v-if="loading" class="py-20 text-center text-muted-foreground">Загрузка корзины…</div>
      <p v-else-if="error" class="rounded-2xl border border-destructive/20 bg-destructive/5 p-5 text-destructive">
        {{ error }}
      </p>

      <Reveal v-else-if="!lines.length">
        <div class="mx-auto max-w-xl rounded-[2rem] border border-line bg-white px-8 py-16 text-center">
          <span class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-moss-wash text-moss">
            <ShoppingBag class="h-7 w-7" />
          </span>
          <h2 class="mt-6 font-display text-3xl font-semibold text-ink">Корзина пока пуста</h2>
          <p class="mt-3 text-sm leading-relaxed text-muted-foreground">
            Загляните в каталог — скоро там появятся печатные работы и материалы.
          </p>
          <NuxtLink to="/shop" class="btn-moss mt-8">
            <ArrowLeft class="h-4 w-4" />
            В каталог
          </NuxtLink>
        </div>
      </Reveal>

      <div v-else class="grid items-start gap-8 lg:grid-cols-[1fr_360px]">
        <Reveal>
          <ul class="divide-y divide-line overflow-hidden rounded-[2rem] border border-line bg-white">
            <li
              v-for="line in lines"
              :key="line.product_id"
              class="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:p-8"
            >
              <div class="min-w-0 flex-1">
                <p class="eyebrow">Товар</p>
                <NuxtLink
                  :to="`/shop/${line.slug}`"
                  class="mt-2 block font-display text-xl font-semibold text-ink transition-colors hover:text-moss sm:text-2xl"
                >
                  {{ line.title }}
                </NuxtLink>
                <p class="mt-2 text-sm text-muted-foreground">
                  {{ formatMoney(line.unit_price, line.currency) }} за единицу
                </p>
              </div>
              <div class="flex flex-wrap items-center gap-3 sm:justify-end">
                <label class="sr-only" :for="`quantity-${line.product_id}`">Количество</label>
                <input
                  :id="`quantity-${line.product_id}`"
                  type="number"
                  min="0"
                  class="h-11 w-20 rounded-full border border-line bg-paper px-4 text-center text-sm text-ink outline-none transition-colors focus:border-moss"
                  :value="line.quantity"
                  @change="
                    shopCart
                      .setQuantity(line.product_id, Number(($event.target as HTMLInputElement).value) || 0)
                      .then(load)
                  "
                />
                <span class="min-w-28 text-right font-display text-lg font-semibold text-ink">
                  {{ formatMoney(line.line_total, line.currency) }}
                </span>
                <button
                  type="button"
                  class="flex h-11 w-11 items-center justify-center rounded-full border border-line text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
                  aria-label="Удалить"
                  @click="shopCart.removeItem(line.product_id).then(load)"
                >
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
            </li>
          </ul>
        </Reveal>

        <Reveal :delay="0.08" class="lg:sticky lg:top-28">
          <aside class="rounded-[2rem] bg-ink p-7 text-paper sm:p-8">
            <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-moss-soft">
              Ваш заказ
            </p>
            <div class="mt-6 flex items-end justify-between gap-4 border-b border-white/10 pb-6">
              <span class="text-sm text-paper/60">Итого</span>
              <strong class="font-display text-3xl font-semibold">
                {{ formatMoney(total, currency) }}
              </strong>
            </div>
            <p class="mt-5 text-xs leading-relaxed text-paper/50">
              Стоимость и детали доставки согласуем после оформления заказа.
            </p>
            <NuxtLink to="/shop/checkout" class="btn-moss mt-7 w-full justify-center">
              Оформить заказ
              <ArrowRight class="h-4 w-4" />
            </NuxtLink>
            <NuxtLink
              to="/shop"
              class="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-paper/60 transition-colors hover:text-paper"
            >
              <ArrowLeft class="h-4 w-4" />
              Продолжить покупки
            </NuxtLink>
          </aside>
        </Reveal>
      </div>
    </section>
  </div>
</template>
