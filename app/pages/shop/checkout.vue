<script setup lang="ts">
import { ArrowLeft, ArrowRight, CreditCard, LockKeyhole } from '@lucide/vue'

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

</script>

<template>
  <div>
    <PageHero
      eyebrow="Безопасная оплата"
      current="Оформление"
      title="Оформление заказа"
      title-html="Оформление <em class=&quot;italic text-moss&quot;>заказа</em>"
      subtitle="Оставьте контакты — после этого вы перейдёте на защищённую страницу оплаты ЮKassa."
    />

    <section class="container-x pb-24">
      <div class="grid items-start gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-12">
        <Reveal>
          <aside class="rounded-[2rem] bg-ink p-8 text-paper lg:sticky lg:top-28">
            <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-moss/20 text-moss-soft">
              <CreditCard class="h-5 w-5" />
            </span>
            <h2 class="mt-7 font-display text-3xl font-semibold">Оплата через ЮKassa</h2>
            <p class="mt-4 text-sm leading-relaxed text-paper/60">
              Банковские карты, СБП и другие способы, доступные на стороне платёжного сервиса.
            </p>
            <div class="mt-8 flex items-start gap-3 border-t border-white/10 pt-6">
              <LockKeyhole class="mt-0.5 h-4 w-4 shrink-0 text-moss-soft" />
              <p class="text-xs leading-relaxed text-paper/50">
                Платёжные данные вводятся на защищённой странице ЮKassa и не передаются сайту.
              </p>
            </div>
          </aside>
        </Reveal>

        <Reveal :delay="0.08">
          <form class="rounded-[2rem] border border-line bg-white p-7 sm:p-10" @submit.prevent="submit">
            <p class="eyebrow">Контактные данные</p>
            <h2 class="mt-3 font-display text-3xl font-semibold text-ink">Расскажите, как с вами связаться</h2>

            <div class="mt-9 space-y-6">
              <div>
                <label class="mb-2 block text-sm font-medium text-ink" for="chk-email">
                  Email <span class="text-moss">*</span>
                </label>
                <input
                  id="chk-email"
                  v-model="email"
                  type="email"
                  required
                  autocomplete="email"
                  placeholder="you@example.com"
                  class="w-full rounded-2xl border border-line bg-paper px-5 py-3.5 text-ink outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-moss"
                />
              </div>
              <div class="grid gap-6 sm:grid-cols-2">
                <div>
                  <label class="mb-2 block text-sm font-medium text-ink" for="chk-phone">Телефон</label>
                  <input
                    id="chk-phone"
                    v-model="phone"
                    type="tel"
                    autocomplete="tel"
                    placeholder="+7 …"
                    class="w-full rounded-2xl border border-line bg-paper px-5 py-3.5 text-ink outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-moss"
                  />
                </div>
                <div>
                  <label class="mb-2 block text-sm font-medium text-ink" for="chk-name">Имя</label>
                  <input
                    id="chk-name"
                    v-model="name"
                    type="text"
                    autocomplete="name"
                    placeholder="Как к вам обращаться"
                    class="w-full rounded-2xl border border-line bg-paper px-5 py-3.5 text-ink outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-moss"
                  />
                </div>
              </div>
            </div>

            <p
              v-if="error"
              class="mt-6 rounded-2xl border border-destructive/20 bg-destructive/5 px-5 py-4 text-sm text-destructive"
            >
              {{ error }}
            </p>

            <div class="mt-9 flex flex-col-reverse gap-3 border-t border-line pt-7 sm:flex-row sm:justify-between">
              <NuxtLink to="/shop/cart" class="btn-outline justify-center">
                <ArrowLeft class="h-4 w-4" />
                Назад в корзину
              </NuxtLink>
              <button
                type="submit"
                :disabled="loading"
                class="btn-moss justify-center disabled:cursor-wait disabled:opacity-50"
              >
                {{ loading ? 'Переходим…' : 'Перейти к оплате' }}
                <ArrowRight class="h-4 w-4" />
              </button>
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  </div>
</template>
