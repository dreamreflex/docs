<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { useRouter } from 'vitepress'
import { onMounted, nextTick } from 'vue'
import SearchBox from './components/SearchBox.vue'
import ImageViewer from './components/ImageViewer.vue'
import { useImageViewer } from './composables/useImageViewer'

// DefaultTheme 是主题配置对象，Layout 才是真正的 Vue 组件
const { Layout } = DefaultTheme

const { open } = useImageViewer()
const router = useRouter()

function attachImageZoom() {
  nextTick(() => {
    document.querySelectorAll<HTMLImageElement>('.vp-doc img').forEach((img) => {
      if (img.dataset.zoomAttached) return
      img.dataset.zoomAttached = 'true'
      img.addEventListener('click', () => open(img.src, img.alt ?? ''))
    })
  })
}

onMounted(attachImageZoom)
router.onAfterRouteChanged = attachImageZoom
</script>

<template>
  <Layout>
    <template #navbar-extra>
      <SearchBox />
    </template>
  </Layout>
  <ImageViewer />
</template>


