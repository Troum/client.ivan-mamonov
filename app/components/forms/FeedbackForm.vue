<script setup lang="ts">
import { ArrowRight, Check } from '@lucide/vue'
import { object, string, type InferType } from 'yup'

const props = defineProps<{
  theme: string | undefined
  themeLabel?: string
}>()

const emit = defineEmits<{
  reset: []
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
  },
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

function resetForm() {
  success.value = false
  errorMsg.value = null
  message.value = ''
  emit('reset')
}
</script>

<template>
  <div>
    <div
      v-if="success"
      class="flex min-h-[420px] flex-col items-center justify-center text-center"
    >
      <span class="flex h-16 w-16 items-center justify-center rounded-full bg-moss text-white">
        <Check class="h-7 w-7" />
      </span>
      <h3 class="mt-7 font-display text-3xl font-semibold text-ink">Сообщение отправлено</h3>
      <p class="mt-3 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
        Спасибо! Я свяжусь с вами в ближайшее время
        <template v-if="themeLabel"> по теме «{{ themeLabel.toLowerCase() }}»</template>.
      </p>
      <button
        type="button"
        class="link-underline mt-8 text-[13.5px] font-semibold text-moss"
        @click="resetForm"
      >
        Отправить ещё одно сообщение
      </button>
    </div>

    <form v-else @submit.prevent="onSubmit">
      <h3 class="font-display text-2xl font-semibold text-ink">Отправить сообщение</h3>

      <slot name="themes" />

      <p v-if="errorMsg" class="mt-4 text-sm text-red-600">{{ errorMsg }}</p>

      <input v-model="themeField" type="hidden" name="theme" />

      <label class="mt-7 block">
        <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Email
        </span>
        <input
          v-model="email"
          type="email"
          required
          autocomplete="email"
          placeholder="you@example.com"
          class="mt-2.5 w-full rounded-2xl border border-line bg-paper px-5 py-3.5 text-[15px] text-ink outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-moss"
        />
      </label>

      <label class="mt-5 block">
        <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Сообщение
        </span>
        <textarea
          v-model="message"
          required
          rows="5"
          placeholder="Расскажите о вашей идее или задаче…"
          class="mt-2.5 w-full resize-none rounded-2xl border border-line bg-paper px-5 py-3.5 text-[15px] text-ink outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-moss"
        />
      </label>

      <button
        type="submit"
        :disabled="submitting"
        class="group mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-moss px-7 py-4 text-[14.5px] font-semibold text-white transition-colors hover:bg-moss-dark disabled:opacity-50"
      >
        {{ submitting ? 'Отправка…' : 'Отправить сообщение' }}
        <ArrowRight
          class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
        />
      </button>
    </form>
  </div>
</template>
