import { ref, onMounted, onUnmounted } from 'vue'

const BREAKPOINT = 1024
const mediaQuery = typeof window !== 'undefined'
  ? window.matchMedia(`(max-width: ${BREAKPOINT - 1}px)`)
  : null

// Singleton reactive state shared across all consumers
const isMobile = ref(mediaQuery ? mediaQuery.matches : false)

function handleChange(e) {
  isMobile.value = e.matches
}

// Track consumer count to manage single listener lifecycle
let consumers = 0

export function useIsMobile() {
  onMounted(() => {
    consumers++
    if (consumers === 1 && mediaQuery) {
      mediaQuery.addEventListener('change', handleChange)
    }
    // Sync in case media state changed while no consumers
    if (mediaQuery) {
      isMobile.value = mediaQuery.matches
    }
  })

  onUnmounted(() => {
    consumers--
    if (consumers === 0 && mediaQuery) {
      mediaQuery.removeEventListener('change', handleChange)
    }
  })

  return isMobile
}
