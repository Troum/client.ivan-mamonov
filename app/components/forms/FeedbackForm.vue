<script setup lang="ts">
import { object, string, type InferType } from 'yup'

const props = defineProps<{
  theme: string | undefined
}>()

const { submitFeedback } = usePublicApi()

const schema = object({
  email: string()
    .required('Без электронной почты мы не сможем связаться')
    .email('Электронная почта должна быть реальной'),
  theme: string().required('Без темы сообщения очень сложно понять, чего Вы хотели бы'),
  message: string()
    .required('Без сообщения мы вряд ли сможем начать диалог')
    .min(10, 'Сообщение должно быть не короче 10 символов'),
})

type Schema = InferType<typeof schema>

const email = ref('')
const message = ref('')
const themeField = ref(props.theme ?? '')
const submitting = ref(false)
const errorMsg = ref<string | null>(null)
const success = ref(false)

watch(
  () => props.theme,
  (t) => {
    if (t) themeField.value = t
  }
)

function validationMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'data' in err) {
    const data = (err as { data?: { message?: string; errors?: Record<string, string[]> } }).data
    if (data?.message) return data.message
    const first = data?.errors && Object.values(data.errors)[0]?.[0]
    if (first) return first
  }
  if (err instanceof Error) return err.message
  return 'Не удалось отправить сообщение'
}

async function onSubmit() {
  errorMsg.value = null
  submitting.value = true
  try {
    const data: Schema = {
      email: email.value.trim(),
      theme: themeField.value.trim(),
      message: message.value.trim(),
    }
    await schema.validate(data, { abortEarly: false })
    await submitFeedback({
      email: data.email,
      theme: data.theme,
      message: data.message,
    })
    success.value = true
    email.value = ''
    message.value = ''
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'errors' in err) {
      errorMsg.value = (err as { errors?: string[] }).errors?.[0] ?? validationMessage(err)
    } else {
      errorMsg.value = validationMessage(err)
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="onSubmit">
    <div v-if="success" class="rounded-lg bg-emerald-50 text-emerald-900 px-4 py-3 text-sm">
      Мы получили ваше сообщение и свяжемся с вами по e-mail.
    </div>
    <p v-if="errorMsg" class="text-red-600 text-sm">{{ errorMsg }}</p>

    <div>
      <label for="fb-email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
      <input
        id="fb-email"
        v-model="email"
        type="email"
        required
        autocomplete="email"
        class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-olivine-400 bg-white"
        placeholder="you@example.com"
      />
    </div>

    <input v-model="themeField" type="hidden" name="theme" />

    <div>
      <label for="fb-message" class="block text-sm font-medium text-gray-700 mb-1">Сообщение</label>
      <textarea
        id="fb-message"
        v-model="message"
        required
        rows="4"
        class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-olivine-400 bg-white resize-none"
        placeholder="Ваше сообщение…"
      />
    </div>

    <button
      type="submit"
      :disabled="submitting"
      class="w-full py-3 px-6 bg-olivine-500 text-white font-medium rounded-lg hover:bg-olivine-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      <span v-if="submitting" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      {{ submitting ? 'Отправка…' : 'Отправить' }}
    </button>
  </form>
</template>
