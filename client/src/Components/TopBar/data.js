import {
  Search,
  GamepadRounded,
  AccessibilityNew,
  LibraryAdd,
} from '@material-ui/icons';

const data = [
  {
    title: 'Look for an event', to: '/events/', icon: Search, text: '',
  },
  {
    title: 'Events you are enrolled in', to: '/events/my', icon: GamepadRounded, text: '',
  },
  {
    title: 'Your hosted competition', to: '/events/host', icon: AccessibilityNew, text: '',
  },
  {
    title: 'Host a new competition', to: '/events/create', icon: LibraryAdd, text: '',
  },
];

export default data;
