import {
  Search,
  GamepadRounded,
  AccessibilityNew,
  LibraryAdd,
  Home,
  ImportContacts,
  BugReport,
  People
} from '@material-ui/icons'

const usersMenus = {
  title: 'Users',
  to: '/users',
  submenus: [
    { title: 'Home', to: '/users/', icon: Home },
    { title: 'Directory', to: '/users/browse', icon: ImportContacts },
    { title: 'Search', to: '/users/search', icon: Search },
    { title: 'Report', to: '/report/users', icon: BugReport },
    { title: 'Your Profile', to: '/users/user', icon: People }
  ]
}

const teamsMenus = {
  title: 'Teams',
  to: '/teams',
  submenus: [
    { title: 'All teams', to: '/teams', icon: Search },
    { title: 'Your teams', to: '/teams/manage-teams', icon: GamepadRounded },
    { title: 'Team members', to: '/teams/team-members', icon: GamepadRounded },
    { title: 'Financial beings', to: '/teams/financial-beings', icon: GamepadRounded },
    { title: 'Report', to: '/report/teams', icon: LibraryAdd }
  ]
}

const eventsMenus = {
  title: 'Events',
  to: '/events',
  submenus: [
    { title: 'All events', to: '/events', icon: Search },
    { title: 'Your events', to: '/events/my', icon: GamepadRounded },
    { title: 'Your hosted events', to: '/events/host', icon: AccessibilityNew },
    { title: 'Host an event', to: '/events/create', icon: LibraryAdd },
    { title: 'Report', to: '/report/events', icon: LibraryAdd }
  ]
}

const keyvaultMenus = {
  title: 'Key Vault',
  to: '/key-vault',
  submenus: [
    { title: 'Manage keys', to: '/key-vault/browse', icon: Search },
    { title: 'Add key', to: '/key-vault/addKey', icon: GamepadRounded },
    { title: 'Report', to: '/report/key-vault', icon: LibraryAdd }
  ]
}

const allMenus = [ usersMenus, teamsMenus, eventsMenus, keyvaultMenus ]

export default allMenus
