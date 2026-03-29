<script setup lang="ts">
import { watch } from 'vue'
import { useImageViewer } from '../composables/useImageViewer'

const { activeImage, close } = useImageViewer()

// 打开时禁止背景滚动并监听 ESC 键
watch(activeImage, (val) => {
  if (typeof document === 'undefined') return
  if (val) {
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeydown)
  } else {
    document.body.style.overflow = ''
    document.removeEventListener('keydown', onKeydown)
  }
})

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="iv">
      <div
        v-if="activeImage"
        class="iv-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="图片预览"
        @click.self="close"
      >
        <button class="iv-close" @click="close" aria-label="关闭预览">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 2L16 16M16 2L2 16" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
          </svg>
        </button>

        <div class="iv-img-wrap">
          <img class="iv-img" :src="activeImage.src" :alt="activeImage.alt" />
        </div>

        <p v-if="activeImage.alt" class="iv-caption">{{ activeImage.alt }}</p>
      </div>
    </Transition>
  </Teleport>
</template>

<style>
/* 覆盖层 */
.iv-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.82);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  cursor: zoom-out;
  padding: 60px 24px 32px;
}

/* 图片包裹层（允许独立滚动大图） */
.iv-img-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 92vw;
  max-height: 82vh;
  overflow: auto;
}

.iv-img {
  max-width: 100%;
  max-height: 82vh;
  object-fit: contain;
  border-radius: 6px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.55);
  cursor: default;
  display: block;
}

/* 图片说明文字 */
.iv-caption {
  color: rgba(255, 255, 255, 0.65);
  font-size: 13px;
  text-align: center;
  max-width: 80vw;
  margin: 0;
  line-height: 1.5;
}

/* 关闭按钮 */
.iv-close {
  position: absolute;
  top: 18px;
  right: 20px;
  width: 38px;
  height: 38px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, transform 0.15s;
  padding: 0;
}
.iv-close:hover {
  background: rgba(255, 255, 255, 0.22);
  transform: scale(1.08);
}

/* 进入 / 离开动画 */
.iv-enter-active {
  transition: opacity 0.22s ease;
}
.iv-leave-active {
  transition: opacity 0.18s ease;
}
.iv-enter-from,
.iv-leave-to {
  opacity: 0;
}
.iv-enter-active .iv-img-wrap {
  transition: transform 0.22s ease;
}
.iv-enter-from .iv-img-wrap {
  transform: scale(0.9);
}

/* 文章内图片统一显示放大光标 */
.vp-doc img {
  cursor: zoom-in;
}
</style>
