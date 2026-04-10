<script setup lang="ts">
import { object, string, type InferType } from 'yup'

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
      (isNew ? 'Спасибо! Мы будем присылать новости на указанный адрес.' : 'Этот адрес уже есть в нашей рассылке.')
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
  <form class="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto" @submit.prevent="onSubmit">
    <input
      v-model="email"
      type="email"
      required
      placeholder="Ваш email"
      class="flex-1 px-4 py-3 rounded-lg border border-olivine-200 focus:outline-none focus:ring-2 focus:ring-olivine-400 bg-white"
    />
    <button
      type="submit"
      :disabled="submitting"
      class="px-6 py-3 bg-olivine-500 text-white font-medium rounded-lg hover:bg-olivine-600 transition-colors duration-200 disabled:opacity-50"
    >
      {{ submitting ? '…' : 'Подписаться' }}
    </button>
    <p v-if="errorMsg" class="text-red-600 text-sm w-full text-center sm:col-span-2">{{ errorMsg }}</p>
    <p v-if="successMsg" class="text-emerald-700 text-sm w-full text-center sm:col-span-2">{{ successMsg }}</p>
  </form>
</template>
