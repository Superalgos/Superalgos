import { client } from '../graphql/apollo'
import { ECOSYSTEM_QUERY } from '../graphql/EcosystemQuery'
import Log from './log'

export async function setInitialEcosystem() {
    try {
      const ecosystem = await client.query({ query: ECOSYSTEM_QUERY })
      window.localStorage.setItem('ecosystem', JSON.stringify(ecosystem.data.web_GetEcosystem))
    } catch (error) {
      Log.error('Error getting the ecosystem: ' + error)
    }
  }
