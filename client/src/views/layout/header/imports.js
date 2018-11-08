import {
  Search,
  GamepadRounded,
  AccessibilityNew,
  LibraryAdd
} from '@material-ui/icons'

const eventsMenus = {
  title: 'Events',
  to: '/events',
  submenus: [
    { title: 'Look for an event', to: '/events', icon: Search, text: '' },
    { title: 'Events you are enrolled in', to: '/events/my', icon: GamepadRounded, text: '' },
    { title: 'Your hosted competition', to: '/events/host', icon: AccessibilityNew, text: '' },
    { title: 'Host a new competition', to: '/events/create', icon: LibraryAdd, text: '' }
  ]
}

const teamsMenus = {
  title: 'Teams',
  to: '/teams',
  submenus: [
    { title: 'All teams', to: '/teams', icon: Search, text: '' },
    { title: 'Your teams', to: '/teams/manage-teams', icon: GamepadRounded, text: '' }
  ]
}

const allMenus = [ eventsMenus, teamsMenus ]

export default allMenus
