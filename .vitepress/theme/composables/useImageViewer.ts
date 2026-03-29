import { shallowRef } from 'vue'

interface ImageState {
  src: string
  alt: string
}

// 模块级单例：所有组件共享同一个响应式状态
const activeImage = shallowRef<ImageState | null>(null)

export function useImageViewer() {
  function open(src: string, alt: string) {
    activeImage.value = { src, alt }
  }

  function close() {
    activeImage.value = null
  }

  return { activeImage, open, close }
}
