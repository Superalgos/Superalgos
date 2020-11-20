import {
  Search,
  GamepadRounded,
  AccessibilityNew,
  LibraryAdd,
  ImportContacts,
  BugReport,
  People,
  Group,
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

/*
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
*/

const eventsMenus = {
  title: 'Events',
  to: '/events',
  icon: Home,
  submenus: [
    { title: 'Directory', to: '/events', icon: ImportContacts },
    { title: 'Your hosted events', to: '/events/host', icon: AccessibilityNew, authenticated: true },
    { title: 'Host an event', to: '/events/create', icon: LibraryAdd, authenticated: true },
    { title: 'Report a Bug', to: 'https://github.com/Superalgos/EventsClientModule/issues/new', icon: BugReport, externalLink: true }
  ]
}

const keyvaultMenus = {
  title: 'Keys',
  to: '/keys',
  icon: Home,
  authenticated: true,
  submenus: [
    { title: 'Your keys', to: '/keys/browse', icon: VpnKey },
    { title: 'Add key', to: '/keys/addKey', icon: AddCircleOutline },
    { title: 'Report a Bug', to: 'https://github.com/Superalgos/KeyVaultModule/issues/new', icon: BugReport, externalLink: true }
  ]
}

const operationsMenus = {
  title: 'Clones',
  to: '/clones',
  icon: Home,
  authenticated: true,
  submenus: [
    { title: 'Active Clones', to: '/clones/browse', icon: ImportContacts },
    { title: 'History Clones', to: '/clones/history', icon: LibraryAdd },
    { title: 'Create Clone', to: '/clones/add', icon: AddCircleOutline },
    { title: 'Report a Bug', to: 'https://github.com/Superalgos/OperationsModule/issues/new', icon: BugReport, externalLink: true }
  ]
}

const cockpitMenus = {
  title: 'Cockpit',
  to: '/cockpit',
  icon: Home,
  authenticated: true,
  submenus: [
    { title: 'Signals', to: '/cockpit/signals', icon: GamepadRounded },
    { title: 'Report a Bug', to: 'https://github.com/Superalgos/CockpitClientModule/issues/new', icon: BugReport, externalLink: true }
  ]
}

/*
const strategizerMenus = {
  title: 'Strategizer',
  to: '/strategizer',
  icon: Home,
  authenticated: true,
  submenus: []
}
*/

const allMenus = [
  usersMenus,
  // teamsMenus,
  eventsMenus,
  keyvaultMenus,
  operationsMenus,
  // strategizerMenus,
  cockpitMenus
]

export default allMenus
