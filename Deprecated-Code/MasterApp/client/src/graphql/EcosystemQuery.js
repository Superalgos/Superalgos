import gql from 'graphql-tag'

export const ECOSYSTEM_QUERY = gql`
  query {
    web_GetEcosystem {
      id
      devTeams {
        codeName
        displayName
        host {
          url
          storage
          container
          accessKey
        }
        bots {
          codeName
          displayName
          type
          profilePicture
          repo
          configFile
          products{
            codeName
            displayName
            description
            dataSets{
              codeName
              type
              validPeriods
              filePath
              fileName
              dataRange{
                filePath
                fileName
              }
            }
            exchangeList{
              name
            }
            plotter{
              devTeam
              codeName
              moduleName
              repo
            }
          }
        }
        plotters {
          codeName
          displayName
          modules{
            codeName
            moduleName
            description
            profilePicture
            panels{
              codeName
              moduleName
              event
            }
          }
          repo
          configFile
        }
      }
      hosts {
        codeName
        displayName
        host {
          url
          storage
          container
          accessKey
        }
        competitions {
          codeName
          displayName
          description
          startDatetime
          finishDatetime
          formula
          plotter{
            devTeam
            codeName
            host{
              url
              storage
              container
              accessKey
            }
            moduleName
            repo
          }
          rules
          prizes
          participants
          repo
          configFile
        }
        plotters {
          codeName
          displayName
          modules{
            codeName
            moduleName
            description
            profilePicture
            panels{
              codeName
              moduleName
              event
            }
          }
          repo
          configFile
        }
      }
    }
  }
`
