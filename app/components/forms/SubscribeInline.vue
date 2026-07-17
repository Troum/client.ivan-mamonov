<script setup lang="ts">
import { ArrowRight, Check } from '@lucide/vue'
import { object, string, type InferType } from 'yup'

const props = withDefaults(
  defineProps<{
    dark?: boolean
    compact?: boolean
  }>(),
  {
    dark: false,
    compact: false,
  },
)

const { subscribeNewsletter } = usePublicApi()

const schema = object({
  email: string().required('Укажите электронную почту').email('Некорректный адрес e-mail'),
})

type Schema = InferType<typeof schema>

const email = ref('')
const submitting = ref(false)
const errorMsg = ref<string | null>(null)
const successMsg = ref<string | null>(null)

function parseError(err: unknown): string {
  if (err && typeof err === 'object' && 'data' in err) {
    const data = (err as { data?: { message?: string; errors?: Record<string, string[]> } }).data
    if (data?.message) return data.message
    const first = data?.errors && Object.values(data.errors)[0]?.[0]
    if (first) return first
  }
  if (err instanceof Error) return err.message
  return 'Не удалось оформить подписку'
}

async function onSubmit() {
  errorMsg.value = null
  successMsg.value = null
  submitting.value = true
  try {
    const data: Schema = { email: email.value.trim() }
    await schema.validate(data)
    const res = (await subscribeNewsletter(data.email)) as {
      message?: string
      data?: { is_new_subscriber?: boolean }
    }
    const isNew = res.data?.is_new_subscriber !== false
    successMsg.value =
      res.message ||
      (isNew
        ? 'Готово! Вы первым узнаете о новых материалах.'
        : 'Этот адрес уже есть в нашей рассылке.')
    email.value = ''
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'errors' in err) {
      errorMsg.value = (err as { errors?: string[] }).errors?.[0] ?? parseError(err)
    } else {
      errorMsg.value = parseError(err)
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="w-full">
    <div
      v-if="successMsg"
      :class="[
        'flex items-center gap-3 rounded-2xl border px-5',
        compact ? 'py-3' : 'py-4',
        dark
          ? 'border-white/15 bg-white/5 text-paper'
          : 'border-moss/25 bg-moss-wash text-moss-dark',
      ]"
    >
      <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-moss text-white">
        <Check class="h-4 w-4" />
      </span>
      <p class="text-sm font-medium">{{ successMsg }}</p>
    </div>

    <form v-else class="w-full" @submit.prevent="onSubmit">
      <div
        :class="[
          'flex items-center gap-2 rounded-full border p-1.5 pl-5 transition-colors focus-within:border-moss',
          dark ? 'border-white/15 bg-white/5' : 'border-line bg-white',
        ]"
      >
        <input
          v-model="email"
          type="email"
          required
          placeholder="Ваш email"
          :class="[
            'w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/70',
            dark ? 'text-paper' : 'text-ink',
          ]"
        />
        <button
          type="submit"
          :disabled="submitting"
          class="group inline-flex shrink-0 items-center gap-2 rounded-full bg-moss px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-moss-dark disabled:opacity-50"
        >
          {{ submitting ? '…' : 'Подписаться' }}
          <ArrowRight
            class="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
          />
        </button>
      </div>
      <p v-if="errorMsg" class="mt-2 text-sm text-red-500">{{ errorMsg }}</p>
    </form>
  </div>
</template>
