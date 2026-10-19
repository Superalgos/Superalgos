import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePersonaStore, type Persona } from '@/stores/persona'

export function usePersona() {
  const route = useRoute()
  const router = useRouter()
  const store = usePersonaStore()

  const personaId = computed(() => {
    const id = route.params.personaId
    return typeof id === 'string' ? id : 'none'
  })

  const persona = computed<Persona | null>(() => {
    if (personaId.value === 'none') return null
    return store.byId[personaId.value] ?? null
  })

  const personas = computed(() => store.allPersonas)

  const loading = computed(() => store.loading)
  const error = computed(() => store.error)

  function selectPersona(newId: string) {
    const newPath = route.path.replace(/^\/p\/[^/]+/, `/p/${newId}`)
    router.push(newPath)
  }

  /*
   * Selection restoration (old app.js:90-106 semantics): last-used persona
   * from localStorage if it still exists in the store, else the first
   * discovered persona, else null (no personas at all).
   */
  function resolveInitialPersonaId(): string | null {
    const stored = localStorage.getItem('ft-last-persona-id')
    if (stored && store.byId[stored]) return stored
    return store.allIds[0] ?? null
  }

  return { personaId, persona, personas, loading, error, selectPersona, resolveInitialPersonaId }
}
