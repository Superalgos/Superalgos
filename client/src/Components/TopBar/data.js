import {
  Search,
  GamepadRounded,
  AccessibilityNew,
  LibraryAdd,
} from '@material-ui/icons';

const data = [
  {
    title: 'Look for an event', to: '/', icon: Search, text: '',
  },
  {
    title: 'Events you are enrolled in', to: '/my', icon: GamepadRounded, text: '',
  },
  {
    title: 'Your hosted competition', to: '/host', icon: AccessibilityNew, text: '',
  },
  {
    title: 'Host a new competition', to: '/create', icon: LibraryAdd, text: '',
  },
];

export default data;
