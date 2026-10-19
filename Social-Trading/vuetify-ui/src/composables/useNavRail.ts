import { computed, ref } from 'vue'
import { useDisplay } from 'vuetify'

const STORAGE_KEY = 'ft-nav-rail-collapsed'

const stored = ref(localStorage.getItem(STORAGE_KEY) === '1')

export function useNavRail() {
  const { md } = useDisplay()

  const collapsed = computed(() => stored.value && md.value)

  function toggleRail() {
    stored.value = !stored.value
    localStorage.setItem(STORAGE_KEY, stored.value ? '1' : '0')
  }

  return {
    collapsed,
    toggleRail,
  }
}
