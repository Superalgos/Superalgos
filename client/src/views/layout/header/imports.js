import {
  Search,
  GamepadRounded,
  AccessibilityNew,
  LibraryAdd,
  ImportContacts,
  BugReport,
  People,
  Group,
  // Adb,
  VpnKey,
  Home,
  AddCircleOutline,
  ViewModule
} from '@material-ui/icons'

const usersMenus = {
  title: 'Users',
  to: '/users',
  icon: Home,
  submenus: [
    { title: 'Directory', to: '/users/browse', icon: ImportContacts },
    { title: 'Search', to: '/users/search', icon: Search },
    { title: 'Your Profile', to: '/users/user', icon: People, authenticated: true },
    { title: 'Report a Bug', to: 'https://github.com/Superalgos/UsersModule/issues/new', icon: BugReport, externalLink: true }
  ]
}

const teamsMenus = {
  title: 'Teams',
  to: '/teams',
  icon: Home,
  submenus: [
    { title: 'Directory', to: '/teams/explore', icon: ImportContacts },
    { title: 'Your teams', to: '/teams/manage-teams', icon: Group, authenticated: true },
    { title: 'Team members', to: '/teams/team-members', icon: People, authenticated: true },
    { title: 'Report a Bug', to: 'https://github.com/Superalgos/TeamsModule/issues/new', icon: BugReport, externalLink: true }
  ]
}

const eventsMenus = {
  title: 'Events',
  to: '/events',
  icon: Home,
  submenus: [
    { title: 'Directory', to: '/events', icon: ImportContacts },
    { title: 'Your events', to: '/events/my', icon: GamepadRounded, authenticated: true },
    { title: 'Your hosted events', to: '/events/host', icon: AccessibilityNew, authenticated: true },
    { title: 'Host an event', to: '/events/create', icon: LibraryAdd, authenticated: true },
    { title: 'Report a Bug', to: 'https://github.com/Superalgos/UsersModule/issues/new', icon: BugReport, externalLink: true }
  ]
}

const keyvaultMenus = {
  title: 'Key Vault',
  to: '/key-vault',
  icon: Home,
  authenticated: true,
  submenus: [
    { title: 'Your keys', to: '/key-vault/browse', icon: VpnKey },
    { title: 'Add key', to: '/key-vault/addKey', icon: AddCircleOutline },
    { title: 'Report a Bug', to: 'https://github.com/Superalgos/KeyVaultModule/issues/new', icon: BugReport, externalLink: true }
  ]
}

const operationsMenus = {
  title: 'Operations',
  to: '/operations',
  icon: Home,
  authenticated: true,
  submenus: [
    { title: 'Active clones', to: '/operations/browse', icon: ImportContacts },
    { title: 'History', to: '/operations/history', icon: LibraryAdd },
    { title: 'Clone a bot', to: '/operations/add', icon: AddCircleOutline },
    { title: 'Report a Bug', to: 'https://github.com/Superalgos/OperationsModule/issues/new', icon: BugReport, externalLink: true }
  ]
}

const financialBeingsMenus = {
  title: 'FBs',
  to: '/financial-beings',
  icon: Home,
  authenticated: false,
  submenus: [
    { title: 'Directory', to: '/financial-beings', icon: ImportContacts }
  ]
}

const strategizerMenus = {
  title: 'Strategizer',
  to: '/strategizer',
  icon: Home,
  authenticated: false,
  submenus: [
    { title: 'Your strategies', to: '/strategizer/manage-strategies', icon: ViewModule, authenticated: false },
    { title: 'Report a Bug', to: 'https://github.com/Superalgos/StrategizerClientModule/issues/new', icon: BugReport, externalLink: true }
  ]
}

const allMenus = [
  usersMenus,
  teamsMenus,
  // eventsMenus,
  // financialBeingsMenus,
  keyvaultMenus,
  operationsMenus,
  strategizerMenus
]

export default allMenus
