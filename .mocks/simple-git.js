const getRemotesResponse = [
  {
      name: 'origin',
      refs: {
      fetch: 'https://github.com/contributor/Superalgos',
      push: 'https://github.com/contributor/Superalgos'
      }
  },
  {
      name: 'upstream',
      refs: {
      fetch: 'https://github.com/Superalgos/Superalgos',
      push: 'https://github.com/Superalgos/Superalgos'
      }
  }
]

const branchLocalResponse = {
  all: [ 'develop', 'master' ],
  branches: {
    develop: {
      current: true,
      name: 'develop',
      commit: 'eb9999999',
      label: "the latest commit message"
    },
    master: {
      current: false,
      name: 'master',
      commit: '0afffffff',
      label: '[behind 9999] Merge pull request #9999 from contributor/branch'
    }
  },
  current: 'develop',
  detached: false
}

const removeRemoteResponse = {
  removed: 'https://github.com/contributor/Superalgos/branch'
}

module.exports = {
  getRemotesResponse,
  branchLocalResponse,
  removeRemoteResponse
}
