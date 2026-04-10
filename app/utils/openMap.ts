export function openMap(latitude: number, longitude: number, label = ''): void {
  const isAppleDevice = /iPad|iPhone|iPod/.test(navigator.userAgent)
  const isAndroidDevice = /Android/.test(navigator.userAgent)
  const isWindowsDevice = /Windows/.test(navigator.userAgent)
  const isYandexBrowser = /YaBrowser/.test(navigator.userAgent)
  const coordinates = `${latitude},${longitude}`

  let url = `https://maps.google.com/?q=${coordinates}(${encodeURIComponent(label)})`

  if (isAppleDevice) {
    url = `http://maps.apple.com/?ll=${coordinates}&q=${encodeURIComponent(label)}`
  } else if (isYandexBrowser || (!isAppleDevice && !isAndroidDevice && !isWindowsDevice)) {
    url = `https://yandex.com/maps/?ll=${longitude},${latitude}&z=8&l=map&pt=${longitude},${latitude},pm2rdm`
  }

  window.open(url, '_blank')
}
