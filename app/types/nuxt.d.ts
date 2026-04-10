declare module '#app' {
  interface NuxtApp {
    $openMap: (lat: number, lng: number, label?: string) => void
  }
}

export {}
