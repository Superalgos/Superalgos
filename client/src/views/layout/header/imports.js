import {
  Search,
  GamepadRounded,
  AccessibilityNew,
  LibraryAdd,
  ImportContacts,
  BugReport,
  People,
  Group,
  Adb,
  VpnKey,
  AddCircleOutline
} from '@material-ui/icons'

const usersMenus = {
  title: 'Users',
  to: '/users',
  submenus: [
    { title: 'Directory', to: '/users/browse', icon: ImportContacts },
    { title: 'Search', to: '/users/search', icon: Search },
    { title: 'Report', to: 'https://github.com/AdvancedAlgos/UsersModule/issues/new', icon: BugReport, externalLink: true },
    { title: 'Your Profile', to: '/users/user', icon: People, authenticated: true }
  ]
}

const teamsMenus = {
  title: 'Teams',
  to: '/teams',
  submenus: [
    { title: 'All teams', to: '/teams', icon: Search },
    { title: 'Your teams', to: '/teams/manage-teams', icon: Group, authenticated: true },
    { title: 'Team members', to: '/teams/team-members', icon: People, authenticated: true },
    { title: 'Financial beings', to: '/teams/financial-beings', icon: Adb, authenticated: true },
    { title: 'Report', to: 'https://github.com/AdvancedAlgos/TeamsModule/issues/new', icon: BugReport, externalLink: true }
  ]
}

const eventsMenus = {
  title: 'Events',
  to: '/events',
  submenus: [
    { title: 'All events', to: '/events', icon: Search },
    { title: 'Your events', to: '/events/my', icon: GamepadRounded, authenticated: true },
    { title: 'Your hosted events', to: '/events/host', icon: AccessibilityNew, authenticated: true },
    { title: 'Host an event', to: '/events/create', icon: LibraryAdd, authenticated: true },
    { title: 'Report', to: 'https://github.com/AdvancedAlgos/UsersModule/issues/new', icon: BugReport, externalLink: true }
  ]
}

const keyvaultMenus = {
  title: 'Key Vault',
  to: '/key-vault',
  authenticated: true,
  submenus: [
    { title: 'Manage keys', to: '/key-vault/browse', icon: VpnKey },
    { title: 'Add key', to: '/key-vault/addKey', icon: AddCircleOutline },
    { title: 'Report', to: 'https://github.com/AdvancedAlgos/KeyVaultModule/issues/new', icon: BugReport, externalLink: true }
  ]
}

const allMenus = [ usersMenus, teamsMenus, eventsMenus, keyvaultMenus ]

export default allMenus
