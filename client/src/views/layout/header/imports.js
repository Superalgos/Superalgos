import {
  Search,
  GamepadRounded,
  AccessibilityNew,
  LibraryAdd
} from '@material-ui/icons'

const usersMenus = {
  title: 'Users',
  to: '/events',
  submenus: [
    { title: 'Your profile', to: '/users/user', icon: Search },
    { title: 'Directory', to: '/users/browse', icon: GamepadRounded },
    { title: 'Search', to: '/users/search', icon: AccessibilityNew },
    { title: 'Report', to: '/report/users', icon: LibraryAdd }
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
  to: '/events',
  submenus: [
    { title: 'Manage keys', to: '/key-vault/browse', icon: Search },
    { title: 'Add key', to: '/key-vault/addKey', icon: GamepadRounded },
    { title: 'Report', to: '/report/key-vault', icon: LibraryAdd }
  ]
}

const allMenus = [ usersMenus, teamsMenus, eventsMenus, keyvaultMenus ]

export default allMenus
